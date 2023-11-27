"use client";

import { Data } from "@/core/types/Config";
import { resolveAllData } from "@/core/lib/resolve-all-data";
import { Puck } from "@/core/components/Puck";
import { Render } from "@/core/components/Render";
import { useEffect, useState } from "react";
import { Button } from "@/core/components/Button";
import headingAnalyzer from "@/plugin-heading-analyzer/src/HeadingAnalyzer";
import config, { initialData } from "../../config";

const isBrowser = typeof window !== "undefined";

export function Client({ path, isEdit }: { path: string; isEdit: boolean }) {
  // unique b64 key that updates each time we add / remove components
  const componentKey = Buffer.from(
    `${Object.keys(config.components).join("-")}-${JSON.stringify(initialData)}`
  ).toString("base64");

  const key = `puck-demo:${componentKey}:${path}`;

  const [data] = useState<Data>(() => {
    if (isBrowser) {
      const dataStr = localStorage.getItem(key);

      if (dataStr) {
        return JSON.parse(dataStr);
      }

      return initialData[path] || undefined;
    }
  });

  // Normally this would happen on the server, but we can't
  // do that because we're using local storage as a database
  const [resolvedData, setResolvedData] = useState(data);

  useEffect(() => {
    if (data && !isEdit) {
      resolveAllData(data, config).then(setResolvedData);
    }
  }, [data, isEdit]);

  useEffect(() => {
    if (!isEdit) {
      const title = data?.root.props?.title || data.root.title;
      document.title = title || "";
    }
  }, [data, isEdit]);

  if (isEdit) {
    return (
      <div>
        <Puck
          config={config}
          data={data}
          onPublish={async (data: Data) => {
            localStorage.setItem(key, JSON.stringify(data));
          }}
          plugins={[headingAnalyzer]}
          headerPath={path}
          renderHeaderActions={() => (
            <>
              <div>
                <Button href={path} newTab variant="secondary">
                  View page
                </Button>
              </div>
            </>
          )}
        />
      </div>
    );
  }

  if (data) {
    return <Render config={config} data={resolvedData} />;
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        textAlign: "center",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div>
        <h1>404</h1>
        <p>Page does not exist in session storage</p>
      </div>
    </div>
  );
}

export default Client;
