import { ReactElement, ReactNode, useEffect, useState } from "react";

import { Data } from "core/types/Config";
import { Plugin } from "core/types/Plugin";
import { SidebarSection } from "core/SidebarSection";
import { OutlineList } from "core/OutlineList";

import ReactFromJSON from "react-from-json";

const getOutline = () => {
  const headings = window.document
    .querySelector(".puck")!
    .querySelectorAll("h1,h2,h3,h4,h5,h6");

  const _outline: { rank: number; text: string }[] = [];

  headings.forEach((item) => {
    _outline.push({
      rank: parseInt(item.tagName.split("H")[1]),
      text: item.textContent!,
    });
  });

  return _outline;
};

type Block = {
  rank: number;
  text: string;
  children?: Block[];
  missing?: boolean;
};
type Heading<T> = { text: string; children: T[]; valid: boolean };

function buildHierarchy(): Block[] {
  const headings = getOutline();

  const root = { rank: 0, children: [], text: "" }; // Placeholder root node
  let path: Block[] = [root];

  for (let heading of headings) {
    const node: Block = {
      rank: heading.rank,
      text: heading.text,
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

const HeadingOutlineAnalyser = ({
  children,
  data,
}: {
  children: ReactNode;
  data: Data;
}) => {
  const [hierarchy, setHierarchy] = useState<Block[]>([]);
  const [firstRender, setFirstRender] = useState(true);

  // Re-render when content changes
  useEffect(() => {
    // We need to delay to allow remainder of page to render first

    if (firstRender) {
      setTimeout(() => {
        setHierarchy(buildHierarchy());
        setFirstRender(false);
      }, 100);
    } else {
      setHierarchy(buildHierarchy());
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.content]);

  return (
    <div>
      {children}
      <SidebarSection title="Heading Outline">
        {hierarchy.length === 0 && <div>No headings.</div>}

        <OutlineList>
          <ReactFromJSON<{
            Root: (any) => ReactElement;
            OutlineListItem: (any) => ReactElement;
          }>
            mapping={{
              Root: (props) => <>{props.children}</>,
              OutlineListItem: (props) => (
                <OutlineList.Item>
                  <small>
                    {props.missing ? (
                      <span style={{ color: "var(--puck-color-red)" }}>
                        <b>H{props.rank}</b>: Missing
                      </span>
                    ) : (
                      <span>
                        <b>H{props.rank}</b>: {props.text}
                      </span>
                    )}
                  </small>
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
      </SidebarSection>
    </div>
  );
};

const HeadingAnalyzer: Plugin = {
  renderPageFields: HeadingOutlineAnalyser,
};

export default HeadingAnalyzer;
