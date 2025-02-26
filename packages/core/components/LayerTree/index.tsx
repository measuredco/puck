import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { ComponentConfig, Config, Data } from "../../types";
import { ItemSelector, getItem } from "../../lib/get-item";
import { scrollIntoView } from "../../lib/scroll-into-view";
import { ChevronDown, LayoutGrid, Layers, Type } from "lucide-react";
import { rootDroppableId } from "../../lib/root-droppable-id";
import { useContext } from "react";
import { dropZoneContext } from "../DropZone/context";
import { findZonesForArea } from "../../lib/find-zones-for-area";
import { getZoneId } from "../../lib/get-zone-id";
import { getFrame } from "../../lib/get-frame";
import { onScrollEnd } from "../../lib/on-scroll-end";
import { useAppStore } from "../../store";

const getClassName = getClassNameFactory("LayerTree", styles);
const getClassNameLayer = getClassNameFactory("Layer", styles);

export const LayerTree = ({
  data,
  config,
  zoneContent,
  itemSelector,
  setItemSelector,
  zone,
  label,
}: {
  data: Data;
  config: Config;
  zoneContent: Data["content"];
  itemSelector?: ItemSelector | null;
  setItemSelector: (item: ItemSelector | null) => void;
  zone?: string;
  label?: string;
}) => {
  const zones = data.zones || {};
  const ctx = useContext(dropZoneContext);

  // TODO change this for performance
  const nodes = useAppStore((s) => s.nodes.nodes);

  return (
    <>
      {label && (
        <div className={getClassName("zoneTitle")}>
          <div className={getClassName("zoneIcon")}>
            <Layers size="16" />
          </div>{" "}
          {label}
        </div>
      )}
      <ul className={getClassName()}>
        {zoneContent.length === 0 && (
          <div className={getClassName("helper")}>No items</div>
        )}
        {zoneContent.map((item, i) => {
          const isSelected =
            itemSelector?.index === i &&
            (itemSelector.zone === zone ||
              (itemSelector.zone === rootDroppableId && !zone));

          const zonesForItem = findZonesForArea(data, item.props.id);
          const containsZone = Object.keys(zonesForItem).length > 0;

          const { setHoveringComponent = () => {}, hoveringComponent } =
            ctx || {};

          const selectedItem =
            itemSelector && data ? getItem(itemSelector, data) : null;

          const isHovering = hoveringComponent === item.props.id;

          const path = selectedItem
            ? nodes[selectedItem?.props.id]?.path ?? []
            : [];

          const childIsSelected =
            path?.some((candidate) => {
              const [candidateId] = candidate.split(":");

              return candidateId === item.props.id;
            }) ?? false;

          const componentConfig: ComponentConfig | undefined =
            config.components[item.type];
          const label = componentConfig?.["label"] ?? item.type.toString();

          return (
            <li
              className={getClassNameLayer({
                isSelected,
                isHovering,
                containsZone,
                childIsSelected,
              })}
              key={`${item.props.id}_${i}`}
            >
              <div className={getClassNameLayer("inner")}>
                <button
                  type="button"
                  className={getClassNameLayer("clickable")}
                  onClick={() => {
                    if (isSelected) {
                      setItemSelector(null);
                      return;
                    }

                    const id = zoneContent[i].props.id;

                    const frame = getFrame();

                    const el = frame?.querySelector(
                      `[data-puck-component="${id}"]`
                    );

                    if (!el) {
                      console.error(
                        "Scroll failed. No element was found for",
                        id
                      );

                      return;
                    }

                    scrollIntoView(el as HTMLElement);

                    onScrollEnd(frame, () => {
                      setItemSelector({
                        index: i,
                        zone,
                      });
                    });
                  }}
                  onMouseOver={(e) => {
                    e.stopPropagation();
                    setHoveringComponent(item.props.id);
                  }}
                  onMouseOut={(e) => {
                    e.stopPropagation();
                    setHoveringComponent(null);
                  }}
                >
                  {containsZone && (
                    <div
                      className={getClassNameLayer("chevron")}
                      title={isSelected ? "Collapse" : "Expand"}
                    >
                      <ChevronDown size="12" />
                    </div>
                  )}
                  <div className={getClassNameLayer("title")}>
                    <div className={getClassNameLayer("icon")}>
                      {item.type === "Text" || item.type === "Heading" ? (
                        <Type size="16" />
                      ) : (
                        <LayoutGrid size="16" />
                      )}
                    </div>
                    <div className={getClassNameLayer("name")}>{label}</div>
                  </div>
                </button>
              </div>
              {containsZone &&
                Object.keys(zonesForItem).map((zoneKey, idx) => (
                  <div key={idx} className={getClassNameLayer("zones")}>
                    <LayerTree
                      config={config}
                      data={data}
                      zoneContent={zones[zoneKey]}
                      setItemSelector={setItemSelector}
                      itemSelector={itemSelector}
                      zone={zoneKey}
                      label={getZoneId(zoneKey)[1]}
                    />
                  </div>
                ))}
            </li>
          );
        })}
      </ul>
    </>
  );
};
