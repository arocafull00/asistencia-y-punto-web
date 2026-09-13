import { useEffect, useState } from "react";

import { formatJustificationSummary } from "@/constants/justification-reasons";
import { db } from "@/db";
import { useAppStore } from "@/store";

export interface MemberSessionAttendance {
  sessionId: number;
  date: Date;
  status: "present" | "absent" | "justified";
  justificationSummary: string | null;
}

export interface MemberStatsData {
  name: string;
  notes: string | null;
  presentCount: number;
  absentCount: number;
  justifiedCount: number;
  totalSessions: number;
  attendanceRate: number;
  sessions: MemberSessionAttendance[];
}

async function loadMemberStats(memberId: number): Promise<MemberStatsData | null> {
  try {
    const member = await db.members.get(memberId);
    if (!member) return null;

    const groupId = member.groupId;
    const allSessions = await db.sessions.where("groupId").equals(groupId).toArray();
    allSessions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const totalSessions = allSessions.length;

    const memberAttendances = await db.attendances.where("memberId").equals(memberId).toArray();
    const attendanceMap = new Map(memberAttendances.map((a) => [a.sessionId, a]));

    let presentCount = 0;
    let absentCount = 0;
    let justifiedCount = 0;

    const sessionData: MemberSessionAttendance[] = allSessions.map((session) => {
      const row = attendanceMap.get(session.id!);
      const status = row?.status ?? "absent";

      if (status === "present") presentCount++;
      else if (status === "absent") absentCount++;
      else if (status === "justified") justifiedCount++;

      const justificationSummary =
        status === "justified" && row
          ? formatJustificationSummary(row.justificationReason, row.justificationNote) || null
          : null;

      return {
        sessionId: session.id!,
        date: new Date(session.date),
        status,
        justificationSummary,
      };
    });

    const rate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

    return {
      name: member.name,
      notes: member.notes ?? null,
      presentCount,
      absentCount,
      justifiedCount,
      totalSessions,
      attendanceRate: rate,
      sessions: sessionData,
    };
  } catch (error) {
    console.error("Failed to load member stats:", error);
    return null;
  }
}

export function useMemberStats(memberId: number): MemberStatsData | null {
  const refreshKey = useAppStore((s) => s.refreshKey);
  const [data, setData] = useState<MemberStatsData | null>(null);

  useEffect(() => {
    loadMemberStats(memberId).then(setData);
  }, [memberId, refreshKey]);

  return data;
}
