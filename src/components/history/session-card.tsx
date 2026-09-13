"use client";

import { chevronForwardOutline } from "ionicons/icons";
import Link from "next/link";

import { IonIcon } from "@/components/shared/ion-icon";
import type { SessionSummary } from "@/types";
import { formatShortDate } from "@/utils/dates";

interface SessionCardProps {
  session: SessionSummary;
  groupId: number;
}

export default function SessionCard({ session, groupId }: SessionCardProps) {
  return (
    <Link
      href={`/attendance/${session.id}?groupId=${groupId}`}
      className="mx-6 mb-2 flex items-center justify-between rounded-lg border border-outline-variant bg-surface-container-lowest p-4 active:bg-surface-container-low active:opacity-70"
    >
      <p className="text-sm font-semibold text-on-surface">{formatShortDate(session.date)}</p>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p
            className={`text-xl font-bold ${
              session.attendanceRate > 0 ? "text-primary" : "text-on-surface-variant"
            }`}
          >
            {session.attendanceRate > 0 ? `${session.attendanceRate}%` : "--%"}
          </p>
          <p className="text-[10px] font-semibold tracking-wide text-on-surface-variant">ASISTENCIA</p>
        </div>
        <IonIcon icon={chevronForwardOutline} className="h-4 w-4 text-on-surface-variant" />
      </div>
    </Link>
  );
}
