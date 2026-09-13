"use client";

import { getInitials } from "@/utils/initials";

interface RankingRowProps {
  rank: number;
  name: string;
  rate: number;
  absentCount: number;
  justifiedCount: number;
}

export default function RankingRow({
  rank,
  name,
  rate,
  absentCount,
  justifiedCount,
}: RankingRowProps) {
  return (
    <div className="flex items-center border-b border-outline-variant px-4 py-2">
      <span className="w-7 text-sm font-bold text-primary">{String(rank).padStart(2, "0")}</span>
      <div className="mr-2 flex min-w-0 flex-1 items-center gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-surface-variant">
          <span className="text-[10px] font-bold text-on-surface-variant">{getInitials(name)}</span>
        </div>
        <span className="truncate text-xs font-semibold uppercase text-on-surface">{name}</span>
      </div>
      <span className="w-12 text-right text-[13px] font-semibold text-on-surface">{rate}%</span>
      <span className="w-12 text-right text-xs text-on-surface-variant">{absentCount}</span>
      <span className="w-12 text-right text-xs text-on-surface-variant">{justifiedCount}</span>
    </div>
  );
}
