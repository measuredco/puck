// react-from-json does not work with server components due to use of class components. This should still support SSR.
"use client";

import ReactFromJSON from "react-from-json";
import { useState } from "react";
import { DragDropContext, Draggable } from "react-beautiful-dnd";
import DroppableStrictMode from "../lib/droppable-strict-mode";
import { mapping, initialData } from "../lib/config";

const reorder = (list: any[], startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export default function Page() {
  const [data, setData] = useState(initialData);

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
        <div style={{ background: "#dedede", padding: 32, overflowY: "auto" }}>
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
                            <Draggable
                              key={`drag_${i}`}
                              draggableId={`draggable-${item.id}`}
                              index={item.propIndex}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  {mapping[item._type](item)}
                                </div>
                              )}
                            </Draggable>
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
          <h2>Content</h2>
        </div>
      </div>
    </>
  );
}
