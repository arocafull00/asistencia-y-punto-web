"use client";

interface AttendanceJustificationReasonChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

export default function AttendanceJustificationReasonChip({
  label,
  active,
  onPress,
}: AttendanceJustificationReasonChipProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={`mb-1 mr-1 rounded-md border px-2 py-1 text-sm ${
        active
          ? "border-primary bg-primary-fixed font-bold text-primary"
          : "border-outline-variant bg-surface-container-low font-semibold text-on-surface-variant"
      }`}
    >
      {label}
    </button>
  );
}
