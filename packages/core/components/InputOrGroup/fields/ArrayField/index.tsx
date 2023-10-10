import getClassNameFactory from "../../../../lib/get-class-name-factory";
import inputStyles from "../../styles.module.css";
import styles from "./styles.module.css";
import { List, Plus, Trash } from "react-feather";
import { InputOrGroup, type InputProps } from "../..";
import { IconButton } from "../../../IconButton";
import { reorder, replace } from "../../../../lib";
import DroppableStrictMode from "../../../DroppableStrictMode";
import { DragDropContext } from "react-beautiful-dnd";
import { Draggable } from "../../../Draggable";
import { generateId } from "../../../../lib/generate-id";
import { useEffect, useState } from "react";
import { DragIcon } from "../../../DragIcon";

const getClassNameInput = getClassNameFactory("Input", inputStyles);
const getClassName = getClassNameFactory("ArrayField", styles);
const getClassNameItem = getClassNameFactory("ArrayFieldItem", styles);

type ItemWithId = {
  _arrayId: string;
  data: any;
};

export const ArrayField = ({
  field,
  onChange,
  value,
  name,
  label,
}: InputProps) => {
  const [valueWithIds, setValueWithIds] = useState<ItemWithId[]>(value);

  // Create a mirror of value with IDs added for drag and drop
  useEffect(() => {
    const newValueWithIds = value.map((item, idx) => ({
      _arrayId: valueWithIds[idx]?._arrayId || generateId("ArrayItem"),
      data: item,
    }));

    setValueWithIds(newValueWithIds);
  }, [value]);

  const [openId, setOpenId] = useState("");

  if (!field.arrayFields) {
    return null;
  }

  return (
    <div className={getClassNameInput()}>
      <b className={getClassNameInput("label")}>
        <div className={getClassNameInput("labelIcon")}>
          <List size={16} />
        </div>
        {label || name}
      </b>
      <DragDropContext
        onDragEnd={(event) => {
          if (event.destination) {
            const newValue: ItemWithId[] = reorder(
              valueWithIds,
              event.source.index,
              event.destination?.index
            );

            setValueWithIds(newValue);
            onChange(newValue.map(({ _arrayId, data }) => data));
          }
        }}
      >
        <DroppableStrictMode droppableId="array">
          {(provided, snapshot) => {
            return (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={getClassName({
                  isDraggingFrom: !!snapshot.draggingFromThisWith,
                  hasItems: value.length > 0,
                })}
              >
                {Array.isArray(value) && value.length > 0
                  ? valueWithIds.map(({ _arrayId, data }, i) => (
                      <Draggable
                        id={_arrayId}
                        index={i}
                        key={_arrayId}
                        className={(_, snapshot) =>
                          getClassNameItem({
                            isExpanded: openId === _arrayId,
                            isDragging: snapshot.isDragging,
                          })
                        }
                      >
                        {() => (
                          <>
                            <div
                              onClick={() => {
                                if (openId === _arrayId) {
                                  setOpenId("");
                                } else {
                                  setOpenId(_arrayId);
                                }
                              }}
                              className={getClassNameItem("summary")}
                            >
                              {field.getItemSummary
                                ? field.getItemSummary(data, i)
                                : `Item #${i}`}
                              <div className={getClassNameItem("rhs")}>
                                <div className={getClassNameItem("actions")}>
                                  <div className={getClassNameItem("action")}>
                                    <IconButton
                                      onClick={() => {
                                        const existingValue = value || [];
                                        const existingValueWithIds =
                                          valueWithIds || [];

                                        existingValue.splice(i, 1);
                                        existingValueWithIds.splice(i, 1);

                                        onChange(existingValue);
                                        setValueWithIds(existingValueWithIds);
                                      }}
                                      title="Delete"
                                    >
                                      <Trash size={16} />
                                    </IconButton>
                                  </div>
                                </div>
                                <div>
                                  <DragIcon />
                                </div>
                              </div>
                            </div>
                            <div className={getClassNameItem("body")}>
                              <fieldset
                                className={getClassNameItem("fieldset")}
                              >
                                {Object.keys(field.arrayFields!).map(
                                  (fieldName) => {
                                    const subField =
                                      field.arrayFields![fieldName];

                                    return (
                                      <InputOrGroup
                                        key={`${name}_${i}_${fieldName}`}
                                        name={`${name}_${i}_${fieldName}`}
                                        label={subField.label || fieldName}
                                        field={subField}
                                        value={data[fieldName]}
                                        onChange={(val) =>
                                          onChange(
                                            replace(value, i, {
                                              ...data,
                                              [fieldName]: val,
                                            })
                                          )
                                        }
                                      />
                                    );
                                  }
                                )}
                              </fieldset>
                            </div>
                          </>
                        )}
                      </Draggable>
                    ))
                  : null}

                {provided.placeholder}

                <button
                  className={getClassName("addButton")}
                  onClick={() => {
                    const existingValue = value || [];
                    onChange([...existingValue, field.defaultItemProps || {}]);
                  }}
                >
                  <Plus size="21" />
                </button>
              </div>
            );
          }}
        </DroppableStrictMode>
      </DragDropContext>
    </div>
  );
};
