"use client";

interface ImportDestinationOptionProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
}

export default function ImportDestinationOption({
  label,
  selected,
  onSelect,
}: ImportDestinationOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-md border px-4 py-3 text-sm font-semibold transition-colors ${
        selected
          ? "border-primary bg-primary-container text-on-primary-container"
          : "border-outline-variant bg-surface-container-lowest text-on-surface active:bg-surface-container-low"
      }`}
    >
      {label}
    </button>
  );
}
