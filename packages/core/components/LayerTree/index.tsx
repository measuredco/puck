import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { Data } from "../../types/Config";
import { ItemSelector } from "../../lib/get-item";
import { scrollIntoView } from "../../lib/scroll-into-view";
import { ChevronDown, Grid, Layers, Type } from "react-feather";
import { rootDroppableId } from "../../lib/root-droppable-id";
import { useContext } from "react";
import { dropZoneContext } from "../DropZone/context";
import { findDropzonesForArea } from "../../lib/find-dropzones-for-area";
import { getDropzoneId } from "../../lib/get-dropzone-id";

const getClassName = getClassNameFactory("LayerTree", styles);
const getClassNameLayer = getClassNameFactory("Layer", styles);

export const LayerTree = ({
  data,
  dropzoneContent,
  itemSelector,
  setItemSelector,
  dropzone,
  label,
}: {
  data: Data;
  dropzoneContent: Data["content"];
  itemSelector: ItemSelector | null;
  setItemSelector: (item: ItemSelector | null) => void;
  dropzone?: string;
  label?: string;
}) => {
  const dropzones = data.dropzones || {};

  const ctx = useContext(dropZoneContext);

  return (
    <>
      {label && (
        <div className={getClassName("dropzoneTitle")}>
          <div className={getClassName("dropzoneIcon")}>
            <Layers size="16" />
          </div>{" "}
          {label}
        </div>
      )}
      <ul className={getClassName()}>
        {dropzoneContent.length === 0 && (
          <div className={getClassName("helper")}>No items</div>
        )}
        {dropzoneContent.map((item, i) => {
          const isSelected =
            itemSelector?.index === i &&
            (itemSelector.dropzone === dropzone ||
              (itemSelector.dropzone === rootDroppableId && !dropzone));

          const dropzonesForItem = findDropzonesForArea(data, item.props.id);
          const containsDropzone = Object.keys(dropzonesForItem).length > 0;

          const {
            setHoveringArea = () => {},
            setHoveringComponent = () => {},
            hoveringComponent,
          } = ctx || {};

          const isHovering = hoveringComponent === item.props.id;

          return (
            <li
              className={getClassNameLayer({
                isSelected,
                isHovering,
                containsDropzone,
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
                      dropzone,
                    });

                    const id = dropzoneContent[i].props.id;

                    scrollIntoView(
                      document.querySelector(
                        `[data-rbd-drag-handle-draggable-id="draggable-${id}"]`
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
                  {containsDropzone && (
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
              {containsDropzone &&
                Object.keys(dropzonesForItem).map((dropzoneKey, idx) => (
                  <div key={idx} className={getClassNameLayer("dropzones")}>
                    <LayerTree
                      data={data}
                      dropzoneContent={dropzones[dropzoneKey]}
                      setItemSelector={setItemSelector}
                      itemSelector={itemSelector}
                      dropzone={dropzoneKey}
                      label={getDropzoneId(dropzoneKey)[1]}
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
