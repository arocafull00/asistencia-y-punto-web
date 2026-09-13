"use client";

interface HomeMenuSheetProps {
  open: boolean;
  onClose: () => void;
  onInstall: () => void;
  onImport: () => void;
  canInstall: boolean;
}

export default function HomeMenuSheet({
  open,
  onClose,
  onInstall,
  onImport,
  canInstall,
}: HomeMenuSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button type="button" aria-label="Cerrar" className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="safe-bottom relative z-10 w-full max-w-[430px] overflow-hidden rounded-t-2xl bg-surface-container-lowest shadow-elevated">
        <button
          type="button"
          disabled={!canInstall}
          onClick={() => {
            if (!canInstall) return;
            onClose();
            onInstall();
          }}
          className="block w-full px-6 py-4 text-left text-base font-semibold text-on-surface active:bg-surface-container-low disabled:opacity-50"
        >
          Instalar aplicación
        </button>
        <div className="h-px bg-outline-variant" />
        <button
          type="button"
          onClick={() => {
            onClose();
            onImport();
          }}
          className="block w-full px-6 py-4 text-left text-base font-semibold text-on-surface active:bg-surface-container-low"
        >
          Importar datos
        </button>
      </div>
    </div>
  );
}
