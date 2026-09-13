"use client";

import type { ReactNode } from "react";

interface FabProps {
  onClick: () => void;
  children: ReactNode;
  className?: string;
  ariaLabel: string;
}

export default function Fab({ onClick, children, className = "", ariaLabel }: FabProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={`shadow-elevated fixed right-6 z-20 flex h-14 w-14 items-center justify-center rounded-xl bg-secondary-container active:opacity-85 ${className}`}
    >
      {children}
    </button>
  );
}
