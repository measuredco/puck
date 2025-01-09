import { useDragDropManager } from "@dnd-kit/react";
import { DependencyList, useCallback } from "react";

/**
 * Returns a callback that only triggers when dnd-kit has finished
 * rendering. This is useful when working with state managers
 * that operate outside of the React lifecycle, like Zustand, as
 * dnd-kit cannot defer the rendering until it's finished.
 *
 * This may change in a future release
 *
 * @param callback
 * @param deps
 * @returns
 */
export function useRenderedCallback<T extends Function>(
  callback: T,
  deps: DependencyList
) {
  const manager = useDragDropManager();

  return useCallback(
    async (...args: any) => {
      await manager?.renderer.rendering;

      return callback(...args);
    },
    [...deps, manager]
  );
}
