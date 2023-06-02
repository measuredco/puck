// react-from-json does not work with server components due to use of class components. This should still support SSR.
"use client";

import ReactFromJSON from "react-from-json";
import { ReactNode, useState } from "react";
import { DragDropContext, Draggable } from "react-beautiful-dnd";
import DroppableStrictMode from "../lib/droppable-strict-mode";
import { mapping, initialData } from "../lib/config";
import { DraggableComponent } from "./DraggableComponent";

const reorder = (list: any[], startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export default function Page() {
  const [data, setData] = useState(initialData);
  const [selectedIndex, setSelectedIndex] = useState<string | null>(null);

  const Base = mapping.Base || "div";

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
                      {item._type} {console.log(item)}
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
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      // style={getListStyle(snapshot.isDraggingOver)}
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
                              {mapping[item._type](item)}
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
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
