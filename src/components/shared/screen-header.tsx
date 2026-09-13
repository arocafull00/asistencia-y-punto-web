"use client";

import { chevronBackOutline } from "ionicons/icons";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { IonIcon } from "@/components/shared/ion-icon";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  titleSize?: "h1" | "h2" | "h3";
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  showBack?: boolean;
  align?: "left" | "center";
}

const titleSizeClasses = {
  h1: "text-[17px] font-bold leading-snug tracking-tight",
  h2: "text-[17px] font-semibold leading-snug tracking-tight",
  h3: "text-[17px] font-semibold leading-snug tracking-tight",
};

export default function ScreenHeader({
  title,
  subtitle,
  titleSize = "h1",
  leftAction,
  rightAction,
  showBack = false,
  align = "left",
}: ScreenHeaderProps) {
  const router = useRouter();

  const backButton = (
    <button
      type="button"
      onClick={() => router.back()}
      className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-on-surface active:bg-surface-container-high"
      aria-label="Volver"
    >
      <IonIcon icon={chevronBackOutline} className="h-6 w-6" />
    </button>
  );

  const resolvedLeftAction = leftAction ?? (showBack ? backButton : null);
  const leftSlot = resolvedLeftAction ?? (align === "center" ? <span className="w-11" /> : null);
  const rightSlot = rightAction ?? (showBack || align === "center" ? <span className="w-11" /> : null);

  return (
    <header className="safe-top sticky top-0 z-10 border-b border-outline-variant/70 bg-surface/95 backdrop-blur-sm">
      <div className="grid h-14 grid-cols-[auto_1fr_auto] items-center gap-1 px-4">
        <div className="flex items-center justify-start">{leftSlot}</div>
        <div className={align === "center" ? "min-w-0 text-center" : "min-w-0 pr-2"}>
          <h1 className={`truncate text-on-surface ${titleSizeClasses[titleSize]}`}>{title}</h1>
          {subtitle ? (
            <p className="truncate text-xs text-on-surface-variant">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex items-center justify-end">{rightSlot}</div>
      </div>
    </header>
  );
}
