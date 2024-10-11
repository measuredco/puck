import { useEffect, useState } from "react";

export const useModifierHeld = (modifier: "Shift" | "Alt" | "Control") => {
  const [modifierHeld, setModifierHeld] = useState(false);
  const [mouseDown, setMouseDown] = useState(false);

  useEffect(() => {
    function downHandler({ key }: KeyboardEvent) {
      if (key === modifier) {
        setModifierHeld(true);
      }
    }

    function upHandler({ key }: KeyboardEvent) {
      if (key === modifier && !mouseDown) {
        setModifierHeld(false);
      }
    }

    function mouseDownHandler() {
      setMouseDown(true);
    }

    function mouseUpHandler() {
      setMouseDown(false);
      setModifierHeld(false);
    }

    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);
    window.addEventListener("mousedown", mouseDownHandler);
    window.addEventListener("mouseup", mouseUpHandler);

    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
      window.removeEventListener("mousedown", mouseDownHandler);
      window.removeEventListener("mouseup", mouseUpHandler);
    };
  }, [modifier, mouseDown]);

  return modifierHeld;
};
