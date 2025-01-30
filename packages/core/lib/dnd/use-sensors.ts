import { useState } from "react";
import { PointerSensor } from "./PointerSensor";
import { isElement } from "@dnd-kit/dom/utilities";

export const useSensors = () => {
  const [sensors] = useState(() => [
    PointerSensor.configure({
      activationConstraints(event, source) {
        const { pointerType, target } = event;

        if (
          pointerType === "mouse" &&
          isElement(target) &&
          (source.handle === target || source.handle?.contains(target))
        ) {
          return undefined;
        }

        const delay = { value: 200, tolerance: 10 };

        if (pointerType === "touch") {
          return { delay };
        }

        return {
          delay,
          distance: { value: 5 },
        };
      },
    }),
  ]);

  return sensors;
};
