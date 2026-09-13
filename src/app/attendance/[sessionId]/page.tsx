"use client";

import { checkmarkCircle, checkmarkDone, calendarOutline, refresh } from "ionicons/icons";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import AttendanceRow from "@/components/attendance/attendance-row";
import SessionDatePickerSheet from "@/components/attendance/session-date-picker-sheet";
import { IonIcon } from "@/components/shared/ion-icon";
import ScreenBody from "@/components/shared/screen-body";
import ScreenHeader from "@/components/shared/screen-header";
import { JUSTIFICATION_REASON_OTHER } from "@/constants/justification-reasons";
import { db } from "@/db";
import { useAttendances, useSessions } from "@/hooks/useSessions";
import { useAppStore } from "@/store";
import type { AttendanceStatus } from "@/types";
import type { MemberAttendanceDraft } from "@/types/attendance";
import { formatLongDate, isSameDay } from "@/utils/dates";

export default function AttendancePage() {
  const params = useParams<{ sessionId: string }>();
  const searchParams = useSearchParams();
  const sessionIdParam = params.sessionId;
  const groupId = Number(searchParams.get("groupId"));
  const isNew = sessionIdParam === "new";
  const router = useRouter();

  const [groupName, setGroupName] = useState("GRUPO");
  const [sessionDate, setSessionDate] = useState(new Date());
  const { createSession, getSessionById, getSessionByDate, updateSessionDate } =
    useSessions(groupId);
  const refreshKey = useAppStore((s) => s.refreshKey);
  const triggerRefresh = useAppStore((s) => s.triggerRefresh);
  const [actualSessionId, setActualSessionId] = useState<number | null>(null);
  const [memberList, setMemberList] = useState<{ id: number; name: string }[]>([]);
  const [draftByMember, setDraftByMember] = useState<Record<number, MemberAttendanceDraft>>({});
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [datePickerError, setDatePickerError] = useState<string | null>(null);

  useEffect(() => {
    triggerRefresh();
  }, [triggerRefresh]);

  useEffect(() => {
    if (!groupId) return;
    db.groups.get(groupId).then((group) => {
      if (group) setGroupName(group.name.toUpperCase());
    });
    db.members
      .where("groupId")
      .equals(groupId)
      .toArray()
      .then((members) => setMemberList(members.map((m) => ({ id: m.id!, name: m.name }))))
      .catch(() => setMemberList([]));
  }, [groupId]);

  const loadSession = useCallback(async () => {
    if (!groupId) return;
    const sessions = await db.sessions.where("groupId").equals(groupId).toArray();
    const existing = sessions.find((s) => isSameDay(new Date(s.date), new Date()));

    if (existing) {
      setActualSessionId(existing.id!);
      setSessionDate(new Date(existing.date));
      return;
    }

    if (isNew) {
      const newId = await createSession(new Date());
      setActualSessionId(newId);
      setSessionDate(new Date());
    }
  }, [groupId, isNew, createSession]);

  useEffect(() => {
    if (!groupId) return;

    if (isNew) {
      loadSession();
      return;
    }

    const numericSessionId = Number(sessionIdParam);
    setActualSessionId(numericSessionId);
    getSessionById(numericSessionId).then((session) => {
      if (session) setSessionDate(new Date(session.date));
    });
  }, [isNew, sessionIdParam, loadSession, groupId, getSessionById]);

  useEffect(() => {
    if (!actualSessionId) return;

    db.attendances
      .where("sessionId")
      .equals(actualSessionId)
      .toArray()
      .then((atts) => {
        const next: Record<number, MemberAttendanceDraft> = {};
        for (const a of atts) {
          next[a.memberId] = {
            status: a.status as AttendanceStatus,
            justificationReason: a.justificationReason ?? null,
            justificationNote: a.justificationNote ?? null,
          };
        }
        setDraftByMember(next);
      })
      .catch(() => setDraftByMember({}));
  }, [actualSessionId, refreshKey]);

  const { setAttendance, markAllPresent } = useAttendances(actualSessionId ?? 0);

  const handleMemberStatus = async (memberId: number, status: AttendanceStatus) => {
    if (!actualSessionId) return;

    if (status === "justified") {
      let justificationReason: string | null = null;
      let justificationNote: string | null = null;
      const current = draftByMember[memberId];
      if (current?.status === "justified") {
        justificationReason = current.justificationReason;
        if (justificationReason === JUSTIFICATION_REASON_OTHER) {
          justificationNote = current.justificationNote;
        }
      }
      const next: MemberAttendanceDraft = {
        status: "justified",
        justificationReason,
        justificationNote,
      };
      setDraftByMember((prev) => ({ ...prev, [memberId]: next }));
      await setAttendance(memberId, "justified", {
        reason: justificationReason,
        note: justificationNote,
      });
      return;
    }

    const next: MemberAttendanceDraft = {
      status,
      justificationReason: null,
      justificationNote: null,
    };
    setDraftByMember((prev) => ({ ...prev, [memberId]: next }));
    await setAttendance(memberId, status, { reason: null, note: null });
  };

  const handleJustificationChip = async (memberId: number, reasonKey: string) => {
    if (!actualSessionId) return;
    const current = draftByMember[memberId];
    if (!current || current.status !== "justified") return;

    const justificationReason = reasonKey;
    const justificationNote =
      reasonKey === JUSTIFICATION_REASON_OTHER ? (current.justificationNote ?? "") : null;
    const next: MemberAttendanceDraft = {
      status: "justified",
      justificationReason,
      justificationNote,
    };
    setDraftByMember((prev) => ({ ...prev, [memberId]: next }));
    await setAttendance(memberId, "justified", {
      reason: justificationReason,
      note: justificationNote,
    });
  };

  const handleJustificationNote = async (memberId: number, text: string) => {
    if (!actualSessionId) return;
    const current = draftByMember[memberId];
    if (!current || current.status !== "justified") return;
    if (current.justificationReason !== JUSTIFICATION_REASON_OTHER) return;

    const next: MemberAttendanceDraft = {
      status: "justified",
      justificationReason: JUSTIFICATION_REASON_OTHER,
      justificationNote: text,
    };
    setDraftByMember((prev) => ({ ...prev, [memberId]: next }));
    await setAttendance(memberId, "justified", {
      reason: JUSTIFICATION_REASON_OTHER,
      note: text,
    });
  };

  const handleMarkAllPresent = async () => {
    if (!actualSessionId) return;
    const memberIds = memberList.map((m) => m.id);
    await markAllPresent(memberIds);
    const next: Record<number, MemberAttendanceDraft> = {};
    for (const m of memberList) {
      next[m.id] = {
        status: "present",
        justificationReason: null,
        justificationNote: null,
      };
    }
    setDraftByMember(next);
  };

  const handleClear = () => {
    setDraftByMember({});
  };

  const handleFinalize = () => {
    router.back();
  };

  const handleOpenDatePicker = () => {
    setDatePickerError(null);
    setDatePickerOpen(true);
  };

  const handleConfirmDate = async (newDate: Date) => {
    if (isSameDay(newDate, sessionDate)) {
      setDatePickerOpen(false);
      return;
    }

    if (!actualSessionId) return;

    const existing = await getSessionByDate(newDate);
    if (existing && existing.id !== actualSessionId) {
      setDatePickerError("Ya existe una sesión para esta fecha");
      return;
    }

    await updateSessionDate(actualSessionId, newDate);
    setSessionDate(newDate);
    setDatePickerOpen(false);
    setDatePickerError(null);
  };

  if (!groupId) {
    return (
      <div className="flex min-h-dvh flex-col">
        <ScreenHeader title="Pasar Lista" showBack />
        <ScreenBody>
          <p className="text-center text-on-surface-variant">Grupo no especificado</p>
        </ScreenBody>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <ScreenHeader title="Pasar Lista" showBack />

      <ScreenBody className="flex flex-1 flex-col">
      <div className="space-y-4 px-6 pb-4">
        <div>
          <h2 className="text-[32px] leading-tight font-bold tracking-tight text-on-surface">
            {groupName}
          </h2>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-base capitalize text-on-surface-variant">
              {formatLongDate(sessionDate)}
            </p>
            <button
              type="button"
              aria-label="Editar fecha"
              onClick={handleOpenDatePicker}
              className="flex h-8 w-8 items-center justify-center rounded-md active:bg-surface-container-low"
            >
              <IonIcon icon={calendarOutline} className="h-5 w-5 text-on-surface-variant" />
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleMarkAllPresent}
            className="shadow-card flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-primary active:opacity-85"
          >
            <IonIcon icon={checkmarkDone} className="h-4 w-4 text-on-primary" />
            <span className="text-sm font-semibold text-on-primary">Todos Asistencia</span>
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-md border border-outline bg-surface-container-lowest active:opacity-85"
          >
            <IonIcon icon={refresh} className="h-4 w-4 text-on-surface" />
            <span className="text-sm font-semibold text-on-surface">Limpiar</span>
          </button>
        </div>
      </div>

      {memberList.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-base text-on-surface-variant">No hay personas en este grupo</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pb-28">
          {memberList.map((item) => (
            <AttendanceRow
              key={item.id}
              memberName={item.name}
              draft={draftByMember[item.id]}
              onStatusChange={(status) => handleMemberStatus(item.id, status)}
              onSelectJustificationReason={(rk) => handleJustificationChip(item.id, rk)}
              onChangeJustificationNote={(t) => handleJustificationNote(item.id, t)}
            />
          ))}
        </div>
      )}
      </ScreenBody>

      <div className="safe-bottom fixed bottom-0 left-1/2 w-full max-w-[430px] -translate-x-1/2 border-t border-outline-variant bg-background px-6 pt-4 pb-4">
        <button
          type="button"
          onClick={handleFinalize}
          className="shadow-elevated flex h-14 w-full items-center justify-center gap-2 rounded-md bg-primary active:opacity-85"
        >
          <span className="text-xl font-bold tracking-wide text-on-primary uppercase">
            FINALIZAR ASISTENCIA
          </span>
          <IonIcon icon={checkmarkCircle} className="h-5 w-5 text-on-primary" />
        </button>
      </div>

      <SessionDatePickerSheet
        open={datePickerOpen}
        onClose={() => {
          setDatePickerOpen(false);
          setDatePickerError(null);
        }}
        currentDate={sessionDate}
        onConfirm={handleConfirmDate}
        errorMessage={datePickerError}
      />
    </div>
  );
}
