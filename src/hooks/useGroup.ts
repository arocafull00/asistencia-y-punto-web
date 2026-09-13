import { useEffect, useState } from "react";

import { db } from "@/db";
import type { Group } from "@/db/schema";
import { useAppStore } from "@/store";

export function useGroup(groupId: number) {
  const refreshKey = useAppStore((s) => s.refreshKey);
  const [data, setData] = useState<Group | null>(null);

  useEffect(() => {
    db.groups.get(groupId).then((group) => setData(group ?? null));
  }, [groupId, refreshKey]);

  return data;
}
