import { create } from "zustand";
import { ComponentData, Path } from "../types";

export type DataIndexItem = {
  data: ComponentData;
  path: Path;
  isSelected: boolean;
};

export type DataIndex = Record<string, DataIndexItem>;

export const useDataIndexStore = create<{
  index: DataIndex;
  setIndex: (newIndex: DataIndex) => void;
}>((set) => ({
  index: {},
  setIndex: (newIndex) => set((state) => ({ ...state, index: newIndex })),
}));
