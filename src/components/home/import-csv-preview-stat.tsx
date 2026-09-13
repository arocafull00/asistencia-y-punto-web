"use client";

interface ImportCsvPreviewStatProps {
  label: string;
  value: string | number;
}

export default function ImportCsvPreviewStat({ label, value }: ImportCsvPreviewStatProps) {
  return (
    <div className="rounded-md bg-surface-container-low px-4 py-3">
      <p className="text-xs font-semibold tracking-wide text-on-surface-variant uppercase">{label}</p>
      <p className="mt-1 text-lg font-bold text-on-surface">{value}</p>
    </div>
  );
}
