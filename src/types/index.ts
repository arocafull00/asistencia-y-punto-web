export type AttendanceStatus = "present" | "absent" | "justified";

export interface GroupWithStats {
  id: number;
  name: string;
  memberCount: number;
  averageAttendance: number;
  createdAt: Date;
}

export interface MemberWithAttendance {
  id: number;
  name: string;
  notes: string | null;
  attendanceRate: number;
}

export interface SessionSummary {
  id: number;
  date: Date;
  attendanceRate: number;
  presentCount: number;
  totalCount: number;
}

export interface DayAttendance {
  memberId: number;
  memberName: string;
  status: AttendanceStatus;
}
