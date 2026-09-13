import { formatJustificationSummary } from "@/constants/justification-reasons";
import { db } from "@/db";
import type { Attendance } from "@/db/schema";
import { formatCsvDate } from "@/utils/dates";

function escapeCsv(value: string) {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function escapeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ\s-]/g, "").replace(/\s+/g, "_");
}

export async function exportGroupCsv(groupId: number, groupName: string) {
  const groupMembers = await db.members.where("groupId").equals(groupId).toArray();
  const groupSessions = await db.sessions.where("groupId").equals(groupId).toArray();
  groupSessions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const attendanceMap = new Map<number, Map<number, Attendance>>();
  for (const member of groupMembers) {
    attendanceMap.set(member.id!, new Map());
  }

  for (const session of groupSessions) {
    const sessionAttendances = await db.attendances
      .where("sessionId")
      .equals(session.id!)
      .toArray();
    for (const att of sessionAttendances) {
      const memberMap = attendanceMap.get(att.memberId);
      if (memberMap) {
        memberMap.set(att.sessionId, att);
      }
    }
  }

  const headers = [
    "Nombre",
    "Notas",
    ...groupSessions.map((s) => formatCsvDate(new Date(s.date))),
    "Total Presente",
    "Total Ausente",
    "Total Justificado",
    "% Asistencia",
  ];
  const lines = [headers.join(",")];

  for (const member of groupMembers) {
    const memberAttendances = attendanceMap.get(member.id!)!;
    let present = 0;
    let absent = 0;
    let justified = 0;
    const statuses: string[] = [];

    for (const session of groupSessions) {
      const att = memberAttendances.get(session.id!);
      const status = att?.status;
      if (status === "present") {
        statuses.push("P");
        present++;
      } else if (status === "absent") {
        statuses.push("A");
        absent++;
      } else if (status === "justified") {
        if (!att) {
          statuses.push("");
        } else {
          const detail = formatJustificationSummary(att.justificationReason, att.justificationNote);
          statuses.push(detail ? `J: ${detail}` : "J");
          justified++;
        }
      } else {
        statuses.push("");
      }
    }

    const total = present + absent + justified;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    const row = [
      escapeCsv(member.name),
      escapeCsv(member.notes || ""),
      ...statuses,
      String(present),
      String(absent),
      String(justified),
      `${rate}%`,
    ];
    lines.push(row.join(","));
  }

  const csvContent = lines.join("\n");
  const fileName = `${escapeFileName(groupName)}_asistencia.csv`;
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  const file = new File([blob], fileName, { type: "text/csv" });

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: "Exportar asistencia",
    });
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
