"use client";

import { Button, Data, Puck, Render } from "@/core";
import { HeadingAnalyzer } from "@/plugin-heading-analyzer/src/HeadingAnalyzer";
import config, { UserConfig } from "../../../config";
import { useDemoData } from "../../../lib/use-demo-data";
import { IconButton, usePuck } from "@/core";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Drawer } from "@/core/components/Drawer";
import { ChevronUp, ChevronDown, Globe } from "lucide-react";

const CustomHeader = ({ onPublish }: { onPublish: (data: Data) => void }) => {
  const { appState, dispatch } = usePuck();

  return (
    <header
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 16,
        padding: "16px 24px",
        background: "white",
        color: "black",
        alignItems: "center",
        borderBottom: "1px solid #ddd",
      }}
      onClick={() => dispatch({ type: "setUi", ui: { itemSelector: null } })}
    >
      <span style={{ fontWeight: 600 }}>Custom UI example </span>
      <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
        <div>
          <Button
            onClick={() => onPublish(appState.data)}
            icon={<Globe size="14" />}
          >
            Publish
          </Button>
        </div>
      </div>
    </header>
  );
};

const Tabs = ({
  tabs,
  onTabCollapse,
  scrollTop,
}: {
  tabs: { label: string; body: ReactNode }[];
  onTabCollapse: () => void;
  scrollTop: number;
}) => {
  const [currentTab, setCurrentTab] = useState(-1);
  const { appState } = usePuck();

  const currentTabRef = useRef(currentTab);

  useEffect(() => {
    if (currentTabRef.current !== -1 && appState.ui.itemSelector) {
      setCurrentTab(1);
    }
  }, [appState.ui.itemSelector]);

  useEffect(() => {
    currentTabRef.current = currentTab;
  }, [currentTab]);

  useEffect(() => {
    if (appState.ui.isDragging && currentTab === 1) {
      setCurrentTab(-1);
    }
  }, [currentTab, appState.ui.isDragging]);

  useEffect(() => {
    if (scrollTop === 0) {
      setCurrentTab(-1);
      onTabCollapse();
    }
  }, [scrollTop]);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: "#ffffff",
        pointerEvents: "all",
        borderTop: "1px solid #ddd",
        boxShadow: "rgba(140, 152, 164, 0.25) 0px 0px 6px 0px",
      }}
    >
      <div
        style={{
          display: "flex",
          paddingLeft: 16,
          paddingRight: 16,
          borderBottom: "1px solid #ddd",
          overflowX: "auto",
        }}
      >
        {tabs.map((tab, idx) => {
          const isCurrentTab = currentTab === idx;
          return (
            <button
              key={idx}
              onClick={() => {
                if (currentTab === idx) {
                  setCurrentTab(-1);
                } else {
                  setCurrentTab(idx);
                  if (scrollTop < 20) {
                    setTimeout(() => {
                      document
                        .querySelector("#action-bar")
                        .scroll({ top: 128, behavior: "smooth" });
                    }, 25);
                  }
                }
              }}
              style={{
                fontFamily: "inherit",
                fontSize: 16,
                padding: "16px 16px",
                paddingTop: 19,
                color: isCurrentTab ? "var(--puck-color-azure-04)" : "black",
                border: "none",
                borderBottom: isCurrentTab
                  ? "3px solid var(--puck-color-azure-04)"
                  : "3px solid transparent",
                background: "white",
                cursor: "pointer",
              }}
            >
              {tab.label}
            </button>
          );
        })}
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div>
            <IconButton
              onClick={() => {
                setCurrentTab(currentTab === -1 ? 0 : -1);

                if (currentTab !== -1) {
                  onTabCollapse();
                } else {
                  setTimeout(() => {
                    document
                      .querySelector("#action-bar")
                      .scroll({ top: 128, behavior: "smooth" });
                  }, 25);
                }
              }}
              title={currentTab !== -1 ? "Collapse Tabs" : "Expand Tabs"}
            >
              {currentTab === -1 ? <ChevronUp /> : <ChevronDown />}
            </IconButton>
          </div>
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        {tabs.map((tab, idx) => {
          const isCurrentTab = currentTab === idx;
          return (
            <div
              key={idx}
              style={{
                display: isCurrentTab ? "block" : "none",
              }}
            >
              {tab.body}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CustomPuck = ({ dataKey }: { dataKey: string }) => {
  const [hoveringTabs, setHoveringTabs] = useState(false);

  const [actionBarScroll, setActionBarScroll] = useState(0);

  return (
    <div
      style={{
        position: "relative",
      }}
    >
      <div style={{ position: "sticky", top: 0, zIndex: 2 }}>
        <CustomHeader
          onPublish={async (data: Data) => {
            localStorage.setItem(dataKey, JSON.stringify(data));
          }}
        />
      </div>
      <div
        style={{
          position: "relative",
          overflowY: hoveringTabs ? "hidden" : "auto",
          height: "100vh",
          zIndex: 0,
        }}
      >
        <Puck.Preview />
      </div>
      <div
        id="action-bar"
        style={{
          position: "fixed",
          bottom: 0,
          overflowY: "auto",
          overflowX: "hidden",
          maxHeight: "100vh",
          width: "100%",
          boxSizing: "border-box",
          paddingTop: "calc(100vh - 58px)",
          pointerEvents: hoveringTabs ? undefined : "none",
          zIndex: 1,
          overscrollBehavior: "none",
        }}
        onTouchStart={() => setHoveringTabs(false)}
        onScrollCapture={(e) => {
          setActionBarScroll(e.currentTarget.scrollTop);
        }}
      >
        <div
          style={{
            background: "white",
            position: "relative",
            pointerEvents: "none",
            zIndex: 0,
          }}
          onMouseOver={(e) => {
            e.stopPropagation();
            setHoveringTabs(true);
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            setHoveringTabs(true);
          }}
          onMouseOut={() => {
            setHoveringTabs(false);
          }}
        >
          {/* Force react to render when hoveringTabs changes, otherwise scroll gets trapped */}
          {hoveringTabs && <span />}
          <Tabs
            onTabCollapse={() => {
              setTimeout(() => setHoveringTabs(false), 50);
            }}
            scrollTop={actionBarScroll}
            tabs={[
              { label: "Components", body: <Puck.Components /> },
              { label: "Fields", body: <Puck.Fields /> },
              { label: "Outline", body: <Puck.Outline /> },
              {
                label: "Headings",
                body: (
                  <div style={{ padding: 24 }}>
                    <HeadingAnalyzer />
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export function Client({ path, isEdit }: { path: string; isEdit: boolean }) {
  const { data, resolvedData, key } = useDemoData({
    path,
    isEdit,
  });

  if (isEdit) {
    return (
      <Puck<UserConfig>
        config={config}
        data={data}
        iframe={{ enabled: false }}
        headerPath={path}
        overrides={{
          outline: ({ children }) => (
            <div style={{ padding: 16 }}>{children}</div>
          ),
          components: () => {
            return (
              <Drawer direction="horizontal">
                <div
                  style={{
                    display: "flex",
                    pointerEvents: "all",
                    padding: "16px",
                    background: "var(--puck-color-grey-12)",
                  }}
                >
                  {Object.keys(config.components).map(
                    (componentKey, componentIndex) => (
                      <Drawer.Item
                        key={componentKey}
                        name={componentKey}
                        index={componentIndex}
                      >
                        {({ children }) => (
                          <div
                            style={{
                              marginRight: 8,
                            }}
                          >
                            {children}
                          </div>
                        )}
                      </Drawer.Item>
                    )
                  )}
                </div>
              </Drawer>
            );
          },
          puck: () => <CustomPuck dataKey={key} />,
        }}
      />
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
