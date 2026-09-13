"use client";

interface GroupMenuSheetProps {
  open: boolean;
  onClose: () => void;
  onRename: () => void;
  onHistory: () => void;
  onExport: () => void;
  onDelete: () => void;
  exporting: boolean;
}

export default function GroupMenuSheet({
  open,
  onClose,
  onRename,
  onHistory,
  onExport,
  onDelete,
  exporting,
}: GroupMenuSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button type="button" aria-label="Cerrar" className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="safe-bottom relative z-10 w-full max-w-[430px] overflow-hidden rounded-t-2xl bg-surface-container-lowest shadow-elevated">
        <button
          type="button"
          onClick={() => {
            onClose();
            onRename();
          }}
          className="block w-full px-6 py-4 text-left text-base font-semibold text-on-surface active:bg-surface-container-low"
        >
          Cambiar nombre
        </button>
        <div className="h-px bg-outline-variant" />
        <button
          type="button"
          onClick={() => {
            onClose();
            onHistory();
          }}
          className="block w-full px-6 py-4 text-left text-base font-semibold text-on-surface active:bg-surface-container-low"
        >
          Historial
        </button>
        <div className="h-px bg-outline-variant" />
        <button
          type="button"
          disabled={exporting}
          onClick={onExport}
          className="block w-full px-6 py-4 text-left text-base font-semibold text-on-surface active:bg-surface-container-low disabled:opacity-50"
        >
          Exportar datos a CSV
        </button>
        <div className="h-px bg-outline-variant" />
        <button
          type="button"
          onClick={() => {
            onClose();
            onDelete();
          }}
          className="block w-full px-6 py-4 text-left text-base font-semibold text-error active:bg-surface-container-low"
        >
          Eliminar grupo
        </button>
      </div>
    </div>
  );
}
