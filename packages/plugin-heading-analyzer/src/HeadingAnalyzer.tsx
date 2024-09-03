import { ReactElement, useEffect, useState } from "react";

import styles from "./HeadingAnalyzer.module.css";

import { usePuck } from "@measured/puck";
import { Plugin } from "@/core/types";
import { SidebarSection } from "@/core/components/SidebarSection";
import { OutlineList } from "@/core/components/OutlineList";

import { scrollIntoView } from "@/core/lib/scroll-into-view";
import { getFrame } from "@/core/lib/get-frame";

import { getClassNameFactory } from "@/core/lib";

const getClassName = getClassNameFactory("HeadingAnalyzer", styles);
const getClassNameItem = getClassNameFactory("HeadingAnalyzerItem", styles);

import ReactFromJSONModule from "react-from-json";

// Synthetic import
const ReactFromJSON =
  (ReactFromJSONModule as unknown as { default: typeof ReactFromJSONModule })
    .default || ReactFromJSONModule;

const dataAttr = "data-puck-heading-analyzer-id";

const getOutline = ({
  addDataAttr = false,
  frame,
}: { addDataAttr?: boolean; frame?: Element | Document } = {}) => {
  const headings = frame?.querySelectorAll("h1,h2,h3,h4,h5,h6") || [];

  const _outline: { rank: number; text: string; analyzeId: string }[] = [];

  headings.forEach((item, i) => {
    if (addDataAttr) {
      item.setAttribute(dataAttr, i.toString());
    }

    _outline.push({
      rank: parseInt(item.tagName.split("H")[1]),
      text: item.textContent!,
      analyzeId: i.toString(),
    });
  });

  return _outline;
};

type Block = {
  rank: number;
  text: string;
  children?: Block[];
  missing?: boolean;
  analyzeId?: string;
};

function buildHierarchy(frame: Element | Document): Block[] {
  const headings = getOutline({ addDataAttr: true, frame });

  const root = { rank: 0, children: [], text: "" }; // Placeholder root node
  let path: Block[] = [root];

  for (let heading of headings) {
    const node: Block = {
      rank: heading.rank,
      text: heading.text,
      analyzeId: heading.analyzeId,
      children: [],
    };

    // When encountering an h1, reset the path to only the root
    if (node.rank === 1) {
      path = [root];
    } else {
      // Go up the path until finding a node where this heading can be a child
      while (path[path.length - 1].rank >= node.rank) {
        path.pop();
      }

      // Add missing nodes if necessary
      while (path.length < node.rank) {
        const missingNode: Block = {
          rank: path.length,
          missing: true,
          children: [],
          text: "",
        };
        path[path.length - 1].children?.push(missingNode);
        path.push(missingNode);
      }
    }

    // Add this node to its parent in the path and update path
    path[path.length - 1].children?.push(node);
    path.push(node);
  }

  return root.children;
}

export const HeadingAnalyzer = () => {
  const { appState } = usePuck();
  const [hierarchy, setHierarchy] = useState<Block[]>([]);
  const [firstRender, setFirstRender] = useState(true);

  // Re-render when content changes
  useEffect(() => {
    const frame = getFrame();

    if (!frame) return;

    // We need to delay to allow remainder of page to render first
    if (firstRender) {
      setTimeout(() => {
        setHierarchy(buildHierarchy(frame));
        setFirstRender(false);
      }, 100);
    } else {
      setHierarchy(buildHierarchy(frame));
    }
  }, [appState.data]);

  return (
    <div className={getClassName()}>
      <small
        className={getClassName("cssWarning")}
        style={{
          color: "var(--puck-color-red-04)",
          display: "block",
          marginBottom: 16,
        }}
      >
        Heading analyzer styles not loaded. Please review the{" "}
        <a href="https://github.com/measuredco/puck/blob/main/packages/plugin-heading-analyzer/README.md">
          README
        </a>
        .
      </small>

      {hierarchy.length === 0 && <div>No headings.</div>}

      <OutlineList>
        <ReactFromJSON<{
          Root: (props: any) => ReactElement;
          OutlineListItem: (props: any) => ReactElement;
        }>
          mapping={{
            Root: (props) => <>{props.children}</>,
            OutlineListItem: (props) => (
              <OutlineList.Item>
                <OutlineList.Clickable>
                  <small
                    className={getClassNameItem({ missing: props.missing })}
                    onClick={
                      typeof props.analyzeId == "undefined"
                        ? undefined
                        : (e) => {
                            e.stopPropagation();

                            const frame = getFrame();

                            const el = frame?.querySelector(
                              `[${dataAttr}="${props.analyzeId}"]`
                            ) as HTMLElement;

                            const oldStyle = { ...el.style };

                            if (el) {
                              scrollIntoView(el);

                              el.style.outline =
                                "4px solid var(--puck-color-rose-06)";
                              el.style.outlineOffset = "4px";

                              setTimeout(() => {
                                el.style.outline = oldStyle.outline || "";
                                el.style.outlineOffset =
                                  oldStyle.outlineOffset || "";
                              }, 2000);
                            }
                          }
                    }
                  >
                    {props.missing ? (
                      <>
                        <b>H{props.rank}</b>: Missing
                      </>
                    ) : (
                      <>
                        <b>H{props.rank}</b>: {props.text}
                      </>
                    )}
                  </small>
                </OutlineList.Clickable>
                <OutlineList>{props.children}</OutlineList>
              </OutlineList.Item>
            ),
          }}
          entry={{
            props: { children: hierarchy },
            type: "Root",
          }}
          mapProp={(prop) => {
            if (prop && prop.rank) {
              return {
                type: "OutlineListItem",
                props: prop,
              };
            }

            return prop;
          }}
        />
      </OutlineList>
    </div>
  );
};

const headingAnalyzer: Plugin = {
  overrides: {
    fields: ({ children, itemSelector }) => (
      <>
        {children}
        <div style={{ display: itemSelector ? "none" : "block" }}>
          <SidebarSection title="Heading Outline">
            <HeadingAnalyzer />
          </SidebarSection>
        </div>
      </>
    ),
  },
};

export default headingAnalyzer;
