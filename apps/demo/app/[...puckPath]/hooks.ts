import { useCallback, useState } from "react";
import config from "../../config";
import { Data } from "@measured/puck";

export const useLocalData = (path: string) => {
  // unique b64 key that updates each time we add / remove components
  const componentKey = Buffer.from(
    Object.keys(config.components).join("-")
  ).toString("base64");

  const key = `puck-demo:${componentKey}:${path}`;

  const [data] = useState(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const dataStr = localStorage.getItem(key);

    if (dataStr) {
      return JSON.parse(dataStr) as Data;
    }

    return null;
  });

  const setData = useCallback(
    (data: Data) => localStorage.setItem(key, JSON.stringify(data)),
    [key]
  );

  return [data, setData] as const;
};
