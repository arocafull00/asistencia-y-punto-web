"use client";

import { close } from "ionicons/icons";

import { IonIcon } from "@/components/shared/ion-icon";

interface NewGroupPlayerRowProps {
  name: string;
  onRemove: () => void;
}

export default function NewGroupPlayerRow({ name, onRemove }: NewGroupPlayerRowProps) {
  return (
    <div className="flex items-center rounded-md bg-surface-container-lowest p-4">
      <div className="mr-4 flex h-9 w-9 items-center justify-center rounded-full bg-primary-fixed">
        <span className="text-sm font-bold text-primary">{name.charAt(0).toUpperCase()}</span>
      </div>
      <p className="min-w-0 flex-1 truncate text-sm font-semibold text-on-surface">{name}</p>
      <button
        type="button"
        onClick={onRemove}
        className="rounded-md p-1 active:bg-surface-container"
        aria-label="Eliminar jugador"
      >
        <IonIcon icon={close} className="h-4 w-4 text-on-surface-variant" />
      </button>
    </div>
  );
}
