import { useEffect, useState } from "react";

export const useModifierHeld = (modifier: "Shift" | "Alt" | "Control") => {
  const [modifierHeld, setModifierHeld] = useState(false);

  function downHandler({ key }) {
    if (key === modifier) {
      setModifierHeld(true);
    }
  }

  function upHandler({ key }) {
    if (key === modifier) {
      setModifierHeld(false);
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);
    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, []);

  return modifierHeld;
};
