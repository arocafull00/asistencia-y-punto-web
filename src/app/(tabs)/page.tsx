"use client";

import { add, ellipsisVertical } from "ionicons/icons";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import GroupCard from "@/components/home/group-card";
import HomeMenuSheet from "@/components/home/home-menu-sheet";
import ImportCsvSheet from "@/components/home/import-csv-sheet";
import EmptyState from "@/components/shared/empty-state";
import Fab from "@/components/shared/fab";
import { IonIcon } from "@/components/shared/ion-icon";
import ScreenBody from "@/components/shared/screen-body";
import ScreenHeader from "@/components/shared/screen-header";
import { useGroups } from "@/hooks/useGroups";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { useAppStore } from "@/store";
import type { ImportDestination, ParsedCsvPreview } from "@/utils/importGroupCsv";
import { importGroupCsv } from "@/utils/importGroupCsv";

export default function HomePage() {
  const { groups } = useGroups();
  const { canInstall, promptInstall } = usePwaInstall();
  const triggerRefresh = useAppStore((s) => s.triggerRefresh);
  const router = useRouter();

  const [menuVisible, setMenuVisible] = useState(false);
  const [importVisible, setImportVisible] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    triggerRefresh();
  }, [triggerRefresh]);

  const handleImport = async (preview: ParsedCsvPreview, destination: ImportDestination) => {
    try {
      setImporting(true);
      const result = await importGroupCsv(preview, destination);
      triggerRefresh();
      setImportVisible(false);
      router.push(`/group/${result.groupId}`);
    } catch (error) {
      console.error("Failed to import CSV:", error);
      window.alert(
        error instanceof Error ? error.message : "No se pudo importar el archivo. Inténtalo de nuevo.",
      );
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <ScreenHeader
        title="Mis Grupos"
        showBack={false}
        rightAction={
          <button
            type="button"
            onClick={() => setMenuVisible(true)}
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full active:bg-surface-container-high"
            aria-label="Menú"
          >
            <IonIcon icon={ellipsisVertical} className="h-6 w-6 text-on-surface" />
          </button>
        }
      />

      <ScreenBody className="flex-1">
        {groups.length === 0 ? (
          <EmptyState
            title="No hay grupos"
            subtitle="Crea tu primer grupo para empezar a pasar lista"
            icon="people-outline"
            fill={false}
          />
        ) : (
          <div className="overflow-y-auto">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </ScreenBody>

      <Fab onClick={() => router.push("/new-group")} ariaLabel="Nuevo grupo" className="bottom-24">
        <IonIcon icon={add} className="h-7 w-7 text-on-secondary-container" />
      </Fab>

      <HomeMenuSheet
        open={menuVisible}
        onClose={() => setMenuVisible(false)}
        onInstall={promptInstall}
        onImport={() => setImportVisible(true)}
        canInstall={canInstall}
      />

      <ImportCsvSheet
        open={importVisible}
        onClose={() => setImportVisible(false)}
        groups={groups}
        onImport={handleImport}
        importing={importing}
      />
    </div>
  );
}
