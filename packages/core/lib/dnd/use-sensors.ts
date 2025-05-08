import { useState } from "react";
import { ActivationConstraints, PointerSensor } from "./PointerSensor";
import { isElement } from "@dnd-kit/dom/utilities";

export const useSensors = (
  {
    other,
    mouse,
    touch,
  }: {
    mouse?: ActivationConstraints;
    touch?: ActivationConstraints;
    other?: ActivationConstraints;
  } = {
    touch: { delay: { value: 200, tolerance: 10 } },
    other: { delay: { value: 200, tolerance: 10 }, distance: { value: 5 } },
  }
) => {
  const [sensors] = useState(() => [
    PointerSensor.configure({
      activationConstraints(event, source) {
        const { pointerType, target } = event;

        if (
          pointerType === "mouse" &&
          isElement(target) &&
          (source.handle === target || source.handle?.contains(target))
        ) {
          return mouse;
        }

        if (pointerType === "touch") {
          return touch;
        }

        return other;
      },
    }),
  ]);

  return sensors;
};
