"use client";

import type { AttendanceStatus } from "@/types";

interface ChipProps {
  status: AttendanceStatus;
}

const config: Record<AttendanceStatus, { label: string; bg: string; text: string }> = {
  present: { label: "Presente", bg: "bg-present-container", text: "text-present" },
  absent: { label: "Ausente", bg: "bg-absent-container", text: "text-absent" },
  justified: { label: "Justificado", bg: "bg-justified-container", text: "text-justified" },
};

export default function Chip({ status }: ChipProps) {
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold tracking-wide ${c.bg} ${c.text}`}>
      <span className={`h-2 w-2 rounded-full ${status === "present" ? "bg-present" : status === "absent" ? "bg-absent" : "bg-justified"}`} />
      {c.label}
    </span>
  );
}
