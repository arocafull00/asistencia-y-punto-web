"use client";

import { downloadOutline } from "ionicons/icons";

import { IonIcon } from "@/components/shared/ion-icon";

interface PwaInstallButtonProps {
  onClick: () => void;
}

export default function PwaInstallButton({ onClick }: PwaInstallButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="-mr-2 flex h-11 items-center gap-1 rounded-full px-2 active:bg-surface-container-high"
      aria-label="Instalar aplicación"
    >
      <IonIcon icon={downloadOutline} className="h-5 w-5 text-on-surface" />
      <span className="text-sm font-semibold text-on-surface">Instalar</span>
    </button>
  );
}
