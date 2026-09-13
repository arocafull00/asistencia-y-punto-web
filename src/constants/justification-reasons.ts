export const JUSTIFICATION_REASON_OTHER = "other" as const;

export type JustificationReasonKey =
  | "medical_leave"
  | "work"
  | "studies"
  | "official_appointment"
  | typeof JUSTIFICATION_REASON_OTHER;

export const JUSTIFICATION_REASON_OPTIONS = [
  { key: "medical_leave" as const, label: "Baja médica" },
  { key: "work" as const, label: "Trabajo" },
  { key: "studies" as const, label: "Estudios" },
  { key: "official_appointment" as const, label: "Cita oficial" },
  { key: JUSTIFICATION_REASON_OTHER, label: "Otra" },
] as const satisfies readonly { key: JustificationReasonKey; label: string }[];

const LABEL_BY_STORED_KEY = new Map<string, string>(
  JUSTIFICATION_REASON_OPTIONS.map((o) => [o.key, o.label]),
);

export function formatJustificationSummary(
  reasonKey: string | null | undefined,
  note: string | null | undefined,
): string {
  if (!reasonKey) {
    if (note?.trim()) return note.trim();
    return "";
  }
  if (reasonKey === JUSTIFICATION_REASON_OTHER) {
    const trimmed = note?.trim() ?? "";
    if (trimmed) return trimmed;
    return LABEL_BY_STORED_KEY.get(reasonKey) ?? "Otra";
  }
  return LABEL_BY_STORED_KEY.get(reasonKey) ?? reasonKey;
}
