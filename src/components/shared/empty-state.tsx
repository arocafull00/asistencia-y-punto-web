"use client";

import { peopleOutline, statsChartOutline, calendarOutline, personOutline, fileTrayOutline } from "ionicons/icons";
import { IonIcon } from "@/components/shared/ion-icon";

const iconMap = {
  "people-outline": peopleOutline,
  "stats-chart": statsChartOutline,
  "stats-chart-outline": statsChartOutline,
  "calendar-outline": calendarOutline,
  calendar: calendarOutline,
  person: personOutline,
  "person-outline": personOutline,
  "file-tray": fileTrayOutline,
} as const;

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof iconMap;
  fill?: boolean;
}

export default function EmptyState({
  title,
  subtitle,
  icon = "file-tray",
  fill = true,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 px-8 text-center ${fill ? "flex-1 py-8" : "py-8"}`}
    >
      <IonIcon icon={iconMap[icon] ?? fileTrayOutline} className="h-12 w-12 text-on-surface-variant" />
      <h3 className="text-xl font-semibold text-on-surface">{title}</h3>
      {subtitle ? <p className="text-sm leading-relaxed text-on-surface-variant">{subtitle}</p> : null}
    </div>
  );
}
