import { useCallback, useEffect, useState } from "react";

import { db } from "@/db";
import type { Attendance, Session } from "@/db/schema";
import { useAppStore } from "@/store";
import { isSameDay } from "@/utils/dates";

export function useSessions(groupId: number) {
  const refreshKey = useAppStore((s) => s.refreshKey);
  const triggerRefresh = useAppStore((s) => s.triggerRefresh);
  const [allSessions, setAllSessions] = useState<Session[]>([]);

  useEffect(() => {
    db.sessions
      .where("groupId")
      .equals(groupId)
      .toArray()
      .then(setAllSessions)
      .catch(() => setAllSessions([]));
  }, [groupId, refreshKey]);

  const getSessionByDate = useCallback(
    async (date: Date) => {
      const sessions = await db.sessions.where("groupId").equals(groupId).toArray();
      return sessions.find((s) => isSameDay(new Date(s.date), date));
    },
    [groupId],
  );

  const getSessionById = useCallback(async (sessionId: number) => {
    return db.sessions.get(sessionId);
  }, []);

  const createSession = useCallback(
    async (date: Date): Promise<number> => {
      const sessionId = await db.sessions.add({
        groupId,
        date,
        createdAt: new Date(),
      });
      triggerRefresh();
      return sessionId;
    },
    [groupId, triggerRefresh],
  );

  const updateSessionDate = useCallback(
    async (sessionId: number, date: Date): Promise<void> => {
      await db.sessions.update(sessionId, { date });
      triggerRefresh();
    },
    [triggerRefresh],
  );

  return {
    getSessionByDate,
    getSessionById,
    getAllSessions: allSessions,
    createSession,
    updateSessionDate,
  };
}

export function useAttendances(sessionId: number) {
  const refreshKey = useAppStore((s) => s.refreshKey);
  const triggerRefresh = useAppStore((s) => s.triggerRefresh);
  const [data, setData] = useState<Attendance[]>([]);

  useEffect(() => {
    if (!sessionId) {
      setData([]);
      return;
    }
    db.attendances
      .where("sessionId")
      .equals(sessionId)
      .toArray()
      .then(setData)
      .catch(() => setData([]));
  }, [sessionId, refreshKey]);

  const setAttendance = useCallback(
    async (
      memberId: number,
      status: "present" | "absent" | "justified",
      justification?: { reason: string | null; note: string | null },
    ) => {
      if (!sessionId) return;

      const justificationReason =
        status === "justified" ? (justification?.reason ?? null) : null;
      const justificationNote =
        status === "justified" ? (justification?.note ?? null) : null;

      const existing = await db.attendances
        .where("[sessionId+memberId]")
        .equals([sessionId, memberId])
        .first();

      if (existing) {
        await db.attendances.update(existing.id!, {
          status,
          justificationReason,
          justificationNote,
        });
      } else {
        await db.attendances.add({
          sessionId,
          memberId,
          status,
          justificationReason,
          justificationNote,
          createdAt: new Date(),
        });
      }
      triggerRefresh();
    },
    [sessionId, triggerRefresh],
  );

  const markAllPresent = useCallback(
    async (memberIds: number[]) => {
      if (!sessionId) return;

      for (const memberId of memberIds) {
        const existing = await db.attendances
          .where("[sessionId+memberId]")
          .equals([sessionId, memberId])
          .first();

        if (existing) {
          await db.attendances.update(existing.id!, {
            status: "present",
            justificationReason: null,
            justificationNote: null,
          });
        } else {
          await db.attendances.add({
            sessionId,
            memberId,
            status: "present",
            justificationReason: null,
            justificationNote: null,
            createdAt: new Date(),
          });
        }
      }
      triggerRefresh();
    },
    [sessionId, triggerRefresh],
  );

  return { getAttendances: data, setAttendance, markAllPresent };
}
