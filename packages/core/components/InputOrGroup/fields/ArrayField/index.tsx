import getClassNameFactory from "../../../../lib/get-class-name-factory";
import styles from "./styles.module.css";
import { List, Plus, Trash } from "lucide-react";
import { FieldLabelInternal, InputOrGroup, type InputProps } from "../..";
import { IconButton } from "../../../IconButton";
import { reorder, replace } from "../../../../lib";
import { Droppable } from "@measured/dnd";
import { DragDropContext } from "@measured/dnd";
import { Draggable } from "../../../Draggable";
import { useCallback, useEffect, useState } from "react";
import { DragIcon } from "../../../DragIcon";
import { ArrayState, ItemWithId } from "../../../../types/Config";
import { useAppContext } from "../../../Puck/context";

const getClassName = getClassNameFactory("ArrayField", styles);
const getClassNameItem = getClassNameFactory("ArrayFieldItem", styles);

export const ArrayField = ({
  field,
  onChange,
  value: _value,
  name,
  label,
  readOnly,
  readOnlyFields = {},
  id,
}: InputProps) => {
  const { state, setUi } = useAppContext();

  const value: object[] = _value;

  const arrayState = state.ui.arrayState[id] || {
    items: Array.from(value || []).map((item, idx) => {
      return {
        _originalIndex: idx,
        _arrayId: `${id}-${idx}`,
      };
    }),
    openId: "",
  };

  const [localState, setLocalState] = useState({ arrayState, value });

  useEffect(() => {
    setLocalState({ arrayState, value });
  }, [value, state.ui.arrayState[id]]);

  const mapArrayStateToUi = useCallback(
    (partialArrayState: Partial<ArrayState>) => {
      return {
        arrayState: {
          ...state.ui.arrayState,
          [id]: { ...arrayState, ...partialArrayState },
        },
      };
    },
    [arrayState]
  );

  const getHighestIndex = useCallback(() => {
    return arrayState.items.reduce(
      (acc, item) => (item._originalIndex > acc ? item._originalIndex : acc),
      -1
    );
  }, [arrayState]);

  const regenerateArrayState = useCallback(
    (value) => {
      let highestIndex = getHighestIndex();

      const newItems = Array.from(value || []).map((item, idx) => {
        const arrayStateItem = arrayState.items[idx];

        const newItem = {
          _originalIndex:
            typeof arrayStateItem?._originalIndex !== "undefined"
              ? arrayStateItem._originalIndex
              : highestIndex + 1,
          _arrayId:
            arrayState.items[idx]?._arrayId || `${id}-${highestIndex + 1}`,
        };

        if (newItem._originalIndex > highestIndex) {
          highestIndex = newItem._originalIndex;
        }

        return newItem;
      });

      // We don't need to record history during this useEffect, as the history has already been set by onDragEnd
      return { ...arrayState, items: newItems };
    },
    [arrayState]
  );

  // Create a mirror of value with IDs added for drag and drop
  useEffect(() => {
    setUi(mapArrayStateToUi(arrayState));
  }, []);

  const [hovering, setHovering] = useState(false);

  if (field.type !== "array" || !field.arrayFields) {
    return null;
  }

  return (
    <FieldLabelInternal
      label={label || name}
      icon={<List size={16} />}
      el="div"
      readOnly={readOnly}
    >
      <DragDropContext
        onDragEnd={(event) => {
          if (event.destination) {
            const newValue = reorder(
              value,
              event.source.index,
              event.destination?.index
            );

            const newArrayStateItems: ItemWithId[] = reorder(
              arrayState.items,
              event.source.index,
              event.destination?.index
            );

            onChange(newValue, {
              arrayState: {
                ...state.ui.arrayState,
                [id]: { ...arrayState, items: newArrayStateItems },
              },
            });

            setLocalState({
              value: newValue,
              arrayState: { ...arrayState, items: newArrayStateItems },
            });
          }
        }}
      >
        <Droppable droppableId="array" isDropDisabled={readOnly}>
          {(provided, snapshot) => {
            return (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={getClassName({
                  isDraggingFrom: !!snapshot.draggingFromThisWith,
                  hasItems: Array.isArray(value) && value.length > 0,
                })}
                onMouseOver={(e) => {
                  e.stopPropagation();
                  setHovering(true);
                }}
                onMouseOut={(e) => {
                  e.stopPropagation();
                  setHovering(false);
                }}
              >
                {localState.arrayState.items.map((item, i) => {
                  const { _arrayId = `${id}-${i}`, _originalIndex = i } = item;
                  const data = Array.from(localState.value || [])[i] || {};

                  return (
                    <Draggable
                      id={_arrayId}
                      index={i}
                      key={_arrayId}
                      className={(_, snapshot) =>
                        getClassNameItem({
                          isExpanded: arrayState.openId === _arrayId,
                          isDragging: snapshot?.isDragging,
                          readOnly,
                        })
                      }
                      isDragDisabled={readOnly || !hovering}
                    >
                      {() => (
                        <>
                          <div
                            onClick={() => {
                              if (arrayState.openId === _arrayId) {
                                setUi(
                                  mapArrayStateToUi({
                                    openId: "",
                                  })
                                );
                              } else {
                                setUi(
                                  mapArrayStateToUi({
                                    openId: _arrayId,
                                  })
                                );
                              }
                            }}
                            className={getClassNameItem("summary")}
                          >
                            {field.getItemSummary
                              ? field.getItemSummary(data, i)
                              : `Item #${_originalIndex}`}
                            <div className={getClassNameItem("rhs")}>
                              {!readOnly && (
                                <div className={getClassNameItem("actions")}>
                                  <div className={getClassNameItem("action")}>
                                    <IconButton
                                      disabled={
                                        field.min !== undefined &&
                                        field.min >=
                                          localState.arrayState.items.length
                                      }
                                      onClick={(e) => {
                                        e.stopPropagation();

                                        const existingValue = [
                                          ...(value || []),
                                        ];

                                        const existingItems = [
                                          ...(arrayState.items || []),
                                        ];

                                        existingValue.splice(i, 1);
                                        existingItems.splice(i, 1);

                                        onChange(
                                          existingValue,
                                          mapArrayStateToUi({
                                            items: existingItems,
                                          })
                                        );
                                      }}
                                      title="Delete"
                                    >
                                      <Trash size={16} />
                                    </IconButton>
                                  </div>
                                </div>
                              )}
                              <div>
                                <DragIcon />
                              </div>
                            </div>
                          </div>
                          <div className={getClassNameItem("body")}>
                            <fieldset className={getClassNameItem("fieldset")}>
                              {Object.keys(field.arrayFields!).map(
                                (fieldName) => {
                                  const subField =
                                    field.arrayFields![fieldName];

                                  const subFieldName = `${name}[${i}].${fieldName}`;
                                  const wildcardFieldName = `${name}[*].${fieldName}`;

                                  return (
                                    <InputOrGroup
                                      key={subFieldName}
                                      name={subFieldName}
                                      label={subField.label || fieldName}
                                      id={`${_arrayId}_${fieldName}`}
                                      readOnly={
                                        typeof readOnlyFields[subFieldName] !==
                                        "undefined"
                                          ? readOnlyFields[subFieldName]
                                          : readOnlyFields[wildcardFieldName]
                                      }
                                      readOnlyFields={readOnlyFields}
                                      field={subField}
                                      value={data[fieldName]}
                                      onChange={(val, ui) => {
                                        onChange(
                                          replace(value, i, {
                                            ...data,
                                            [fieldName]: val,
                                          }),
                                          ui
                                        );
                                      }}
                                    />
                                  );
                                }
                              )}
                            </fieldset>
                          </div>
                        </>
                      )}
                    </Draggable>
                  );
                })}

                {provided.placeholder}

                <button
                  className={getClassName("addButton")}
                  disabled={
                    field.max !== undefined &&
                    localState.arrayState.items.length >= field.max
                  }
                  onClick={() => {
                    const existingValue = value || [];

                    const newValue = [
                      ...existingValue,
                      field.defaultItemProps || {},
                    ];

                    const newArrayState = regenerateArrayState(newValue);

                    onChange(newValue, mapArrayStateToUi(newArrayState));
                  }}
                >
                  <Plus size={21} />
                </button>
              </div>
            );
          }}
        </Droppable>
      </DragDropContext>
    </FieldLabelInternal>
  );
};
