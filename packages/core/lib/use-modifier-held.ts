import { useEffect, useState } from "react";

export const useModifierHeld = (modifier: "Shift" | "Alt" | "Control") => {
  const [modifierHeld, setModifierHeld] = useState(false);

  useEffect(() => {
    function downHandler({ key }: KeyboardEvent) {
      if (key === modifier) {
        setModifierHeld(true);
      }
    }

    function upHandler({ key }: KeyboardEvent) {
      if (key === modifier) {
        setModifierHeld(false);
      }
    }

    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);
    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, [modifier]);

  return modifierHeld;
};
