import { useCallback, useEffect, useState } from "react";

import { db, deleteGroupCascade } from "@/db";
import { useAppStore } from "@/store";
import type { GroupWithStats } from "@/types";

async function loadGroups(): Promise<GroupWithStats[]> {
  try {
    const allGroups = await db.groups.toArray();
    const result: GroupWithStats[] = [];

    for (const group of allGroups) {
      const groupId = group.id!;
      const groupMembers = await db.members.where("groupId").equals(groupId).toArray();
      const memberCount = groupMembers.length;
      const groupSessions = await db.sessions.where("groupId").equals(groupId).toArray();

      let averageAttendance = 0;
      if (groupSessions.length > 0 && memberCount > 0) {
        let totalRate = 0;
        for (const session of groupSessions) {
          const presentCount = await db.attendances
            .where("sessionId")
            .equals(session.id!)
            .filter((a) => a.status === "present")
            .count();
          totalRate += (presentCount / memberCount) * 100;
        }
        averageAttendance = Math.round(totalRate / groupSessions.length);
      }

      result.push({
        id: groupId,
        name: group.name,
        memberCount,
        averageAttendance,
        createdAt: group.createdAt ?? new Date(),
      });
    }

    return result;
  } catch (error) {
    console.error("Failed to load groups:", error);
    return [];
  }
}

export function useGroups() {
  const refreshKey = useAppStore((s) => s.refreshKey);
  const triggerRefresh = useAppStore((s) => s.triggerRefresh);
  const [data, setData] = useState<GroupWithStats[]>([]);

  useEffect(() => {
    loadGroups().then(setData);
  }, [refreshKey]);

  const createGroup = useCallback(
    async (name: string): Promise<number> => {
      const now = new Date();
      const groupId = await db.groups.add({
        name,
        createdAt: now,
        updatedAt: now,
      });
      triggerRefresh();
      return groupId;
    },
    [triggerRefresh],
  );

  const updateGroup = useCallback(
    async (id: number, name: string) => {
      await db.groups.update(id, { name, updatedAt: new Date() });
      triggerRefresh();
    },
    [triggerRefresh],
  );

  const deleteGroup = useCallback(
    async (id: number) => {
      await deleteGroupCascade(id);
      triggerRefresh();
    },
    [triggerRefresh],
  );

  return { groups: data, createGroup, updateGroup, deleteGroup };
}
