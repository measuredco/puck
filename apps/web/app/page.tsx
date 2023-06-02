// react-from-json does not work with server components due to use of class components. This should still support SSR.
"use client";

import ReactFromJSON from "react-from-json";
import { Fragment, useState } from "react";
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

const InputOrGroup = ({
  name,
  field,
  value,
  onChange,
}: {
  name: string;
  field: Field<any>;
  value: any;
  onChange: (e: React.FormEvent<HTMLInputElement>) => void;
}) => {
  if (field.type === "group") {
    if (!field.items) {
      return null;
    }

    // Can't support groups until we have proper form system
    return <div>Groups not supported yet</div>;
  }

  return (
    <label>
      <div>{name}</div>
      {/* TODO use proper form lib */}
      <input type={field.type} name={name} value={value} onChange={onChange} />
    </label>
  );
};

export default function Page() {
  const [data, setData] = useState(config.initialData);
  const [selectedIndex, setSelectedIndex] = useState<string | null>(null);

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
                    value={data[selectedIndex].props[fieldName]}
                    onChange={(e) => {
                      const value = e.currentTarget.value;

                      const updatedData = replace(data, selectedIndex, {
                        ...data[selectedIndex],
                        props: {
                          ...data[selectedIndex].props,
                          [fieldName]: value,
                        },
                      });

                      setData([...updatedData]);
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
