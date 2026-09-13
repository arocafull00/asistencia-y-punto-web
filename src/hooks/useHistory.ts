import { useEffect, useState } from "react";

import { db } from "@/db";
import { useAppStore } from "@/store";
import type { SessionSummary } from "@/types";

async function loadHistory(groupId: number): Promise<SessionSummary[]> {
  try {
    const allSessions = await db.sessions.where("groupId").equals(groupId).toArray();
    allSessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalMembers = await db.members.where("groupId").equals(groupId).count();

    const result: SessionSummary[] = [];
    for (const session of allSessions) {
      const presentCount = await db.attendances
        .where("sessionId")
        .equals(session.id!)
        .filter((a) => a.status === "present")
        .count();
      const rate = totalMembers > 0 ? Math.round((presentCount / totalMembers) * 100) : 0;
      result.push({
        id: session.id!,
        date: new Date(session.date),
        attendanceRate: rate,
        presentCount,
        totalCount: totalMembers,
      });
    }
    return result;
  } catch (error) {
    console.error("Failed to load history:", error);
    return [];
  }
}

export function useHistory(groupId: number) {
  const refreshKey = useAppStore((s) => s.refreshKey);
  const [data, setData] = useState<SessionSummary[]>([]);

  useEffect(() => {
    loadHistory(groupId).then(setData);
  }, [groupId, refreshKey]);

  return { sessions: data };
}
