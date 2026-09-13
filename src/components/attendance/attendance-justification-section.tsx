"use client";

import AttendanceJustificationReasonChip from "@/components/attendance/attendance-justification-reason-chip";
import {
  JUSTIFICATION_REASON_OPTIONS,
  JUSTIFICATION_REASON_OTHER,
} from "@/constants/justification-reasons";

interface AttendanceJustificationSectionProps {
  selectedReasonKey: string | null;
  noteValue: string;
  onSelectReasonKey: (key: string) => void;
  onChangeNote: (text: string) => void;
}

export default function AttendanceJustificationSection({
  selectedReasonKey,
  noteValue,
  onSelectReasonKey,
  onChangeNote,
}: AttendanceJustificationSectionProps) {
  const showOtherInput = selectedReasonKey === JUSTIFICATION_REASON_OTHER;

  return (
    <div className="mt-2 w-full border-t border-surface-container-highest pt-2">
      <p className="mb-1 text-xs font-semibold tracking-wide text-on-secondary-container">Motivo</p>
      <div className="flex flex-wrap">
        {JUSTIFICATION_REASON_OPTIONS.map((opt) => (
          <AttendanceJustificationReasonChip
            key={opt.key}
            label={opt.label}
            active={selectedReasonKey === opt.key}
            onPress={() => onSelectReasonKey(opt.key)}
          />
        ))}
      </div>
      {showOtherInput ? (
        <input
          value={noteValue}
          onChange={(e) => onChangeNote(e.target.value)}
          placeholder="¿Por qué está justificado?"
          className="mt-2 w-full rounded-md border border-outline bg-surface-container-lowest px-4 py-2 text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none"
        />
      ) : null}
    </div>
  );
}
