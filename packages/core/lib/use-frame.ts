import { useEffect, useState } from "react";
import { getFrame } from "./get-frame";

export const useFrame = () => {
  const [el, setEl] = useState<Element>();

  useEffect(() => {
    setEl(getFrame());
  }, []);

  return el;
};
