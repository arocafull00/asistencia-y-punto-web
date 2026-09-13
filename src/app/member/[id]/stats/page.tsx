"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";

import MemberSessionHistoryRow from "@/components/member/member-session-history-row";
import EmptyState from "@/components/shared/empty-state";
import ScreenBody from "@/components/shared/screen-body";
import ScreenHeader from "@/components/shared/screen-header";
import StatCard from "@/components/stats/stat-card";
import StatsLineChart from "@/components/stats/stats-line-chart";
import { useMemberStats } from "@/hooks/useMemberStats";
import { useAppStore } from "@/store";

export default function MemberStatsPage() {
  const params = useParams<{ id: string }>();
  const memberId = Number(params.id);
  const stats = useMemberStats(memberId);
  const triggerRefresh = useAppStore((s) => s.triggerRefresh);

  useEffect(() => {
    triggerRefresh();
  }, [triggerRefresh]);

  if (!stats) {
    return (
      <div className="flex min-h-dvh flex-col">
        <ScreenHeader title="Estadísticas" showBack />
        <ScreenBody>
          <EmptyState title="Persona no encontrada" subtitle="Esta persona ya no existe" icon="person" fill={false} />
        </ScreenBody>
      </div>
    );
  }

  const lineData = stats.sessions.map((s) => ({
    label: s.date.getDate().toString(),
    value: s.status === "present" ? 100 : s.status === "justified" ? 50 : 0,
  }));

  return (
    <div className="min-h-dvh pb-8">
      <ScreenHeader title={stats.name} subtitle="Estadísticas" showBack />

      <ScreenBody className="pb-8">
      <div className="space-y-4 px-6">
        <div className="flex gap-4">
          <StatCard label="Asistencia" value={`${stats.attendanceRate}%`} />
          <StatCard label="Sesiones" value={`${stats.totalSessions}`} />
        </div>
        <div className="flex gap-4">
          <StatCard label="Presente" value={`${stats.presentCount}`} color="#16a34a" />
          <StatCard label="Ausente" value={`${stats.absentCount}`} color="#dc2626" />
        </div>
        {stats.justifiedCount > 0 ? (
          <StatCard label="Justificado" value={`${stats.justifiedCount}`} color="#d97706" />
        ) : null}
      </div>

      {stats.sessions.length > 1 ? (
        <div className="mt-6 px-6">
          <h3 className="mb-4 text-xl font-semibold text-on-surface">Evolución temporal</h3>
          <StatsLineChart data={lineData} />
        </div>
      ) : null}

      {stats.sessions.length > 0 ? (
        <div className="mt-6 px-6">
          <h3 className="mb-4 text-xl font-semibold text-on-surface">Historial</h3>
          {stats.sessions.map((s) => (
            <MemberSessionHistoryRow key={s.sessionId} entry={s} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Sin sesiones"
          subtitle="Aún no hay sesiones registradas"
          icon="calendar"
        />
      )}
      </ScreenBody>
    </div>
  );
}
