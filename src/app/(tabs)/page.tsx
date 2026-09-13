"use client";

import { add } from "ionicons/icons";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import GroupCard from "@/components/home/group-card";
import EmptyState from "@/components/shared/empty-state";
import Fab from "@/components/shared/fab";
import { IonIcon } from "@/components/shared/ion-icon";
import PwaInstallButton from "@/components/shared/pwa-install-button";
import ScreenBody from "@/components/shared/screen-body";
import ScreenHeader from "@/components/shared/screen-header";
import { useGroups } from "@/hooks/useGroups";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { useAppStore } from "@/store";

export default function HomePage() {
  const { groups } = useGroups();
  const { canInstall, promptInstall } = usePwaInstall();
  const triggerRefresh = useAppStore((s) => s.triggerRefresh);
  const router = useRouter();

  useEffect(() => {
    triggerRefresh();
  }, [triggerRefresh]);

  return (
    <div className="flex min-h-dvh flex-col">
      <ScreenHeader
        title="Mis Grupos"
        showBack={false}
        rightAction={
          canInstall ? <PwaInstallButton onClick={promptInstall} /> : undefined
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
    </div>
  );
}
