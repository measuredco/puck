import getClassNameFactory from "../../../../lib/get-class-name-factory";
import styles from "./styles.module.css";
import { Copy, List, Plus, Trash } from "lucide-react";
import { AutoFieldPrivate, FieldPropsInternal } from "../..";
import { IconButton } from "../../../IconButton";
import { reorder, replace } from "../../../../lib";
import { useCallback, useEffect, useState } from "react";
import { DragIcon } from "../../../DragIcon";
import { ArrayState, ItemWithId } from "../../../../types";
import { getAppStore, useAppStore } from "../../../../stores/app-store";
import { Sortable, SortableProvider } from "../../../Sortable";
import { NestedFieldProvider, useNestedFieldContext } from "../../context";
import { usePermissionsStore } from "../../../../stores/permissions-store";

const getClassName = getClassNameFactory("ArrayField", styles);
const getClassNameItem = getClassNameFactory("ArrayFieldItem", styles);

export const ArrayField = ({
  field,
  onChange,
  value: _value,
  name,
  label,
  readOnly,
  id,
  Label = (props) => <div {...props} />,
}: FieldPropsInternal) => {
  const thisArrayState = useAppStore((s) => s.state.ui.arrayState[id]);
  const setUi = useAppStore((s) => s.setUi);
  const { readOnlyFields, localName = name } = useNestedFieldContext();

  const value: object[] = _value;

  const arrayState = thisArrayState || {
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
  }, [value, thisArrayState]);

  const mapArrayStateToUi = useCallback(
    (partialArrayState: Partial<ArrayState>) => {
      const state = getAppStore().state;
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
    (value: object[]) => {
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
    if (arrayState.items.length > 0) {
      setUi(mapArrayStateToUi(arrayState));
    }
  }, []);

  const [isDragging, setIsDragging] = useState(false);

  const canEdit = usePermissionsStore(
    (s) => s.getPermissions({ item: getAppStore().selectedItem }).edit
  );

  const forceReadOnly = !canEdit;

  if (field.type !== "array" || !field.arrayFields) {
    return null;
  }

  const addDisabled =
    (field.max !== undefined &&
      localState.arrayState.items.length >= field.max) ||
    readOnly;

  return (
    <Label
      label={label || name}
      icon={<List size={16} />}
      el="div"
      readOnly={readOnly}
    >
      <SortableProvider
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        onMove={(move) => {
          const newValue = reorder(value, move.source, move.target);
          const newArrayStateItems: ItemWithId[] = reorder(
            arrayState.items,
            move.source,
            move.target
          );

          const state = getAppStore().state;

          const newUi = {
            arrayState: {
              ...state.ui.arrayState,
              [id]: { ...arrayState, items: newArrayStateItems },
            },
          };
          setUi(newUi, false);
          onChange(newValue, newUi);
          setLocalState({
            value: newValue,
            arrayState: { ...arrayState, items: newArrayStateItems },
          });
        }}
      >
        <div
          className={getClassName({
            hasItems: Array.isArray(value) && value.length > 0,
            addDisabled,
          })}
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          <div className={getClassName("inner")} data-dnd-container>
            {localState.arrayState.items.map((item, i) => {
              const { _arrayId = `${id}-${i}`, _originalIndex = i } = item;
              const data: any = Array.from(localState.value || [])[i] || {};

              return (
                <Sortable
                  key={_arrayId}
                  id={_arrayId}
                  index={i}
                  disabled={readOnly}
                >
                  {({ status, ref }) => (
                    <div
                      ref={ref}
                      className={getClassNameItem({
                        isExpanded: arrayState.openId === _arrayId,
                        isDragging: status === "dragging",
                        readOnly,
                      })}
                    >
                      <div
                        onClick={(e) => {
                          if (isDragging) return;

                          e.preventDefault();
                          e.stopPropagation();

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
                                  type="button"
                                  disabled={!!addDisabled}
                                  onClick={(e) => {
                                    e.stopPropagation();

                                    const existingValue = [...(value || [])];

                                    existingValue.splice(
                                      i,
                                      0,
                                      existingValue[i]
                                    );

                                    onChange(
                                      existingValue,
                                      mapArrayStateToUi(
                                        regenerateArrayState(existingValue)
                                      )
                                    );
                                  }}
                                  title="Duplicate"
                                >
                                  <Copy size={16} />
                                </IconButton>
                              </div>
                              <div className={getClassNameItem("action")}>
                                <IconButton
                                  type="button"
                                  disabled={
                                    field.min !== undefined &&
                                    field.min >=
                                      localState.arrayState.items.length
                                  }
                                  onClick={(e) => {
                                    e.stopPropagation();

                                    const existingValue = [...(value || [])];

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
                        <fieldset
                          className={getClassNameItem("fieldset")}
                          onPointerDownCapture={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          {Object.keys(field.arrayFields!).map((subName) => {
                            const subField = field.arrayFields![subName];

                            const indexName = `${name}[${i}]`;
                            const subPath = `${indexName}.${subName}`;

                            const localIndexName = `${localName}[${i}]`;
                            const localWildcardName = `${localName}[*]`;
                            const localSubPath = `${localIndexName}.${subName}`;
                            const localWildcardSubPath = `${localWildcardName}.${subName}`;

                            const subReadOnly = forceReadOnly
                              ? forceReadOnly
                              : typeof readOnlyFields[subPath] !== "undefined"
                              ? readOnlyFields[localSubPath]
                              : readOnlyFields[localWildcardSubPath];

                            const label = subField.label || subName;

                            return (
                              <NestedFieldProvider
                                key={subPath}
                                name={localIndexName}
                                wildcardName={localWildcardName}
                                subName={subName}
                                readOnlyFields={readOnlyFields}
                              >
                                <AutoFieldPrivate
                                  name={subPath}
                                  label={label}
                                  id={`${_arrayId}_${subName}`}
                                  readOnly={subReadOnly}
                                  field={{
                                    ...subField,
                                    label, // May be used by custom fields
                                  }}
                                  value={data[subName]}
                                  onChange={(val, ui) => {
                                    onChange(
                                      replace(value, i, {
                                        ...data,
                                        [subName]: val,
                                      }),
                                      ui
                                    );
                                  }}
                                />
                              </NestedFieldProvider>
                            );
                          })}
                        </fieldset>
                      </div>
                    </div>
                  )}
                </Sortable>
              );
            })}
          </div>

          {!addDisabled && (
            <button
              type="button"
              className={getClassName("addButton")}
              onClick={() => {
                if (isDragging) return;

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
          )}
        </div>
      </SortableProvider>
    </Label>
  );
};
