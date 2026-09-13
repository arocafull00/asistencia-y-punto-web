"use client";

interface StatCardProps {
  label: string;
  value: string;
  color?: string;
}

export default function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div className="shadow-card flex min-h-[100px] flex-1 flex-col items-center justify-between rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
      <p className="w-full text-center text-[10px] font-semibold tracking-wide text-on-surface-variant uppercase">
        {label}
      </p>
      <p
        className="mt-2 w-full text-center text-2xl font-bold"
        style={color ? { color } : undefined}
      >
        {value}
      </p>
    </div>
  );
}
