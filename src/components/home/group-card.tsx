"use client";

import { chevronForwardOutline, peopleOutline } from "ionicons/icons";
import Link from "next/link";

import { IonIcon } from "@/components/shared/ion-icon";
import type { GroupWithStats } from "@/types";

interface GroupCardProps {
  group: GroupWithStats;
}

export default function GroupCard({ group }: GroupCardProps) {
  return (
    <Link
      href={`/group/${group.id}`}
      className="shadow-card mx-6 mb-2 block rounded-lg border border-outline-variant bg-surface-container-lowest p-4 active:bg-surface-container-low active:opacity-70"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1 pr-2">
          <h2 className="truncate text-xl font-bold tracking-tight text-on-surface">
            {group.name.toUpperCase()}
          </h2>
          <div className="mt-1 flex items-center gap-1">
            <IonIcon icon={peopleOutline} className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold tracking-wide text-on-surface-variant">
              {group.memberCount} {group.memberCount === 1 ? "PERSONA" : "PERSONAS"}
            </span>
          </div>
        </div>
        <IonIcon icon={chevronForwardOutline} className="h-5 w-5 text-outline" />
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-container">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.min(group.averageAttendance, 100)}%` }}
        />
      </div>
    </Link>
  );
}
