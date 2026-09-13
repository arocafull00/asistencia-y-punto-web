import { useCallback, useEffect, useState } from "react";

import { db, deleteMemberCascade } from "@/db";
import { useAppStore } from "@/store";
import type { MemberWithAttendance } from "@/types";

async function loadMembers(groupId: number): Promise<MemberWithAttendance[]> {
  try {
    const allMembers = await db.members.where("groupId").equals(groupId).toArray();
    const totalSessions = await db.sessions.where("groupId").equals(groupId).count();

    const result: MemberWithAttendance[] = [];
    for (const member of allMembers) {
      const presentCount = await db.attendances
        .where("memberId")
        .equals(member.id!)
        .filter((a) => a.status === "present")
        .count();
      const rate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;
      result.push({
        id: member.id!,
        name: member.name,
        notes: member.notes ?? null,
        attendanceRate: rate,
      });
    }
    return result;
  } catch (error) {
    console.error("Failed to load members:", error);
    return [];
  }
}

export function useMembers(groupId: number) {
  const refreshKey = useAppStore((s) => s.refreshKey);
  const triggerRefresh = useAppStore((s) => s.triggerRefresh);
  const [data, setData] = useState<MemberWithAttendance[]>([]);

  useEffect(() => {
    loadMembers(groupId).then(setData);
  }, [groupId, refreshKey]);

  const createMember = useCallback(
    async (name: string, notes?: string) => {
      await db.members.add({
        groupId,
        name,
        notes: notes ?? null,
        createdAt: new Date(),
      });
      triggerRefresh();
    },
    [groupId, triggerRefresh],
  );

  const updateMember = useCallback(
    async (id: number, name: string, notes?: string) => {
      await db.members.update(id, { name, notes: notes ?? null });
      triggerRefresh();
    },
    [triggerRefresh],
  );

  const deleteMember = useCallback(
    async (id: number) => {
      await deleteMemberCascade(id);
      triggerRefresh();
    },
    [triggerRefresh],
  );

  return { members: data, createMember, updateMember, deleteMember };
}
