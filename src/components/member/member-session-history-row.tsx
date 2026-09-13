"use client";

import type { MemberSessionAttendance } from "@/hooks/useMemberStats";

interface MemberSessionHistoryRowProps {
  entry: MemberSessionAttendance;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

export default function MemberSessionHistoryRow({ entry }: MemberSessionHistoryRowProps) {
  const statusClass =
    entry.status === "present"
      ? "text-present"
      : entry.status === "justified"
        ? "text-justified"
        : "text-absent";

  const statusLabel =
    entry.status === "present"
      ? "Presente"
      : entry.status === "justified"
        ? "Justificado"
        : "Ausente";

  return (
    <div className="mb-2 flex items-start justify-between rounded-md bg-surface-container-lowest p-4">
      <div className="min-w-0 flex-1 pr-2">
        <p className="text-sm text-on-surface">{formatDate(entry.date)}</p>
        {entry.justificationSummary ? (
          <p className="mt-1 line-clamp-4 text-sm text-on-surface-variant">
            {entry.justificationSummary}
          </p>
        ) : null}
      </div>
      <p className={`shrink-0 text-sm font-semibold ${statusClass}`}>{statusLabel}</p>
    </div>
  );
}
