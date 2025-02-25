import { createStore } from "zustand/vanilla";

export const collisionStore = createStore<{
  fallbackEnabled: boolean;
}>(() => ({
  fallbackEnabled: false,
}));
