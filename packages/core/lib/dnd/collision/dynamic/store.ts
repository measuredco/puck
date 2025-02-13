import { createStore } from "zustand/vanilla";
import { Direction } from "../../../../types";

export type CollisionMap = Record<
  string,
  {
    direction: Direction;
    [key: string]: any;
  }
>;

export const collisionStore = createStore<{
  fallbackEnabled: boolean;
  direction: Direction;
  collisionMap: CollisionMap;
}>(() => ({
  fallbackEnabled: false,
  direction: null,
  collisionMap: {},
}));
