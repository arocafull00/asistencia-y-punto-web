"use client";

import type { ReactNode } from "react";

interface ModalSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function ModalSheet({ open, onClose, children }: ModalSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />
      <div className="safe-bottom relative z-10 w-full max-w-[430px] rounded-t-2xl bg-surface-container-lowest px-6 pb-8 pt-6 shadow-elevated">
        {children}
      </div>
    </div>
  );
}
