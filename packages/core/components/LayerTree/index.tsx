import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { Data } from "../../types/Config";
import { ItemSelector, getItem } from "../../lib/get-item";
import { scrollIntoView } from "../../lib/scroll-into-view";
import { ChevronDown, Grid, Layers, Type } from "react-feather";
import { rootDroppableId } from "../../lib/root-droppable-id";
import { useContext } from "react";
import { dropZoneContext } from "../DropZone/context";
import { findZonesForArea } from "../../lib/find-zones-for-area";
import { getZoneId } from "../../lib/get-zone-id";
import { isChildOfZone } from "../../lib/is-child-of-zone";

const getClassName = getClassNameFactory("LayerTree", styles);
const getClassNameLayer = getClassNameFactory("Layer", styles);

export const LayerTree = ({
  data,
  zoneContent,
  itemSelector,
  setItemSelector,
  zone,
  label,
}: {
  data: Data;
  zoneContent: Data["content"];
  itemSelector?: ItemSelector | null;
  setItemSelector: (item: ItemSelector | null) => void;
  zone?: string;
  label?: string;
}) => {
  const zones = data.zones || {};

  const ctx = useContext(dropZoneContext);

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

          const {
            setHoveringArea = () => {},
            setHoveringComponent = () => {},
            hoveringComponent,
          } = ctx || {};

          const selectedItem =
            itemSelector && data ? getItem(itemSelector, data) : null;

          const isHovering = hoveringComponent === item.props.id;

          const childIsSelected = isChildOfZone(item, selectedItem, ctx);

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
                <div
                  className={getClassNameLayer("clickable")}
                  onClick={() => {
                    if (isSelected) {
                      setItemSelector(null);
                      return;
                    }

                    setItemSelector({
                      index: i,
                      zone,
                    });

                    const id = zoneContent[i].props.id;

                    scrollIntoView(
                      document.querySelector(
                        `[data-rfd-drag-handle-draggable-id="draggable-${id}"]`
                      ) as HTMLElement
                    );
                  }}
                  onMouseOver={(e) => {
                    e.stopPropagation();
                    setHoveringArea(item.props.id);
                    setHoveringComponent(item.props.id);
                  }}
                  onMouseOut={(e) => {
                    e.stopPropagation();
                    setHoveringArea(null);
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
                        <Grid size="16" />
                      )}
                    </div>
                    {item.type}
                  </div>
                </div>
              </div>
              {containsZone &&
                Object.keys(zonesForItem).map((zoneKey, idx) => (
                  <div key={idx} className={getClassNameLayer("zones")}>
                    <LayerTree
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
