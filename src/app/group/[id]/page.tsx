"use client";

import { checkmarkCircleOutline, ellipsisVertical, personAdd } from "ionicons/icons";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import GroupMenuSheet from "@/components/group/group-menu-sheet";
import MemberRow from "@/components/group/member-row";
import Button from "@/components/shared/button";
import EmptyState from "@/components/shared/empty-state";
import Fab from "@/components/shared/fab";
import Input from "@/components/shared/input";
import { IonIcon } from "@/components/shared/ion-icon";
import ModalSheet from "@/components/shared/modal-sheet";
import ScreenBody from "@/components/shared/screen-body";
import ScreenHeader from "@/components/shared/screen-header";
import { useGroup } from "@/hooks/useGroup";
import { useGroups } from "@/hooks/useGroups";
import { useMembers } from "@/hooks/useMembers";
import { useAppStore } from "@/store";
import { exportGroupCsv } from "@/utils/exportGroupCsv";

export default function GroupPage() {
  const params = useParams<{ id: string }>();
  const groupId = Number(params.id);
  const router = useRouter();

  const group = useGroup(groupId);
  const { members, createMember, deleteMember } = useMembers(groupId);
  const { updateGroup, deleteGroup } = useGroups();

  const [modalVisible, setModalVisible] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberNotes, setNewMemberNotes] = useState("");
  const [memberToDelete, setMemberToDelete] = useState<number | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [menuVisible, setMenuVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [deleteGroupModalVisible, setDeleteGroupModalVisible] = useState(false);
  const [exporting, setExporting] = useState(false);

  const setSelectedGroupId = useAppStore((s) => s.setSelectedGroupId);
  const triggerRefresh = useAppStore((s) => s.triggerRefresh);

  useEffect(() => {
    triggerRefresh();
  }, [triggerRefresh]);

  const handleCreate = async () => {
    if (!newMemberName.trim()) return;
    await createMember(newMemberName.trim(), newMemberNotes.trim() || undefined);
    setNewMemberName("");
    setNewMemberNotes("");
    nameInputRef.current?.focus();
  };

  const handleDelete = async (memberId: number) => {
    await deleteMember(memberId);
    setMemberToDelete(null);
  };

  const handleRename = async () => {
    if (!newGroupName.trim()) return;
    await updateGroup(groupId, newGroupName.trim());
    setRenameModalVisible(false);
  };

  const handleDeleteGroup = async () => {
    await deleteGroup(groupId);
    setDeleteGroupModalVisible(false);
    router.back();
  };

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      setMenuVisible(false);
      await exportGroupCsv(groupId, group?.name ?? "grupo");
    } catch (error) {
      console.error("Failed to export CSV:", error);
    } finally {
      setExporting(false);
    }
  };

  if (!group) {
    return (
      <div className="flex min-h-dvh flex-col">
        <p className="mt-8 text-center text-lg font-semibold text-error">Grupo no encontrado</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <ScreenHeader
        title={group.name.toUpperCase()}
        titleSize="h1"
        showBack
        rightAction={
          <button
            type="button"
            onClick={() => setMenuVisible(true)}
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full active:bg-surface-container-high"
            aria-label="Menú del grupo"
          >
            <IonIcon icon={ellipsisVertical} className="h-6 w-6 text-on-surface" />
          </button>
        }
      />

      <ScreenBody className="flex flex-1 flex-col">
      <div className="px-6 pb-4">
        <button
          type="button"
          onClick={() => {
            setSelectedGroupId(groupId);
            router.push(`/attendance/new?groupId=${groupId}`);
          }}
          className="shadow-card flex h-14 w-full items-center justify-center gap-2 rounded-md bg-primary active:opacity-85"
        >
          <IonIcon icon={checkmarkCircleOutline} className="h-5 w-5 text-on-primary" />
          <span className="text-sm font-semibold tracking-wide text-on-primary uppercase">
            Pasar Lista
          </span>
        </button>
      </div>

      <p className="px-6 pb-2 text-xs font-semibold tracking-wide text-on-surface-variant uppercase">
        INTEGRANTES • {members.length} {members.length === 1 ? "PERSONA" : "PERSONAS"}
      </p>

      {members.length === 0 ? (
        <EmptyState
          title="Sin personas"
          subtitle="Añade personas a este grupo para empezar"
          icon="person"
        />
      ) : (
        <div className="flex-1 overflow-y-auto pb-28">
          {members.map((member) => (
            <div
              key={member.id}
              onContextMenu={(e) => {
                e.preventDefault();
                setMemberToDelete(member.id);
              }}
            >
              <MemberRow member={member} groupId={groupId} />
            </div>
          ))}
        </div>
      )}
      </ScreenBody>

      <Fab onClick={() => setModalVisible(true)} ariaLabel="Añadir persona" className="bottom-6">
        <IonIcon icon={personAdd} className="h-6 w-6 text-on-secondary-container" />
      </Fab>

      <GroupMenuSheet
        open={menuVisible}
        onClose={() => setMenuVisible(false)}
        onRename={() => {
          setNewGroupName(group.name);
          setRenameModalVisible(true);
        }}
        onHistory={() => router.push(`/history/${groupId}`)}
        onExport={handleExportCsv}
        onDelete={() => setDeleteGroupModalVisible(true)}
        exporting={exporting}
      />

      <ModalSheet open={renameModalVisible} onClose={() => setRenameModalVisible(false)}>
        <h2 className="text-xl font-bold text-on-surface">Cambiar nombre</h2>
        <Input
          label="Nombre"
          placeholder="Nombre del grupo"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          autoFocus
        />
        <div className="mt-2 flex justify-end gap-2">
          <Button title="Cancelar" variant="ghost" onClick={() => setRenameModalVisible(false)} />
          <Button title="Guardar" onClick={handleRename} />
        </div>
      </ModalSheet>

      <ModalSheet open={deleteGroupModalVisible} onClose={() => setDeleteGroupModalVisible(false)}>
        <h2 className="text-xl font-bold text-on-surface">Eliminar grupo</h2>
        <p className="text-sm leading-relaxed text-on-surface-variant">
          ¿Estás seguro? Se eliminarán todas las personas, sesiones y registros de asistencia.
        </p>
        <div className="mt-2 flex justify-end gap-2">
          <Button title="Cancelar" variant="ghost" onClick={() => setDeleteGroupModalVisible(false)} />
          <Button title="Eliminar" variant="secondary" onClick={handleDeleteGroup} />
        </div>
      </ModalSheet>

      <ModalSheet
        open={modalVisible}
        onClose={() => {
          setNewMemberName("");
          setNewMemberNotes("");
          setModalVisible(false);
        }}
      >
        <h2 className="text-xl font-bold text-on-surface">Añadir Persona</h2>
        <Input
          ref={nameInputRef}
          label="Nombre"
          placeholder="Nombre completo"
          value={newMemberName}
          onChange={(e) => setNewMemberName(e.target.value)}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleCreate();
            }
          }}
        />
        <Input
          label="Notas (opcional)"
          placeholder="Notas adicionales"
          value={newMemberNotes}
          onChange={(e) => setNewMemberNotes(e.target.value)}
          multiline
        />
        <div className="mt-2 flex justify-end gap-2">
          <Button
            title="Cancelar"
            variant="ghost"
            onClick={() => {
              setNewMemberName("");
              setNewMemberNotes("");
              setModalVisible(false);
            }}
          />
          <Button title="Añadir" onClick={handleCreate} />
        </div>
      </ModalSheet>

      <ModalSheet open={memberToDelete !== null} onClose={() => setMemberToDelete(null)}>
        <h2 className="text-xl font-bold text-on-surface">Eliminar persona</h2>
        <p className="text-sm leading-relaxed text-on-surface-variant">
          ¿Estás seguro? Se perderán todos sus registros de asistencia.
        </p>
        <div className="mt-2 flex justify-end gap-2">
          <Button title="Cancelar" variant="ghost" onClick={() => setMemberToDelete(null)} />
          <Button
            title="Eliminar"
            variant="secondary"
            onClick={() => memberToDelete && handleDelete(memberToDelete)}
          />
        </div>
      </ModalSheet>
    </div>
  );
}
