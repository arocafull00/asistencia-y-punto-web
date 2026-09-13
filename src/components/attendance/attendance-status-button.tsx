"use client";

import type { AttendanceStatus } from "@/types";

interface AttendanceStatusButtonProps {
  variant: AttendanceStatus;
  active: boolean;
  onPress: () => void;
}

export default function AttendanceStatusButton({
  variant,
  active,
  onPress,
}: AttendanceStatusButtonProps) {
  const symbol = variant === "present" ? "A" : variant === "absent" ? "F" : "J";

  if (!active) {
    return (
      <button
        type="button"
        onClick={onPress}
        className="flex h-12 w-12 items-center justify-center rounded-md border border-outline-variant bg-surface-container-low text-lg font-semibold text-on-surface-variant"
      >
        {symbol}
      </button>
    );
  }

  if (variant === "present") {
    return (
      <button
        type="button"
        onClick={onPress}
        className="flex h-12 w-12 items-center justify-center rounded-md border border-present bg-present-container text-lg font-bold text-present"
      >
        {symbol}
      </button>
    );
  }

  if (variant === "absent") {
    return (
      <button
        type="button"
        onClick={onPress}
        className="flex h-12 w-12 items-center justify-center rounded-md border border-absent bg-absent-container text-lg font-bold text-absent"
      >
        {symbol}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onPress}
      className="flex h-12 w-12 items-center justify-center rounded-md border border-justified bg-justified-container text-lg font-bold text-justified"
    >
      {symbol}
    </button>
  );
}
