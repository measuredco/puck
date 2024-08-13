"use client";

import { Button, Data, Puck, Render } from "@/core";
import headingAnalyzer from "@/plugin-heading-analyzer/src/HeadingAnalyzer";
import config, { UserConfig } from "../../config";
import { useDemoData } from "../../lib/use-demo-data";

import { Lock, Unlock } from "lucide-react";

export function Client({ path, isEdit }: { path: string; isEdit: boolean }) {
  const { data, resolvedData, key } = useDemoData({
    path,
    isEdit,
  });

  if (isEdit) {
    return (
      <div>
        <Puck<UserConfig>
          config={config}
          data={data}
          onPublish={async (data: Data) => {
            localStorage.setItem(key, JSON.stringify(data));
          }}
          plugins={[headingAnalyzer]}
          headerPath={path}
          overrides={{
            headerActions: ({ children }) => (
              <>
                <div>
                  <Button href={path} newTab variant="secondary">
                    View page
                  </Button>
                </div>
                {children}
              </>
            ),
            overlayActions: ({ children, state, dispatch }) => {
              let newData = { ...state.data };

              let isEditable = false;
              if (state.ui.itemSelector) {
                const index = state.ui.itemSelector.index;

                const updatedContent = [...newData.content];
                const updatedActions = {
                  ...updatedContent[index].overlayActions,
                };

                isEditable = !updatedActions.isEditable;
                updatedActions.isEditable = isEditable;
                updatedContent[index] = {
                  ...updatedContent[index],
                  overlayActions: updatedActions,
                };

                newData.content = updatedContent;
              }

              return (
                <>
                  <div
                    style={{
                      display: "flex",
                    }}
                  >
                    <button
                      className={"styles_DraggableComponent-action__LbbWP"}
                      onClick={() => {
                        dispatch({
                          type: "setData",
                          data: newData,
                        });
                      }}
                    >
                      {isEditable ? <Unlock size={16} /> : <Lock size={16} />}
                    </button>
                  </div>
                  {children}
                </>
              );
            },
          }}
        />
      </div>
    );
  }

  if (data) {
    return <Render<UserConfig> config={config} data={resolvedData} />;
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
