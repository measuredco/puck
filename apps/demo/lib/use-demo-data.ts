import { useEffect, useState } from "react";
import config, { initialData, Props, RootProps, UserData } from "../config";
import { resolveAllData } from "@/core";

const isBrowser = typeof window !== "undefined";

export const useDemoData = ({
  path,
  isEdit,
}: {
  path: string;
  isEdit: boolean;
}) => {
  // unique b64 key that updates each time we add / remove components
  const componentKey = Buffer.from(
    `${Object.keys(config.components).join("-")}-${JSON.stringify(initialData)}`
  ).toString("base64");

  const key = `puck-demo:${componentKey}:${path}`;

  const [data] = useState<Partial<UserData>>(() => {
    if (isBrowser) {
      const dataStr = localStorage.getItem(key);

      if (dataStr) {
        return JSON.parse(dataStr);
      }

      return initialData[path] || {};
    }
  });

  // Normally this would happen on the server, but we can't
  // do that because we're using local storage as a database
  const [resolvedData, setResolvedData] = useState<Partial<UserData>>(data);

  useEffect(() => {
    if (data && !isEdit) {
      resolveAllData<Props, RootProps>(data, config).then(setResolvedData);
    }
  }, [data, isEdit]);

  useEffect(() => {
    if (!isEdit) {
      const title = data?.root?.props?.title || data?.root?.title;
      document.title = title || "";
    }
  }, [data, isEdit]);

  return { data, resolvedData, key };
};
