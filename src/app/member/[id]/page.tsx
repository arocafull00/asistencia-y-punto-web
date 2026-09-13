"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import Button from "@/components/shared/button";
import Input from "@/components/shared/input";
import ScreenBody from "@/components/shared/screen-body";
import ScreenHeader from "@/components/shared/screen-header";
import { useMembers } from "@/hooks/useMembers";
import type { MemberWithAttendance } from "@/types";

export default function MemberPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const isNew = params.id === "new";
  const numericGroupId = Number(searchParams.get("groupId"));

  const { members, createMember, updateMember } = useMembers(numericGroupId);
  const existingMember = isNew ? null : members.find((m) => m.id === Number(params.id));

  const formKey = isNew ? "new" : existingMember ? String(existingMember.id) : `pending-${params.id}`;

  return (
    <MemberEditor
      key={formKey}
      isNew={isNew}
      existingMember={existingMember}
      createMember={createMember}
      updateMember={updateMember}
    />
  );
}

type MemberEditorProps = {
  isNew: boolean;
  existingMember: MemberWithAttendance | null | undefined;
  createMember: (name: string, notes?: string) => Promise<void>;
  updateMember: (id: number, name: string, notes?: string) => Promise<void>;
};

function MemberEditor({ isNew, existingMember, createMember, updateMember }: MemberEditorProps) {
  const router = useRouter();
  const [name, setName] = useState(isNew ? "" : (existingMember?.name ?? ""));
  const [notes, setNotes] = useState(isNew ? "" : (existingMember?.notes ?? ""));

  const handleSave = async () => {
    if (!name.trim()) return;

    if (isNew) {
      await createMember(name.trim(), notes.trim() || undefined);
    } else if (existingMember) {
      await updateMember(existingMember.id, name.trim(), notes.trim() || undefined);
    }

    router.back();
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <ScreenHeader
        title={isNew ? "Nueva Persona" : "Editar Persona"}
        titleSize="h2"
        showBack
      />

      <ScreenBody className="flex-1 space-y-4 overflow-y-auto px-6 pb-8">
        <Input
          label="Nombre"
          placeholder="Nombre completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <Input
          label="Notas (opcional)"
          placeholder="Notas adicionales"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          multiline
        />
        <div className="mt-6 flex justify-end gap-2">
          <Button title="Cancelar" variant="ghost" onClick={() => router.back()} />
          <Button title="Guardar" onClick={handleSave} />
        </div>
      </ScreenBody>
    </div>
  );
}
