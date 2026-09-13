"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";

import SessionCard from "@/components/history/session-card";
import EmptyState from "@/components/shared/empty-state";
import ScreenBody from "@/components/shared/screen-body";
import ScreenHeader from "@/components/shared/screen-header";
import { useHistory } from "@/hooks/useHistory";
import { useAppStore } from "@/store";

export default function HistoryPage() {
  const params = useParams<{ groupId: string }>();
  const numericGroupId = Number(params.groupId);
  const { sessions } = useHistory(numericGroupId);
  const triggerRefresh = useAppStore((s) => s.triggerRefresh);

  useEffect(() => {
    triggerRefresh();
  }, [triggerRefresh]);

  return (
    <div className="flex min-h-dvh flex-col">
      <ScreenHeader title="Historial" showBack />

      <ScreenBody className="flex flex-1 flex-col">
        <p className="px-6 pb-4 text-sm leading-relaxed text-on-surface-variant">
          Revisa los registros de asistencia de sesiones anteriores.
        </p>

        {sessions.length === 0 ? (
          <EmptyState
            title="Sin registros"
            subtitle="Aún no se ha pasado lista en este grupo"
            icon="calendar-outline"
          />
        ) : (
          <div className="flex-1 overflow-y-auto pb-8">
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} groupId={numericGroupId} />
            ))}
          </div>
        )}
      </ScreenBody>
    </div>
  );
}
