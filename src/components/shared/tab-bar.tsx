"use client";

import { people, statsChart } from "ionicons/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { IonIcon } from "@/components/shared/ion-icon";

const tabs = [
  { href: "/", label: "Inicio", icon: people },
  { href: "/stats", label: "Estadísticas", icon: statsChart },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="safe-bottom fixed bottom-0 left-1/2 z-30 flex w-full max-w-[430px] -translate-x-1/2 border-t border-outline-variant bg-surface-container-lowest px-2 pt-2">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-semibold ${active ? "text-primary" : "text-on-surface-variant"}`}
          >
            <IonIcon icon={tab.icon} className="h-6 w-6" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
