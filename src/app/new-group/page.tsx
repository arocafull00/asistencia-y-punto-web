"use client";

import { add } from "ionicons/icons";
import { useRouter } from "next/navigation";
import { useState } from "react";

import NewGroupPlayerRow from "@/components/new-group/new-group-player-row";
import Button from "@/components/shared/button";
import Input from "@/components/shared/input";
import { IonIcon } from "@/components/shared/ion-icon";
import ScreenBody from "@/components/shared/screen-body";
import ScreenHeader from "@/components/shared/screen-header";
import { db } from "@/db";
import { useGroups } from "@/hooks/useGroups";
import { useAppStore } from "@/store";

export default function NewGroupPage() {
  const router = useRouter();
  const triggerRefresh = useAppStore((s) => s.triggerRefresh);
  const { createGroup } = useGroups();
  const [name, setName] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [players, setPlayers] = useState<string[]>([]);

  const canCreate = name.trim().length > 0 && players.length > 0;

  const handleAddPlayer = () => {
    const trimmed = playerName.trim();
    if (!trimmed) return;
    setPlayers((prev) => [...prev, trimmed]);
    setPlayerName("");
  };

  const handleRemovePlayer = (index: number) => {
    setPlayers((prev) => prev.filter((_, i) => i !== index));
  };

  const executeCreate = async () => {
    try {
      const groupId = await createGroup(name.trim());
      for (const player of players) {
        await db.members.add({
          groupId,
          name: player,
          createdAt: new Date(),
        });
      }
      triggerRefresh();
      router.back();
    } catch (error) {
      console.error("Failed to create group:", error);
      window.alert("No se pudo crear el grupo. Inténtalo de nuevo.");
    }
  };

  const handleCreate = () => {
    if (!canCreate) return;
    const pendingPlayer = playerName.trim();
    if (pendingPlayer) {
      const confirmed = window.confirm(
        `Tienes "${pendingPlayer}" escrito pero no lo has añadido. ¿Seguro que quieres crear el grupo?`,
      );
      if (!confirmed) return;
    }
    executeCreate();
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <ScreenHeader title="Nuevo Grupo" titleSize="h3" showBack />

      <ScreenBody className="flex-1 overflow-y-auto px-6">
        <Input
          label="Nombre del grupo"
          placeholder="Ej: Equipo de vóley"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        <div className="mt-6 mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold tracking-wide text-on-surface uppercase">Jugadores</p>
          {players.length > 0 ? (
            <span className="text-xs font-semibold text-on-surface-variant">{players.length}</span>
          ) : null}
        </div>

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              placeholder="Nombre del jugador"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddPlayer();
                }
              }}
            />
          </div>
          <button
            type="button"
            onClick={handleAddPlayer}
            className="mb-1 flex h-12 w-12 items-center justify-center rounded-md bg-primary active:opacity-80"
            aria-label="Añadir jugador"
          >
            <IonIcon icon={add} className="h-5 w-5 text-on-primary" />
          </button>
        </div>

        {players.length === 0 ? (
          <p className="mt-6 text-center text-sm text-on-surface-variant">
            Añade al menos un jugador para crear el grupo
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {players.map((player, index) => (
              <NewGroupPlayerRow
                key={`${player}-${index}`}
                name={player}
                onRemove={() => handleRemovePlayer(index)}
              />
            ))}
          </div>
        )}
      </ScreenBody>

      <div className="safe-bottom flex gap-2 border-t border-outline-variant bg-background px-6 py-6">
        <Button title="Cancelar" variant="ghost" onClick={() => router.back()} className="flex-1" />
        <Button title="Crear grupo" onClick={handleCreate} disabled={!canCreate} className="flex-1" />
      </div>
    </div>
  );
}
