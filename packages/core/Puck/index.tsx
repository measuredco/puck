"use client";

import { Fragment, useEffect, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import DroppableStrictMode from "../DroppableStrictMode";
import { DraggableComponent } from "../DraggableComponent";
import type { Config, Data, Field } from "../types/Config";
import { InputOrGroup } from "../InputOrGroup";
import { ComponentList } from "../ComponentList";
import { OutlineList } from "../OutlineList";
import { Heading } from "../Heading";
import { filter, reorder, replace } from "../lib";
import { Button } from "../Button";

const Field = () => {};

const Space = () => <div style={{ marginBottom: 16 }} />;

const defaultPageFields: Record<string, Field> = {
  title: { type: "text" },
};

export function Puck({
  config,
  data: initialData = { content: [], page: { title: "" } },
  onChange,
  onPublish,
}: {
  config: Config;
  data: Data;
  onChange?: (data: Data) => void;
  onPublish: (data: Data) => void;
}) {
  const [data, setData] = useState(initialData);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [lockedFields, setLockedFields] = useState<string[]>([]);

  const Page = config.page?.render || Fragment;

  const pageFields = config.page?.fields || defaultPageFields;

  let fields =
    selectedIndex !== null
      ? (config.components[data.content[selectedIndex].type]?.fields as Record<
          string,
          Field<any>
        >) || {}
      : pageFields;

  useEffect(() => {
    if (onChange) onChange(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <div className="puck">
      <DragDropContext
        onDragEnd={(droppedItem) => {
          if (!droppedItem.destination) {
            console.warn("No destination specified");
            return;
          }

          // New component
          if (droppedItem.source.droppableId === "component-list") {
            const emptyComponentData = {
              type: droppedItem.draggableId,
              props: {
                id: `${droppedItem.draggableId}-${new Date().getTime()}`, // TODO make random string
              },
            };

            const newData = { ...data };

            newData.content.splice(
              droppedItem.destination.index,
              0,
              emptyComponentData
            );

            setData(newData);
          } else {
            setData({
              ...data,
              content: reorder(
                data.content,
                droppedItem.source.index,
                droppedItem.destination.index
              ),
            });
          }
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateAreas: '"header header header" "left editor right"',
            gridTemplateColumns: "256px auto 256px",
            gridTemplateRows: "min-content auto",
            height: "100vh",
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          }}
        >
          <header
            style={{
              display: "flex",

              gridArea: "header",
              borderBottom: "1px solid #cccccc",
              padding: 16,
            }}
          >
            <div style={{ marginLeft: "auto" }}>
              <Button
                onClick={() => {
                  onPublish(data);
                }}
              >
                Publish
              </Button>
            </div>
          </header>
          <div style={{ gridArea: "left" }}>
            <div
              style={{
                borderBottom: "1px solid #dedede",
                padding: 16,
              }}
            >
              <Heading size="m">Outline</Heading>
              <Space />
              <OutlineList>
                {data.content.map((item, i) => {
                  return (
                    <OutlineList.Item
                      key={i}
                      onClick={() => {
                        setSelectedIndex(i);
                      }}
                    >
                      {item.type}
                    </OutlineList.Item>
                  );
                })}
              </OutlineList>
            </div>
            <div style={{ padding: 16 }}>
              <Heading size="m">Components</Heading>
              <Space />
              <ComponentList config={config} />
            </div>
          </div>
          <div
            style={{
              background: "#dedede",
              padding: 32,
              overflowY: "auto",
              gridArea: "editor",
            }}
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
              <Page {...data.page}>
                <DroppableStrictMode droppableId="droppable">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      style={{
                        minHeight: "calc(100vh - 32px)",
                        background: snapshot.isDraggingOver
                          ? "lightblue"
                          : "white",
                      }}
                    >
                      {data.content.map((item, i) => {
                        return (
                          <DraggableComponent
                            key={item.props.id}
                            label={item.type.toString()}
                            id={`draggable-${item.props.id}`}
                            index={i}
                            isSelected={selectedIndex === i}
                            onClick={(e) => {
                              setSelectedIndex(i);
                              e.stopPropagation();
                            }}
                            onDelete={(e) => {
                              const newData = { ...data };
                              newData.content.splice(i, 1);

                              setSelectedIndex(null);
                              setData(newData);

                              e.stopPropagation();
                            }}
                            onDuplicate={(e) => {
                              const newData = { ...data };
                              const newItem = {
                                ...newData.content[i],
                                props: {
                                  ...newData.content[i].props,
                                  id: `${
                                    newData.content[i].type
                                  }-${new Date().getTime()}`,
                                },
                              };

                              newData.content.splice(i + 1, 0, newItem);

                              setData(newData);

                              e.stopPropagation();
                            }}
                          >
                            <div style={{ zoom: 0.75 }}>
                              {config.components[item.type] ? (
                                config.components[item.type].render(item.props)
                              ) : (
                                <div>No configuration for {item.type}</div>
                              )}
                            </div>
                          </DraggableComponent>
                        );
                      })}

                      {provided.placeholder}
                    </div>
                  )}
                </DroppableStrictMode>
              </Page>
            </div>
          </div>
          <div style={{ padding: 16, overflowY: "scroll", gridArea: "right" }}>
            {selectedIndex !== null ? (
              <Heading size="l">{data.content[selectedIndex].type}</Heading>
            ) : (
              <Heading size="l">Page</Heading>
            )}

            <Space />

            {Object.keys(fields).map((fieldName) => {
              const field = fields[fieldName];

              const onChange = (value: any) => {
                let currentProps;
                let newProps;

                if (selectedIndex !== null) {
                  currentProps = data.content[selectedIndex].props;
                } else {
                  currentProps = data.page;
                }

                if (fieldName === "_data") {
                  // Reset the link if value is falsey
                  if (!value) {
                    newProps = {
                      ...currentProps,
                      _data: undefined,
                    };

                    setLockedFields([]);
                  } else {
                    const changedFields = filter(
                      // filter out anything not supported by this component
                      (value as any).attributes, // TODO type properly after getting proper state library
                      Object.keys(fields)
                    );

                    newProps = {
                      ...currentProps,
                      ...changedFields,
                      _data: value, // TODO perf - this is duplicative and will make payload larger
                    };

                    setLockedFields(Object.keys(changedFields));
                  }
                } else {
                  newProps = {
                    ...currentProps,
                    [fieldName]: value,
                  };
                }

                if (selectedIndex !== null) {
                  setData({
                    ...data,
                    content: replace(data.content, selectedIndex, {
                      ...data.content[selectedIndex],
                      props: newProps,
                    }),
                  });
                } else {
                  setData({ ...data, page: newProps });
                }
              };

              if (selectedIndex !== null) {
                return (
                  <InputOrGroup
                    key={`${data.content[selectedIndex].props.id}_${fieldName}`}
                    field={field}
                    name={fieldName}
                    label={field.label}
                    readOnly={lockedFields.indexOf(fieldName) > -1}
                    value={data.content[selectedIndex].props[fieldName]}
                    onChange={onChange}
                  />
                );
              } else {
                return (
                  <InputOrGroup
                    key={`page_${fieldName}`}
                    field={field}
                    name={fieldName}
                    label={field.label}
                    readOnly={lockedFields.indexOf(fieldName) > -1}
                    value={data.page[fieldName]}
                    onChange={onChange}
                  />
                );
              }
            })}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
