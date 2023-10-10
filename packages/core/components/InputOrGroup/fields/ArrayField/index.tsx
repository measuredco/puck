import getClassNameFactory from "../../../../lib/get-class-name-factory";
import styles from "../../styles.module.css";
import { List, Trash } from "react-feather";
import { InputOrGroup, type InputProps } from "../..";
import { IconButton } from "../../../IconButton";
import { reorder, replace } from "../../../../lib";
import DroppableStrictMode from "../../../DroppableStrictMode";
import { DragDropContext } from "react-beautiful-dnd";
import { Draggable } from "../../../Draggable";
import { generateId } from "../../../../lib/generate-id";
import { useEffect, useState } from "react";

const getClassName = getClassNameFactory("Input", styles);

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

  if (!field.arrayFields) {
    return null;
  }

  return (
    <div className={getClassName()}>
      <b className={getClassName("label")}>
        <div className={getClassName("labelIcon")}>
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
          {(provided) => {
            return (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={getClassName("array")}
              >
                {Array.isArray(value) ? (
                  valueWithIds.map(({ _arrayId, data }, i) => (
                    <Draggable id={_arrayId} index={i} key={_arrayId}>
                      <details className={getClassName("arrayItem")}>
                        <summary>
                          {field.getItemSummary
                            ? field.getItemSummary(data, i)
                            : `Item #${i}`}

                          <div className={getClassName("arrayItemAction")}>
                            <IconButton
                              onClick={() => {
                                const existingValue = value || [];
                                const existingValueWithIds = valueWithIds || [];

                                existingValue.splice(i, 1);
                                existingValueWithIds.splice(i, 1);

                                onChange(existingValue);
                                setValueWithIds(existingValueWithIds);
                              }}
                              title="Delete"
                            >
                              <Trash size={21} />
                            </IconButton>
                          </div>
                        </summary>
                        <fieldset className={getClassName("fieldset")}>
                          {Object.keys(field.arrayFields!).map((fieldName) => {
                            const subField = field.arrayFields![fieldName];

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
                          })}
                        </fieldset>
                      </details>
                    </Draggable>
                  ))
                ) : (
                  <div />
                )}

                {provided.placeholder}

                <button
                  className={getClassName("addButton")}
                  onClick={() => {
                    const existingValue = value || [];
                    onChange([...existingValue, field.defaultItemProps || {}]);
                  }}
                >
                  + Add item
                </button>
              </div>
            );
          }}
        </DroppableStrictMode>
      </DragDropContext>
    </div>
  );
};
