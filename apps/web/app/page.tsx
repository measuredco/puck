// react-from-json does not work with server components due to use of class components. This should still support SSR.
"use client";

import ReactFromJSON from "react-from-json";
import { Fragment, useEffect, useState } from "react";
import { DragDropContext, Draggable } from "react-beautiful-dnd";
import DroppableStrictMode from "../lib/droppable-strict-mode";
import config, { initialData } from "../lib/config";
import { DraggableComponent } from "./DraggableComponent";
import type { ComponentConfig, Field } from "../types/Config";

const reorder = (list: any[], startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const replace = (list: any[], index, newItem) => {
  const result = Array.from(list);
  result.splice(index, 1);
  result.splice(index, 0, newItem);

  return result;
};

const filter = (obj: object, validKeys: string[]) => {
  return validKeys.reduce((acc, item) => {
    if (typeof obj[item] !== "undefined") {
      return { ...acc, [item]: obj[item] };
    }

    return acc;
  }, {});
};

const ExternalInput = ({ field, onChange }: { field: any; onChange: any }) => {
  const [data, setData] = useState([]);
  const [isOpen, setOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  useEffect(() => {
    (async () => {
      setData(await field.adaptor.fetchList(field.adaptorParams));
    })();
  }, [field.adaptor, field.adaptorParams]);

  return (
    <div>
      <div style={{ display: "flex" }}>
        <button onClick={() => setOpen(true)}>
          {selectedData
            ? `${field.adaptor.name}: ${selectedData.attributes.title}`
            : `Select from ${field.adaptor.name}`}
        </button>
        {selectedData && (
          <button
            onClick={() => {
              setSelectedData(null);
              onChange({ currentTarget: { value: null } });
            }}
          >
            Detach
          </button>
        )}
      </div>
      <div
        style={{
          background: "#00000080",
          justifyContent: "center",
          alignItems: "center",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          display: isOpen ? "flex" : "none",
          zIndex: 1,
        }}
        onClick={() => setOpen(false)}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 1024,
            padding: 32,
            borderRadius: 32,
            overflow: "hidden",
            background: "white",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2>Select content</h2>

          {data.length ? (
            <div style={{ overflowX: "scroll" }}>
              <table cellPadding="8" cellSpacing="8">
                <tr>
                  {Object.keys(data[0].attributes).map((key) => (
                    <th key={key} style={{ textAlign: "left" }}>
                      {key}
                    </th>
                  ))}
                </tr>
                {data.map((item) => {
                  return (
                    <tr
                      key={item.id}
                      style={{ whiteSpace: "nowrap" }}
                      onClick={(e) => {
                        onChange({
                          ...e,
                          // This is a dirty hack until we have a proper form lib
                          currentTarget: {
                            ...e.currentTarget,
                            value: item,
                          },
                        });

                        setOpen(false);

                        setSelectedData(item);
                      }}
                    >
                      {Object.keys(item.attributes).map((key) => (
                        <td key={key}>{item.attributes[key]}</td>
                      ))}
                    </tr>
                  );
                })}
              </table>
            </div>
          ) : (
            <div>No content</div>
          )}
        </div>
      </div>
    </div>
  );
};

const InputOrGroup = ({
  name,
  field,
  value,
  onChange,
  readOnly,
}: {
  name: string;
  field: Field<any>;
  value: any;
  onChange: (e: React.FormEvent<HTMLInputElement>) => void;
  readOnly: boolean;
}) => {
  if (field.type === "group") {
    if (!field.items) {
      return null;
    }

    // Can't support groups until we have proper form system
    return <div>Groups not supported yet</div>;
  }

  if (field.type === "external") {
    if (!field.adaptor) {
      return null;
    }

    return (
      <>
        <div>{name}</div>
        <ExternalInput field={field} onChange={onChange} />
      </>
    );
  }

  return (
    <label>
      <div>{name}</div>
      {/* TODO use proper form lib */}
      <input
        autoComplete="off"
        type={field.type}
        name={name}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
      />
    </label>
  );
};

export default function Page() {
  const [data, setData] = useState(initialData);
  const [selectedIndex, setSelectedIndex] = useState<string | null>(null);
  const [lockedFields, setLockedFields] = useState<string[]>([]);

  const { Base: BaseConfig, ...configWithoutBase } = config;

  const Base = BaseConfig?.render || Fragment;

  const fields =
    selectedIndex !== null
      ? (config[data[selectedIndex].type].fields as Record<string, Field<any>>)
      : {};

  return (
    <>
      <DragDropContext
        onDragEnd={(droppedItem) => {
          console.log("dropped", droppedItem);

          // New component
          if (droppedItem.source.droppableId === "component-list") {
            const emptyComponentData = {
              type: droppedItem.draggableId,
              props: {
                id: `${droppedItem.draggableId}-${new Date().getTime()}`, // TODO make random string
              },
            };

            const newData = [...data];

            newData.splice(
              droppedItem.destination.index,
              0,
              emptyComponentData
            );

            setData(newData);
          } else {
            setData(
              reorder(
                data,
                droppedItem.source.index,
                droppedItem.destination.index
              )
            );
          }
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "312px auto 312px",
            height: "100vh",
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          }}
        >
          <div>
            <div style={{ borderBottom: "1px solid #dedede", padding: 16 }}>
              <h2>Outline</h2>
              <ul>
                <ReactFromJSON
                  entry={data}
                  mapping={{
                    default: (item) => (
                      <li>
                        {item._type}
                        {typeof item.children === "object" && item.children && (
                          <ul>{item.children}</ul>
                        )}
                      </li>
                    ),
                  }}
                />
              </ul>
            </div>
            <div style={{ padding: 16 }}>
              <h2>Components</h2>
              <div
                style={{
                  display: "grid",
                  gridGap: 16,
                }}
              >
                <DroppableStrictMode
                  droppableId="component-list"
                  isDropDisabled
                >
                  {(provided, snapshot) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {Object.keys(configWithoutBase).map((componentKey, i) => {
                        const componentConfig: ComponentConfig =
                          config[componentKey];

                        return (
                          <Draggable
                            key={componentKey}
                            draggableId={componentKey}
                            index={i}
                          >
                            {(provided, snapshot) => (
                              <>
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <div
                                    style={{
                                      background: "white",
                                      padding: 8,
                                      display: "flex",
                                      border: "1px #ccc solid",
                                      borderRadius: 8,
                                      marginBottom: 16,
                                    }}
                                  >
                                    {componentKey}
                                  </div>
                                </div>
                                {/* Needs CSS adding, per https://github.com/atlassian/react-beautiful-dnd/issues/216#issuecomment-423708497 */}
                                {snapshot.isDragging && (
                                  <div
                                    style={{
                                      padding: 8,
                                      display: "flex",
                                      border: "1px #ccc solid",
                                      borderRadius: 8,
                                      marginBottom: 16,
                                    }}
                                  >
                                    {componentKey}
                                  </div>
                                )}
                              </>
                            )}
                          </Draggable>
                        );
                      })}
                    </div>
                  )}
                </DroppableStrictMode>
              </div>
            </div>
          </div>
          <div
            style={{ background: "#dedede", padding: 32, overflowY: "auto" }}
            onClick={() => setSelectedIndex(null)}
          >
            <div
              style={{
                background: "#eee",
                border: "1px solid #dedede",
                borderRadius: 32,

                overflow: "hidden",
              }}
            >
              <Base>
                <DroppableStrictMode droppableId="droppable">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      style={{
                        minHeight: "calc(100vh - 32px)",
                        paddingBottom: 64,
                      }}
                    >
                      {/* Using ReactFromJSON here instead of mapping over should allow us to do nestable draging */}
                      <ReactFromJSON
                        entry={data}
                        mapping={{
                          default: (item, i) => (
                            <DraggableComponent
                              id={`draggable-${item.id}`}
                              index={item.propIndex}
                              isSelected={selectedIndex === item.propIndex}
                              onClick={(e) => {
                                setSelectedIndex(item.propIndex);
                                e.stopPropagation();
                              }}
                            >
                              {config[item._type].render(item)}
                            </DraggableComponent>
                          ),
                        }}
                      />

                      {provided.placeholder}
                    </div>
                  )}
                </DroppableStrictMode>
              </Base>
            </div>
          </div>
          <div style={{ padding: 16 }}>
            {selectedIndex !== null ? (
              <>
                <h2>{data[selectedIndex].type}</h2>

                {Object.keys(fields).map((fieldName) => {
                  const field = fields[fieldName];

                  return (
                    <InputOrGroup
                      key={`${data[selectedIndex].props.id}_${fieldName}`}
                      field={field}
                      name={fieldName}
                      readOnly={lockedFields.indexOf(fieldName) > -1}
                      value={data[selectedIndex].props[fieldName]}
                      onChange={(e) => {
                        const value = e.currentTarget.value;

                        // In case of _data, we replace everything
                        if (fieldName === "_data") {
                          // Reset the link if value is falsey
                          if (!value) {
                            setData(
                              replace(data, selectedIndex, {
                                ...data[selectedIndex],
                                _meta: {},
                              })
                            );

                            setLockedFields([]);

                            return;
                          }

                          const changedFields = filter(
                            // filter out anything not supported by this component
                            (value as any).attributes, // TODO type properly after getting proper state library
                            Object.keys(fields)
                          );

                          setData(
                            replace(data, selectedIndex, {
                              ...data[selectedIndex],
                              _meta: {
                                adaptorId: (value as any).id,
                              },
                              props: {
                                ...data[selectedIndex].props,
                                ...changedFields,
                              },
                            })
                          );

                          setLockedFields(Object.keys(changedFields));
                        } else {
                          setData(
                            replace(data, selectedIndex, {
                              ...data[selectedIndex],
                              props: {
                                ...data[selectedIndex].props,
                                [fieldName]: value,
                              },
                            })
                          );
                        }
                      }}
                    />
                  );
                })}
              </>
            ) : null}
          </div>
        </div>{" "}
      </DragDropContext>
    </>
  );
}
