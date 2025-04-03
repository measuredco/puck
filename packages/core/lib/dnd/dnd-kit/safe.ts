import {
  useDraggable,
  UseDraggableInput,
  useDroppable,
  UseDroppableInput,
} from "@dnd-kit/react";
import { useSortable, UseSortableInput } from "@dnd-kit/react/sortable";
import { Data } from "@dnd-kit/abstract";

export function useDroppableSafe<T extends Data>(
  input: UseDroppableInput<T>
): Pick<ReturnType<typeof useDroppable<T>>, "ref"> {
  if (typeof window === "undefined") {
    return { ref: () => {} };
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useDroppable(input);
}

export function useDraggableSafe<T extends Data>(
  input: UseDraggableInput
): Pick<ReturnType<typeof useDraggable<T>>, "ref"> {
  if (typeof window === "undefined") {
    return { ref: () => {} };
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useDraggable(input);
}

export function useSortableSafe<T extends Data>(
  input: UseSortableInput<T>
): Pick<ReturnType<typeof useSortable<T>>, "ref" | "status" | "handleRef"> {
  if (typeof window === "undefined") {
    return { ref: () => {}, status: "idle", handleRef: () => {} };
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useSortable<T>(input);
}
