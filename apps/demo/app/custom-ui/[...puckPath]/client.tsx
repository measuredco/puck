"use client";

import { Data } from "@/core/types/Config";
import { Puck } from "@/core/components/Puck";
import { Render } from "@/core/components/Render";
import { Button } from "@/core/components/Button";
import { HeadingAnalyzer } from "@/plugin-heading-analyzer/src/HeadingAnalyzer";
import config from "../../../config";
import { useDemoData } from "../../../lib/use-demo-data";
import { ComponentListDroppable, IconButton, usePuck } from "@/core";
import { ReactNode, useEffect, useRef, useState } from "react";
import { ComponentListItem } from "@/core/components/ComponentList";
import { ChevronUp, ChevronDown, Globe } from "react-feather";

const CustomHeader = ({ onPublish }: { onPublish: (data: Data) => void }) => {
  const { appState, dispatch } = usePuck();

  return (
    <header
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 16,
        padding: "16px 24px",
        background: "#ffffff90",
        color: "black",
        alignItems: "center",
        borderBottom: "1px solid #ddd",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
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
}: {
  tabs: { label: string; body: ReactNode }[];
  onTabCollapse: () => void;
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
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {tabs.map((tab, idx) => {
          const isCurrentTab = currentTab === idx;
          return (
            <div
              key={idx}
              onClick={() => {
                setCurrentTab(idx);
              }}
              style={{
                padding: "16px 16px",
                paddingTop: 19,
                color: isCurrentTab ? "var(--puck-color-azure-3)" : "black",
                borderBottom: isCurrentTab
                  ? "3px solid var(--puck-color-azure-3)"
                  : "3px solid transparent",
              }}
            >
              {tab.label}
            </div>
          );
        })}
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <IconButton
            onClick={() => {
              setCurrentTab(currentTab === -1 ? 0 : -1);
              onTabCollapse();
            }}
            title={currentTab !== -1 ? "Collapse Tabs" : "Expand Tabs"}
          >
            {currentTab === -1 ? <ChevronUp /> : <ChevronDown />}
          </IconButton>
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

const CustomPuck = ({ key }: { key: string }) => {
  const [hoveringTabs, setHoveringTabs] = useState(false);

  const tabsOffset = "75vh";

  return (
    <div
      style={{
        position: "relative",
      }}
    >
      <div style={{ position: "sticky", top: 0, zIndex: 2 }}>
        <CustomHeader
          onPublish={async (data: Data) => {
            localStorage.setItem(key, JSON.stringify(data));
          }}
        />
      </div>
      <div
        style={{
          position: "relative",
          overflowY: hoveringTabs ? "hidden" : "auto",
          marginBottom: 58, // Magic number: height of action bar
          height: "100vh",
          zIndex: 0,
        }}
      >
        <Puck.Preview />
      </div>
      <div
        style={{
          position: "fixed",
          bottom: 0,
          overflowY: "auto",
          maxHeight: "100vh",
          width: "100%",
          boxSizing: "border-box",
          paddingTop: tabsOffset,
          pointerEvents: hoveringTabs ? undefined : "none",
          zIndex: 1,
        }}
        onTouchStart={() => setHoveringTabs(false)}
      >
        <div
          style={{
            background: "white",
            position: "relative",
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
          onMouseOut={() => setHoveringTabs(false)}
        >
          {/* Force react to render when hoveringTabs changes, otherwise scroll gets trapped */}
          {hoveringTabs && <span />}
          <Tabs
            onTabCollapse={() => {
              setTimeout(() => setHoveringTabs(false), 50);
            }}
            tabs={[
              { label: "Components", body: <Puck.Components /> },
              { label: "Fields", body: <Puck.Fields /> },
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
      <Puck
        config={config}
        data={data}
        headerPath={path}
        customUi={{
          headerActions: () => (
            <>
              <div>
                <Button href={path} newTab variant="secondary">
                  View page
                </Button>
              </div>
            </>
          ),
          componentListItem: ({ children }) => {
            return (
              <div style={{ marginRight: 8, color: "black" }}>{children}</div>
            );
          },
          componentList: () => {
            return (
              <ComponentListDroppable
                droppableId={`component-list`}
                direction="horizontal"
              >
                <div
                  style={{
                    display: "flex",
                    pointerEvents: "all",
                    padding: "16px 24px",
                    background: "var(--puck-color-grey-11)",
                  }}
                >
                  {Object.keys(config.components).map(
                    (componentKey, componentIndex) => (
                      <ComponentListItem
                        key={componentKey}
                        component={componentKey}
                        index={componentIndex}
                      ></ComponentListItem>
                    )
                  )}
                </div>
              </ComponentListDroppable>
            );
          },
          puck: () => <CustomPuck key={key} />,
        }}
      ></Puck>
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
