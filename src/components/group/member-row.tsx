"use client";

import { createOutline } from "ionicons/icons";
import Link from "next/link";

import { IonIcon } from "@/components/shared/ion-icon";
import type { MemberWithAttendance } from "@/types";
import { getInitials } from "@/utils/initials";

interface MemberRowProps {
  member: MemberWithAttendance;
  groupId: number;
}

export default function MemberRow({ member, groupId }: MemberRowProps) {
  const rateGood = member.attendanceRate >= 80;

  return (
    <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-6 py-4 active:bg-surface-container-low">
      <Link href={`/member/${member.id}/stats`} className="flex min-w-0 flex-1 items-center">
        <div className="mr-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary-fixed">
          <span className="text-base font-bold text-primary">{getInitials(member.name)}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-on-surface">{member.name}</p>
          {member.notes ? (
            <p className="mt-0.5 truncate text-[11px] tracking-wide text-on-surface-variant uppercase">
              {member.notes}
            </p>
          ) : null}
        </div>
      </Link>
      <div className="ml-2 flex items-center gap-2">
        <div className="text-right">
          <p className={`text-xl font-bold ${rateGood ? "text-primary" : "text-absent"}`}>
            {member.attendanceRate}%
          </p>
          <p className="text-[10px] font-semibold tracking-wide text-on-surface-variant">ASISTENCIA</p>
        </div>
        <Link
          href={`/member/${member.id}?groupId=${groupId}`}
          className="rounded-md p-1 active:bg-surface-container"
          aria-label="Editar persona"
        >
          <IonIcon icon={createOutline} className="h-3.5 w-3.5 text-on-surface-variant" />
        </Link>
      </div>
    </div>
  );
}
