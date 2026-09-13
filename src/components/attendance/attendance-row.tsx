"use client";

import AttendanceJustificationSection from "@/components/attendance/attendance-justification-section";
import AttendanceStatusButton from "@/components/attendance/attendance-status-button";
import { formatJustificationSummary } from "@/constants/justification-reasons";
import type { MemberAttendanceDraft } from "@/types/attendance";
import type { AttendanceStatus } from "@/types";
import { getInitials } from "@/utils/initials";

interface AttendanceRowProps {
  memberName: string;
  draft: MemberAttendanceDraft | undefined;
  onStatusChange: (status: AttendanceStatus) => void;
  onSelectJustificationReason: (reasonKey: string) => void;
  onChangeJustificationNote: (note: string) => void;
}

export default function AttendanceRow({
  memberName,
  draft,
  onStatusChange,
  onSelectJustificationReason,
  onChangeJustificationNote,
}: AttendanceRowProps) {
  const status = draft?.status ?? null;
  const isSelected = status !== null;

  const justificationPreview =
    status === "justified"
      ? formatJustificationSummary(draft?.justificationReason, draft?.justificationNote)
      : "";

  return (
    <div
      className={`shadow-card mx-6 mb-2 rounded-md border p-4 ${
        isSelected ? "border-secondary" : "border-surface-container-highest"
      } bg-surface-container-lowest`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center">
          <div
            className={`mr-2 flex h-14 w-14 shrink-0 items-center justify-center rounded-md border bg-primary-fixed ${
              isSelected ? "border-primary" : "border-primary-fixed-dim"
            }`}
          >
            <span className="text-base font-bold text-primary">{getInitials(memberName)}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold uppercase text-on-surface">{memberName}</p>
            {justificationPreview !== "" ? (
              <p className="mt-1 line-clamp-3 text-sm text-justified">{justificationPreview}</p>
            ) : null}
          </div>
        </div>
        <div className="flex gap-1">
          <AttendanceStatusButton
            variant="present"
            active={status === "present"}
            onPress={() => onStatusChange("present")}
          />
          <AttendanceStatusButton
            variant="absent"
            active={status === "absent"}
            onPress={() => onStatusChange("absent")}
          />
          <AttendanceStatusButton
            variant="justified"
            active={status === "justified"}
            onPress={() => onStatusChange("justified")}
          />
        </div>
      </div>
      {status === "justified" && draft ? (
        <AttendanceJustificationSection
          selectedReasonKey={draft.justificationReason}
          noteValue={draft.justificationNote ?? ""}
          onSelectReasonKey={onSelectJustificationReason}
          onChangeNote={onChangeJustificationNote}
        />
      ) : null}
    </div>
  );
}
