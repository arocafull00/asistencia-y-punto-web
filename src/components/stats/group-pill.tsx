"use client";

interface GroupPillProps {
  name: string;
  selected: boolean;
  onSelect: () => void;
}

export default function GroupPill({ name, selected, onSelect }: GroupPillProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold active:opacity-70 ${
        selected
          ? "border-primary bg-primary text-on-primary"
          : "border-outline-variant bg-surface-container-low text-on-surface"
      }`}
    >
      {name}
    </button>
  );
}
