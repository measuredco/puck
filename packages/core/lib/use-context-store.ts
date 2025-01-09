import { Context, useContext } from "react";
import { StoreApi, useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";

type ExtractState<S> = S extends {
  getState: () => infer T;
}
  ? T
  : never;

/**
 * Use a Zustand store via context
 */
export function useContextStore<T, U>(
  context: Context<StoreApi<T>>,
  selector: (s: ExtractState<StoreApi<T>>) => U
): U {
  const store = useContext(context);

  if (!store) {
    throw new Error("useContextStore must be used inside context");
  }

  return useStore<StoreApi<T>, U>(store, useShallow(selector));
}
