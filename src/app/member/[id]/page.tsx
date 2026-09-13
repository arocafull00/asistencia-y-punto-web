"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import Button from "@/components/shared/button";
import Input from "@/components/shared/input";
import ScreenBody from "@/components/shared/screen-body";
import ScreenHeader from "@/components/shared/screen-header";
import { useMembers } from "@/hooks/useMembers";

export default function MemberPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isNew = params.id === "new";
  const numericGroupId = Number(searchParams.get("groupId"));

  const { members, createMember, updateMember } = useMembers(numericGroupId);
  const existingMember = isNew ? null : members.find((m) => m.id === Number(params.id));

  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!existingMember) return;
    setName(existingMember.name);
    setNotes(existingMember.notes ?? "");
  }, [existingMember]);

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
