import getClassNameFactory from "../../../../lib/get-class-name-factory";
import styles from "./styles.module.css";
import { List, Plus, Trash } from "react-feather";
import { FieldLabelInternal, InputOrGroup, type InputProps } from "../..";
import { IconButton } from "../../../IconButton";
import { reorder, replace } from "../../../../lib";
import { Droppable } from "@hello-pangea/dnd";
import { DragDropContext } from "@hello-pangea/dnd";
import { Draggable } from "../../../Draggable";
import { generateId } from "../../../../lib/generate-id";
import { useCallback, useEffect, useState } from "react";
import { DragIcon } from "../../../DragIcon";
import { ArrayState, ItemWithId } from "../../../../types/Config";
import { useAppContext } from "../../../Puck/context";

const getClassName = getClassNameFactory("ArrayField", styles);
const getClassNameItem = getClassNameFactory("ArrayFieldItem", styles);

export const ArrayField = ({
  field,
  onChange,
  value,
  name,
  label,
  readOnly,
  readOnlyFields = {},
}: InputProps) => {
  const [arrayFieldId] = useState(generateId("ArrayField"));

  const { state, setUi } = useAppContext();

  const arrayState: ArrayState = state.ui.arrayState[arrayFieldId] || {
    items: Array.from(value || []).map<ItemWithId>((v) => ({
      _arrayId: generateId("ArrayItem"),
      data: v,
    })),
    openId: "",
  };

  const setArrayState = useCallback(
    (newArrayState: Partial<ArrayState>, recordHistory: boolean = false) => {
      setUi(
        {
          arrayState: {
            ...state.ui.arrayState,
            [arrayFieldId]: { ...arrayState, ...newArrayState },
          },
        },
        recordHistory
      );
    },
    [arrayState]
  );

  // Create a mirror of value with IDs added for drag and drop
  useEffect(() => {
    const newItems = Array.from(value || []).map((item, idx) => ({
      _arrayId: arrayState.items[idx]?._arrayId || generateId("ArrayItem"),
      data: item,
    }));

    // We don't need to record history during this useEffect, as the history has already been set by onDragEnd
    setArrayState({ items: newItems });
  }, [value]);

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
            const newValue: ItemWithId[] = reorder(
              arrayState.items,
              event.source.index,
              event.destination?.index
            );

            setArrayState({ ...arrayState, items: newValue }, false);
            onChange(newValue.map(({ data }) => data));
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
              >
                {Array.isArray(value) && value.length > 0
                  ? arrayState.items.map(({ _arrayId, data }, i) => (
                      <Draggable
                        id={_arrayId}
                        index={i}
                        key={_arrayId}
                        className={(_, snapshot) =>
                          getClassNameItem({
                            isExpanded: arrayState.openId === _arrayId,
                            isDragging: snapshot.isDragging,
                            readOnly,
                          })
                        }
                        isDragDisabled={readOnly}
                      >
                        {() => (
                          <>
                            <div
                              onClick={() => {
                                if (arrayState.openId === _arrayId) {
                                  setArrayState({
                                    openId: "",
                                  });
                                } else {
                                  setArrayState({
                                    openId: _arrayId,
                                  });
                                }
                              }}
                              className={getClassNameItem("summary")}
                            >
                              {field.getItemSummary
                                ? field.getItemSummary(data, i)
                                : `Item #${i}`}
                              <div className={getClassNameItem("rhs")}>
                                {!readOnly && (
                                  <div className={getClassNameItem("actions")}>
                                    <div className={getClassNameItem("action")}>
                                      <IconButton
                                        onClick={() => {
                                          const existingValue = [
                                            ...(value || []),
                                          ];
                                          const existingItems = [
                                            ...(arrayState.items || []),
                                          ];

                                          existingValue.splice(i, 1);
                                          existingItems.splice(i, 1);

                                          setArrayState(
                                            { items: existingItems },
                                            true
                                          );
                                          onChange(existingValue);
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
                              <fieldset
                                className={getClassNameItem("fieldset")}
                              >
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
                                        readOnly={
                                          typeof readOnlyFields[
                                            subFieldName
                                          ] !== "undefined"
                                            ? readOnlyFields[subFieldName]
                                            : readOnlyFields[wildcardFieldName]
                                        }
                                        readOnlyFields={readOnlyFields}
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
        </Droppable>
      </DragDropContext>
    </FieldLabelInternal>
  );
};
