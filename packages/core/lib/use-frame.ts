import { useEffect, useState } from "react";
import { getFrame } from "./get-frame";

export const useFrame = () => {
  const [el, setEl] = useState<Element | Document>();

  useEffect(() => {
    const frame = getFrame();

    if (frame) {
      setEl(frame);
    }
  }, []);

  return el;
};
