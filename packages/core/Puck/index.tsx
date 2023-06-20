"use client";

import {
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { DragDropContext } from "react-beautiful-dnd";
import DroppableStrictMode from "../DroppableStrictMode";
import { DraggableComponent } from "../DraggableComponent";
import type { Config, Data, Field } from "../types/Config";
import { InputOrGroup } from "../InputOrGroup";
import { ComponentList } from "../ComponentList";
import { OutlineList } from "../OutlineList";
import { filter, reorder, replace } from "../lib";
import { Button } from "../Button";

import { Plugin } from "../types/Plugin";
import { usePlaceholderStyle } from "../lib/use-placeholder-style";

import { SidebarSection } from "../SidebarSection";

const Field = () => {};

const defaultPageFields: Record<string, Field> = {
  title: { type: "text" },
};

const PluginRenderer = ({
  children,
  data,
  plugins,
  renderMethod,
}: {
  children: ReactNode;
  data: Data;
  plugins;
  renderMethod: "renderPage" | "renderPageFields" | "renderFields";
}) => {
  return plugins
    .filter((item) => item[renderMethod])
    .map((item) => item[renderMethod])
    .reduce(
      (accChildren, Item) => <Item data={data}>{accChildren}</Item>,
      children
    );
};

export function Puck({
  config,
  data: initialData = { content: [], page: { title: "" } },
  onChange,
  onPublish,
  plugins = [],
  renderHeader,
}: {
  config: Config;
  data: Data;
  onChange?: (data: Data) => void;
  onPublish: (data: Data) => void;
  plugins?: Plugin[];
  renderHeader?: (props: {
    children: ReactNode;
    data: Data;
    setData: (data: Data) => void;
  }) => ReactElement;
}) {
  const [data, setData] = useState(initialData);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const Page = useCallback(
    (pageProps) => (
      <PluginRenderer
        plugins={plugins}
        renderMethod="renderPage"
        data={pageProps.data}
      >
        {config.page?.render
          ? config.page?.render({ ...pageProps, editMode: true })
          : pageProps.children}
      </PluginRenderer>
    ),
    [config.page]
  );

  const PageFieldWrapper = useCallback(
    (props) => (
      <PluginRenderer
        plugins={plugins}
        renderMethod="renderPageFields"
        data={props.data}
      >
        {props.children}
      </PluginRenderer>
    ),
    []
  );

  const ComponentFieldWrapper = useCallback(
    (props) => (
      <PluginRenderer
        plugins={plugins}
        renderMethod="renderFields"
        data={props.data}
      >
        {props.children}
      </PluginRenderer>
    ),
    []
  );

  const FieldWrapper =
    selectedIndex !== null ? ComponentFieldWrapper : PageFieldWrapper;

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

  const { onDragUpdate, placeholderStyle } = usePlaceholderStyle();

  return (
    <div className="puck">
      <DragDropContext
        onDragUpdate={onDragUpdate}
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
                ...(config.components[droppedItem.draggableId].defaultProps ||
                  {}),
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

            setSelectedIndex(droppedItem.destination.index);
          } else {
            setData({
              ...data,
              content: reorder(
                data.content,
                droppedItem.source.index,
                droppedItem.destination.index
              ),
            });

            setSelectedIndex(null);
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
              background: "var(--puck-color-grey-0)",
              color: "white",
              gridArea: "header",
              borderBottom: "1px solid #cccccc",
            }}
          >
            {renderHeader ? (
              renderHeader({
                children: (
                  <Button
                    onClick={() => {
                      onPublish(data);
                    }}
                  >
                    Publish
                  </Button>
                ),
                data,
                setData,
              })
            ) : (
              <div style={{ marginLeft: "auto", padding: 16 }}>
                <Button
                  onClick={() => {
                    onPublish(data);
                  }}
                >
                  Publish
                </Button>
              </div>
            )}
          </header>
          <div
            style={{
              gridArea: "left",
              background: "var(--puck-color-grey-10)",
              overflowY: "auto",
            }}
          >
            <SidebarSection title="Outline">
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
            </SidebarSection>
            <SidebarSection title="Components">
              <ComponentList config={config} />
            </SidebarSection>
          </div>
          <div
            style={{
              background: "var(--puck-color-grey-8)",
              padding: 32,
              overflowY: "auto",
              gridArea: "editor",
            }}
            onClick={() => setSelectedIndex(null)}
          >
            <div
              className="puck-root"
              style={{
                background: "white",
                borderRadius: 16,
                overflow: "hidden",
              }}
            >
              <Page data={data} {...data.page}>
                <DroppableStrictMode droppableId="droppable">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      style={{
                        minHeight: 128,
                        position: "relative",
                      }}
                      id="puck-drop-zone"
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
                                config.components[item.type].render({
                                  ...config.components[item.type].defaultProps,
                                  ...item.props,
                                  editMode: true,
                                })
                              ) : (
                                <div>No configuration for {item.type}</div>
                              )}
                            </div>
                          </DraggableComponent>
                        );
                      })}

                      {provided.placeholder}

                      {snapshot.isDraggingOver && (
                        <div
                          style={{
                            ...placeholderStyle,
                            background: "var(--puck-color-azure-8)",
                            zIndex: 0,
                          }}
                        />
                      )}
                    </div>
                  )}
                </DroppableStrictMode>
              </Page>
            </div>
          </div>
          <div
            style={{
              background: "var(--puck-color-grey-10)",
              overflowY: "auto",
              gridArea: "right",
              fontFamily: "var(--puck-font-stack)",
            }}
          >
            <FieldWrapper data={data}>
              <SidebarSection
                title={
                  selectedIndex !== null
                    ? (data.content[selectedIndex].type as string)
                    : "Page"
                }
              >
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
                        const { locked, ..._meta } = currentProps._meta || {};

                        newProps = {
                          ...currentProps,
                          _data: undefined,
                          _meta: _meta,
                        };
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
                          _meta: {
                            locked: Object.keys(changedFields),
                          },
                        };
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
                        readOnly={
                          data.content[
                            selectedIndex
                          ].props._meta?.locked?.indexOf(fieldName) > -1
                        }
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
                        readOnly={
                          data.page._meta?.locked?.indexOf(fieldName) > -1
                        }
                        value={data.page[fieldName]}
                        onChange={onChange}
                      />
                    );
                  }
                })}
              </SidebarSection>
            </FieldWrapper>
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
