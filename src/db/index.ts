import Dexie, { type Table } from "dexie";

import type { Attendance, Group, Member, Session } from "./schema";

class AsistenciaDatabase extends Dexie {
  groups!: Table<Group, number>;
  members!: Table<Member, number>;
  sessions!: Table<Session, number>;
  attendances!: Table<Attendance, number>;

  constructor() {
    super("asistencia-y-punto");
    this.version(1).stores({
      groups: "++id, name, createdAt, updatedAt",
      members: "++id, groupId, name",
      sessions: "++id, groupId, date",
      attendances: "++id, sessionId, memberId, [sessionId+memberId]",
    });
  }
}

export const db = new AsistenciaDatabase();

export async function deleteGroupCascade(groupId: number) {
  const groupSessions = await db.sessions.where("groupId").equals(groupId).toArray();
  const sessionIds = groupSessions.map((s) => s.id!);

  await db.transaction("rw", [db.groups, db.members, db.sessions, db.attendances], async () => {
    for (const sessionId of sessionIds) {
      await db.attendances.where("sessionId").equals(sessionId).delete();
    }
    await db.sessions.where("groupId").equals(groupId).delete();
    await db.members.where("groupId").equals(groupId).delete();
    await db.groups.delete(groupId);
  });
}

export async function deleteMemberCascade(memberId: number) {
  await db.transaction("rw", [db.members, db.attendances], async () => {
    await db.attendances.where("memberId").equals(memberId).delete();
    await db.members.delete(memberId);
  });
}
