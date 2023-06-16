"use client";

import { Data } from "core/types/Config";
import { Puck, Render } from "core";
import { Framework } from "../../Framework";
import { useEffect, useState } from "react";
import { Button } from "core/Button";
import headingAnalyzer from "../../../../../packages/plugin-heading-analyzer";

const isBrowser = typeof window !== "undefined";

export function Client({
  path,
  isEdit,
  framework,
}: {
  path: string;
  isEdit: boolean;
  framework: Framework;
}) {
  const config = require(`../../configs/${framework}/`).default;
  const initialData = require(`../../configs/${framework}/`).initialData || {};

  const key = `puck-demo:${framework}:${path}`;

  const [data] = useState<Data>(() => {
    if (isBrowser) {
      const dataStr = localStorage.getItem(key);

      if (dataStr) {
        return JSON.parse(dataStr);
      }

      return initialData[path] || undefined;
    }
  });

  useEffect(() => {
    if (!isEdit) {
      document.title = data?.page?.title || "";
    }
  }, [data]);

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
          renderHeader={({ children }) => (
            <>
              <div
                style={{
                  color: "var(--puck-color-yellow-3)",
                  padding: "8px 12px",
                  background: "var(--puck-color-yellow-8)",
                  textAlign: "center",
                }}
              >
                <b>Demo</b>: Using local storage.
              </div>

              <div style={{ display: "flex", padding: 16 }}>
                <div>
                  <label>
                    <select
                      onChange={(e) => {
                        document.location = `/${e.currentTarget.value}/${path}/edit`;
                      }}
                      style={{
                        padding: 0,
                        fontSize: 24,
                        fontWeight: 600,
                        border: "none",
                        background: "transparent",
                        color: "white",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                      }}
                      defaultValue={framework}
                    >
                      <option value="antd">Ant Design</option>
                      <option value="material-ui">Material UI</option>
                    </select>
                  </label>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    flexGrow: 1,
                    justifyContent: "flex-end",
                  }}
                >
                  <Button
                    href={`/${framework}/${path}`}
                    newTab
                    variant="secondary"
                  >
                    View page
                  </Button>
                  {children}
                </div>
              </div>
            </>
          )}
        />
      </div>
    );
  }

  if (data) {
    return <Render config={config} data={data} />;
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
