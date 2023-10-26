"use client";

import { Data, resolveData } from "@measured/puck";
import { Puck } from "@measured/puck/components/Puck";
import { Render } from "@measured/puck/components/Render";
import { useEffect, useState } from "react";
import { Button } from "@measured/puck/components/Button";
import headingAnalyzer from "@measured/puck-plugin-heading-analyzer/src/HeadingAnalyzer";
import config from "../../config";
import { useLocalData } from "./hooks";
import { publishPageData } from "./actions";

export function Client({
  path,
  data: serverData,
  isEdit,
}: {
  data: Data;
  path: string;
  isEdit: boolean;
}) {
  const [localData, setLocalData] = useLocalData(path);

  // Make sure the demo has seed data even if there is no database
  const data = localData || serverData || undefined;

  // Normally this would happen on the server, but we can't
  // do that because we're using local storage as a database
  const [resolvedData, setResolvedData] = useState(data);

  useEffect(() => {
    if (data && !isEdit) {
      resolveData(data, config).then(setResolvedData);
    }
  }, [data, isEdit]);

  useEffect(() => {
    if (!isEdit) {
      document.title = data?.root?.title || "";
    }
  }, [data, isEdit]);

  if (isEdit) {
    return (
      <div>
        <Puck
          config={config}
          data={data}
          onChange={(data) => setLocalData(data)}
          onPublish={(data) => publishPageData(path, data)}
          plugins={[headingAnalyzer]}
          headerPath={path}
          renderHeaderActions={() => (
            <>
              <Button href={`${path}/preview`} newTab variant="secondary">
                Preview page
              </Button>
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
