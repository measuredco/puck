// react-from-json does not work with server components due to use of class components. This should still support SSR.
"use client";

import ReactFromJSON from "react-from-json";
import { Fragment, useEffect, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import DroppableStrictMode from "../lib/droppable-strict-mode";
import config from "../lib/config";
import { DraggableComponent } from "./DraggableComponent";
import type { Field } from "../types/Config";

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
  const [data, setData] = useState(config.initialData);
  const [selectedIndex, setSelectedIndex] = useState<string | null>(null);
  const [lockedFields, setLockedFields] = useState<string[]>([]);

  const Base = config.mapping.Base || Fragment;

  const fields =
    selectedIndex !== null
      ? (config.fields[data[selectedIndex].type] as Record<string, Field<any>>)
      : {};

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "256px auto 256px",
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
              minHeight: "calc(100vh - 32px)",
              paddingBottom: 64,
              overflow: "hidden",
            }}
          >
            <Base>
              <DragDropContext
                onDragEnd={(droppedItem) => {
                  setData(
                    reorder(
                      data,
                      droppedItem.source.index,
                      droppedItem.destination.index
                    )
                  );
                }}
              >
                <DroppableStrictMode droppableId="droppable">
                  {(provided, snapshot) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
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
                              {config.mapping[item._type](item)}
                            </DraggableComponent>
                          ),
                        }}
                      />

                      {provided.placeholder}
                    </div>
                  )}
                </DroppableStrictMode>
              </DragDropContext>
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
      </div>
    </>
  );
}
