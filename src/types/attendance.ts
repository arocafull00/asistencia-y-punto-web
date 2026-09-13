export type MemberAttendanceDraft = {
  status: "present" | "absent" | "justified";
  justificationReason: string | null;
  justificationNote: string | null;
};
