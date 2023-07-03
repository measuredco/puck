"use client";

import { Data } from "@measured/puck/types/Config";
import { Puck, Render } from "@measured/puck";
import { Framework } from "../../Framework";
import { useEffect, useState } from "react";
import { Button } from "@measured/puck/Button";
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
                        background:
                          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='white'><polygon points='0,0 100,0 50,50'/></svg>\") no-repeat",
                        backgroundSize: "12px",
                        backgroundPosition: "calc(100% - 8px) calc(50% + 4px)",
                        backgroundRepeat: "no-repeat",
                        backgroundColor: "transparent",
                        appearance: "none",
                        padding: 0,
                        paddingRight: 32,
                        fontSize: 24,
                        fontWeight: 600,
                        border: "none",
                        color: "white",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                        fontFamily: "var(--puck-font-family)",
                      }}
                      defaultValue={framework}
                    >
                      <option value="antd">Ant Design</option>
                      <option value="material-ui">Material UI</option>
                      <option value="custom">Custom Example</option>
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
