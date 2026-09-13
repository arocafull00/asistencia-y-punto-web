import Papa from "papaparse";

import {
  JUSTIFICATION_REASON_OPTIONS,
  JUSTIFICATION_REASON_OTHER,
} from "@/constants/justification-reasons";
import { db } from "@/db";
import type { AttendanceStatus } from "@/db/schema";
import { dateFromInputValue, formatCsvDate } from "@/utils/dates";

const SUMMARY_COLUMNS = new Set([
  "Total Presente",
  "Total Ausente",
  "Total Justificado",
  "% Asistencia",
]);

const DATE_COLUMN_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const LABEL_TO_KEY = new Map<string, string>(
  JUSTIFICATION_REASON_OPTIONS.map((option) => [option.label.toLowerCase(), option.key]),
);

export interface ParsedAttendanceCell {
  status: AttendanceStatus;
  justificationReason: string | null;
  justificationNote: string | null;
}

export interface ParsedCsvMember {
  name: string;
  notes: string;
  attendances: Record<string, ParsedAttendanceCell>;
}

export interface ParsedCsvPreview {
  suggestedGroupName: string;
  members: ParsedCsvMember[];
  sessionDates: string[];
  attendanceCount: number;
}

export interface ImportSummary {
  createdMembers: number;
  updatedMembers: number;
  createdSessions: number;
  createdAttendances: number;
  updatedAttendances: number;
}

export interface ImportGroupCsvResult {
  groupId: number;
  summary: ImportSummary;
}

export type ImportDestination =
  | { type: "new"; groupName: string }
  | { type: "existing"; groupId: number };

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

export function deriveGroupNameFromFileName(fileName: string): string {
  const withoutExtension = fileName.replace(/\.csv$/i, "");
  const withoutSuffix = withoutExtension.replace(/_asistencia$/i, "");
  return withoutSuffix.replace(/_/g, " ").trim() || "Grupo importado";
}

function parseStatusCell(value: string): ParsedAttendanceCell | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed === "P") {
    return { status: "present", justificationReason: null, justificationNote: null };
  }

  if (trimmed === "A") {
    return { status: "absent", justificationReason: null, justificationNote: null };
  }

  if (trimmed === "J") {
    return { status: "justified", justificationReason: null, justificationNote: null };
  }

  if (!trimmed.startsWith("J:")) {
    throw new Error(`Estado no reconocido: "${trimmed}"`);
  }

  const detail = trimmed.slice(2).trim();
  if (!detail) {
    return { status: "justified", justificationReason: null, justificationNote: null };
  }

  const key = LABEL_TO_KEY.get(detail.toLowerCase());
  if (key) {
    if (key === JUSTIFICATION_REASON_OTHER) {
      return {
        status: "justified",
        justificationReason: JUSTIFICATION_REASON_OTHER,
        justificationNote: null,
      };
    }

    return {
      status: "justified",
      justificationReason: key,
      justificationNote: null,
    };
  }

  return {
    status: "justified",
    justificationReason: JUSTIFICATION_REASON_OTHER,
    justificationNote: detail,
  };
}

function validateDateColumn(dateStr: string): void {
  if (!DATE_COLUMN_PATTERN.test(dateStr)) {
    throw new Error(`Fecha de columna no válida: "${dateStr}"`);
  }

  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new Error(`Fecha de columna no válida: "${dateStr}"`);
  }
}

export function parseGroupCsv(content: string, fileName: string): ParsedCsvPreview {
  const result = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.replace(/^\uFEFF/, "").trim(),
  });

  if (result.errors.length > 0) {
    throw new Error(`Error al leer CSV: ${result.errors[0].message}`);
  }

  const fields = result.meta.fields ?? [];
  if (!fields.includes("Nombre")) {
    throw new Error('El CSV debe incluir la columna "Nombre"');
  }

  if (!fields.includes("Notas")) {
    throw new Error('El CSV debe incluir la columna "Notas"');
  }

  const sessionDates: string[] = [];
  for (const field of fields) {
    if (SUMMARY_COLUMNS.has(field)) continue;
    if (field === "Nombre" || field === "Notas") continue;

    if (DATE_COLUMN_PATTERN.test(field)) {
      validateDateColumn(field);
      sessionDates.push(field);
      continue;
    }

    throw new Error(`Columna no reconocida: "${field}"`);
  }

  if (result.data.length === 0) {
    throw new Error("El CSV no contiene filas de datos");
  }

  const seenNames = new Set<string>();
  const members: ParsedCsvMember[] = [];
  let attendanceCount = 0;

  for (const row of result.data) {
    const name = (row.Nombre ?? "").trim();
    if (!name) {
      throw new Error("Hay una fila sin nombre de integrante");
    }

    const normalized = normalizeName(name);
    if (seenNames.has(normalized)) {
      throw new Error(`Nombre duplicado en el CSV: "${name}"`);
    }

    seenNames.add(normalized);

    const notes = (row.Notas ?? "").trim();
    const attendances: Record<string, ParsedAttendanceCell> = {};

    for (const dateStr of sessionDates) {
      const parsed = parseStatusCell(row[dateStr] ?? "");
      if (!parsed) continue;

      attendances[dateStr] = parsed;
      attendanceCount++;
    }

    members.push({ name, notes, attendances });
  }

  return {
    suggestedGroupName: deriveGroupNameFromFileName(fileName),
    members,
    sessionDates,
    attendanceCount,
  };
}

export async function importGroupCsv(
  preview: ParsedCsvPreview,
  destination: ImportDestination,
): Promise<ImportGroupCsvResult> {
  const summary: ImportSummary = {
    createdMembers: 0,
    updatedMembers: 0,
    createdSessions: 0,
    createdAttendances: 0,
    updatedAttendances: 0,
  };

  return db.transaction("rw", [db.groups, db.members, db.sessions, db.attendances], async () => {
    let groupId: number;

    if (destination.type === "new") {
      const trimmedName = destination.groupName.trim();
      if (!trimmedName) {
        throw new Error("El nombre del grupo es obligatorio");
      }

      const now = new Date();
      groupId = await db.groups.add({
        name: trimmedName,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      groupId = destination.groupId;
      const existingGroup = await db.groups.get(groupId);
      if (!existingGroup) {
        throw new Error("El grupo seleccionado no existe");
      }
    }

    const existingMembers = await db.members.where("groupId").equals(groupId).toArray();
    const memberIdByName = new Map<string, number>();
    for (const member of existingMembers) {
      memberIdByName.set(normalizeName(member.name), member.id!);
    }

    const existingSessions = await db.sessions.where("groupId").equals(groupId).toArray();
    const sessionIdByDateKey = new Map<string, number>();
    for (const session of existingSessions) {
      sessionIdByDateKey.set(formatCsvDate(new Date(session.date)), session.id!);
    }

    for (const parsedMember of preview.members) {
      const normalized = normalizeName(parsedMember.name);
      let memberId = memberIdByName.get(normalized);

      if (memberId !== undefined) {
        if (parsedMember.notes) {
          await db.members.update(memberId, { notes: parsedMember.notes });
          summary.updatedMembers++;
        }
      } else {
        memberId = await db.members.add({
          groupId,
          name: parsedMember.name,
          notes: parsedMember.notes || null,
          createdAt: new Date(),
        });
        memberIdByName.set(normalized, memberId);
        summary.createdMembers++;
      }

      for (const [dateKey, attendance] of Object.entries(parsedMember.attendances)) {
        let sessionId = sessionIdByDateKey.get(dateKey);

        if (sessionId === undefined) {
          sessionId = await db.sessions.add({
            groupId,
            date: dateFromInputValue(dateKey),
            createdAt: new Date(),
          });
          sessionIdByDateKey.set(dateKey, sessionId);
          summary.createdSessions++;
        }

        const existing = await db.attendances
          .where("[sessionId+memberId]")
          .equals([sessionId, memberId])
          .first();

        if (existing) {
          await db.attendances.update(existing.id!, {
            status: attendance.status,
            justificationReason: attendance.justificationReason,
            justificationNote: attendance.justificationNote,
          });
          summary.updatedAttendances++;
          continue;
        }

        await db.attendances.add({
          sessionId,
          memberId,
          status: attendance.status,
          justificationReason: attendance.justificationReason,
          justificationNote: attendance.justificationNote,
          createdAt: new Date(),
        });
        summary.createdAttendances++;
      }
    }

    if (destination.type === "existing") {
      await db.groups.update(groupId, { updatedAt: new Date() });
    }

    return { groupId, summary };
  });
}

export async function readCsvFile(file: File): Promise<{ content: string; fileName: string }> {
  const content = await file.text();
  return { content, fileName: file.name };
}
