"use client";

import { useEffect } from "react";

import EmptyState from "@/components/shared/empty-state";
import ScreenBody from "@/components/shared/screen-body";
import ScreenHeader from "@/components/shared/screen-header";
import GroupPill from "@/components/stats/group-pill";
import RankingRow from "@/components/stats/ranking-row";
import StatCard from "@/components/stats/stat-card";
import StatsBarChart from "@/components/stats/stats-bar-chart";
import StatsLineChart from "@/components/stats/stats-line-chart";
import { useGroups } from "@/hooks/useGroups";
import { useStats } from "@/hooks/useStats";
import { useAppStore } from "@/store";

export default function StatsPage() {
  const selectedGroupId = useAppStore((s) => s.selectedGroupId);
  const setSelectedGroupId = useAppStore((s) => s.setSelectedGroupId);
  const triggerRefresh = useAppStore((s) => s.triggerRefresh);
  const { groups } = useGroups();
  const stats = useStats(selectedGroupId);

  useEffect(() => {
    triggerRefresh();
  }, [triggerRefresh]);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);
  const needsGroupSelection = !selectedGroupId || !stats || !selectedGroup;

  if (groups.length === 0) {
    return (
      <div className="flex min-h-dvh flex-col">
        <ScreenHeader title="Estadísticas" />
        <ScreenBody>
          <EmptyState
            title="No hay grupos"
            subtitle="Crea un grupo en Inicio para ver sus estadísticas"
            icon="stats-chart"
            fill={false}
          />
        </ScreenBody>
      </div>
    );
  }

  const lineData = stats?.timeline.map((d) => ({
    label: d.date.getDate().toString(),
    value: d.rate,
  }));

  const barData = stats?.ranking.slice(0, 6).map((p) => ({
    label: p.name.slice(0, 8),
    value: p.rate,
    color: p.rate >= 80 ? "#16a34a" : "#dc2626",
  }));

  return (
    <div className="flex min-h-dvh flex-col">
      <ScreenHeader title="Estadísticas" />

      <ScreenBody className="flex flex-1 flex-col">
        <div className="overflow-x-auto px-6 pb-4">
          <div className="flex gap-2">
            {groups.map((group) => (
              <GroupPill
                key={group.id}
                name={group.name}
                selected={group.id === selectedGroupId}
                onSelect={() => setSelectedGroupId(group.id)}
              />
            ))}
          </div>
        </div>

        {needsGroupSelection ? (
          <EmptyState
            fill
            title="Selecciona un grupo"
            subtitle="Elige un grupo para ver sus estadísticas"
            icon="stats-chart"
          />
        ) : (
          <div className="flex-1 space-y-6 overflow-y-auto pb-8">
          <p className="px-6 text-xs font-semibold tracking-wide text-primary uppercase">
            RENDIMIENTO DEL EQUIPO
          </p>

          <div className="flex gap-4 overflow-x-auto px-6">
            <StatCard label="Asistencia promedio" value={`${stats.averageRate}%`} />
            <StatCard label="Sesiones totales" value={`${stats.totalDays}`} />
            {stats.bestDay ? (
              <StatCard
                label="Última sesión"
                value={`${stats.bestDay.rate}%`}
                color="#855300"
              />
            ) : null}
          </div>

          {lineData && lineData.length > 1 ? (
            <div className="px-6">
              <h3 className="mb-4 text-xl font-semibold text-on-surface">Evolución temporal</h3>
              <StatsLineChart data={lineData} />
            </div>
          ) : null}

          {stats.ranking.length > 0 ? (
            <div className="px-6">
              <div className="mb-2 flex items-end justify-between">
                <h3 className="text-xl font-semibold text-on-surface">Clasificación</h3>
                <span className="text-[10px] font-semibold tracking-wide text-on-surface-variant uppercase">
                  % asistencia
                </span>
              </div>
              <div className="flex items-center border-y border-outline-variant bg-surface-container px-4 py-2">
                <span className="w-7 text-[10px] font-semibold tracking-wide text-on-surface-variant">POS</span>
                <span className="flex-1 text-[10px] font-semibold tracking-wide text-on-surface-variant">NOMBRE</span>
                <span className="w-12 text-right text-[10px] font-semibold tracking-wide text-on-surface-variant">
                  PRES.
                </span>
                <span className="w-12 text-right text-[10px] font-semibold tracking-wide text-on-surface-variant">
                  AUS.
                </span>
                <span className="w-12 text-right text-[10px] font-semibold tracking-wide text-on-surface-variant">
                  JUST.
                </span>
              </div>
              {stats.ranking.map((p, i) => (
                <RankingRow
                  key={p.memberId}
                  rank={i + 1}
                  name={p.name}
                  rate={p.rate}
                  absentCount={p.absentCount}
                  justifiedCount={p.justifiedCount}
                />
              ))}
            </div>
          ) : null}

          {barData && barData.length > 0 ? (
            <div className="px-6">
              <h3 className="mb-4 text-xl font-semibold text-on-surface">Comparativa</h3>
              <StatsBarChart data={barData} />
            </div>
          ) : null}
          </div>
        )}
      </ScreenBody>
    </div>
  );
}
