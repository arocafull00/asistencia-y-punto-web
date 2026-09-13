export type AttendanceStatus = "present" | "absent" | "justified";

export interface Group {
  id?: number;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Member {
  id?: number;
  groupId: number;
  name: string;
  notes?: string | null;
  createdAt?: Date;
}

export interface Session {
  id?: number;
  groupId: number;
  date: Date;
  createdAt?: Date;
}

export interface Attendance {
  id?: number;
  sessionId: number;
  memberId: number;
  status: AttendanceStatus;
  justificationReason?: string | null;
  justificationNote?: string | null;
  createdAt?: Date;
}
