import { create } from "zustand";

interface AppState {
  refreshKey: number;
  selectedGroupId: number | null;
  triggerRefresh: () => void;
  setSelectedGroupId: (id: number | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  refreshKey: 0,
  selectedGroupId: null,
  triggerRefresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
  setSelectedGroupId: (id) => set({ selectedGroupId: id }),
}));
