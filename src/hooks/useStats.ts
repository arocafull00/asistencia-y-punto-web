import { useEffect, useState } from "react";

import { db } from "@/db";
import { useAppStore } from "@/store";

export interface PersonStat {
  memberId: number;
  name: string;
  presentCount: number;
  absentCount: number;
  justifiedCount: number;
  totalSessions: number;
  rate: number;
}

export interface DayStat {
  date: Date;
  rate: number;
  presentCount: number;
  totalCount: number;
}

export interface GroupStats {
  averageRate: number;
  totalDays: number;
  bestDay: DayStat | null;
  worstDay: DayStat | null;
  timeline: DayStat[];
  ranking: PersonStat[];
}

async function loadStats(groupId: number): Promise<GroupStats | null> {
  try {
    const allSessions = await db.sessions.where("groupId").equals(groupId).toArray();
    allSessions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const totalMembers = await db.members.where("groupId").equals(groupId).count();
    const totalDays = allSessions.length;

    if (totalDays === 0) {
      return {
        averageRate: 0,
        totalDays: 0,
        bestDay: null,
        worstDay: null,
        timeline: [],
        ranking: [],
      };
    }

    const timeline: DayStat[] = [];
    for (const session of allSessions) {
      const presentCount = await db.attendances
        .where("sessionId")
        .equals(session.id!)
        .filter((a) => a.status === "present")
        .count();
      const rate = totalMembers > 0 ? Math.round((presentCount / totalMembers) * 100) : 0;
      timeline.push({
        date: new Date(session.date),
        rate,
        presentCount,
        totalCount: totalMembers,
      });
    }

    const averageRate = Math.round(timeline.reduce((sum, d) => sum + d.rate, 0) / timeline.length);
    const sortedByRate = [...timeline].sort((a, b) => b.rate - a.rate);
    const bestDay = sortedByRate[0] ?? null;
    const worstDay = sortedByRate[sortedByRate.length - 1] ?? null;

    const allMembers = await db.members.where("groupId").equals(groupId).toArray();
    const ranking: PersonStat[] = [];

    for (const member of allMembers) {
      const presentCount = await db.attendances
        .where("memberId")
        .equals(member.id!)
        .filter((a) => a.status === "present")
        .count();
      const absentCount = await db.attendances
        .where("memberId")
        .equals(member.id!)
        .filter((a) => a.status === "absent")
        .count();
      const justifiedCount = await db.attendances
        .where("memberId")
        .equals(member.id!)
        .filter((a) => a.status === "justified")
        .count();
      const rate = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0;
      ranking.push({
        memberId: member.id!,
        name: member.name,
        presentCount,
        absentCount,
        justifiedCount,
        totalSessions: totalDays,
        rate,
      });
    }

    ranking.sort((a, b) => b.rate - a.rate);

    return {
      averageRate,
      totalDays,
      bestDay,
      worstDay,
      timeline,
      ranking,
    };
  } catch (error) {
    console.error("Failed to load stats:", error);
    return null;
  }
}

export function useStats(groupId: number | null): GroupStats | null {
  const refreshKey = useAppStore((s) => s.refreshKey);
  const [data, setData] = useState<GroupStats | null>(null);

  useEffect(() => {
    if (!groupId) {
      setData(null);
      return;
    }
    loadStats(groupId).then(setData);
  }, [groupId, refreshKey]);

  return data;
}
