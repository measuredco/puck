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
import type { Config, Data, Field } from "../../types/Config";
import { InputOrGroup } from "../InputOrGroup";
import { ComponentList } from "../ComponentList";
import { OutlineList } from "../OutlineList";
import { filter, reorder, replace } from "../../lib";
import { Button } from "../Button";

import { Plugin } from "../../types/Plugin";
import { usePlaceholderStyle } from "../../lib/use-placeholder-style";

import { SidebarSection } from "../SidebarSection";
import { scrollIntoView } from "../../lib/scroll-into-view";
import { Globe, Sidebar } from "react-feather";
import { Heading } from "../Heading";
import { IconButton } from "../IconButton/IconButton";

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
  renderMethod: "renderRoot" | "renderRootFields" | "renderFields";
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
  data: initialData = { content: [], root: { title: "" } },
  onChange,
  onPublish,
  plugins = [],
  renderHeader,
  renderHeaderActions,
  headerTitle,
  headerPath,
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
  renderHeaderActions?: (props: {
    data: Data;
    setData: (data: Data) => void;
  }) => ReactElement;
  headerTitle?: string;
  headerPath?: string;
}) {
  const [data, setData] = useState(initialData);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const Page = useCallback(
    (pageProps) => (
      <PluginRenderer
        plugins={plugins}
        renderMethod="renderRoot"
        data={pageProps.data}
      >
        {config.root?.render
          ? config.root?.render({ ...pageProps, editMode: true })
          : pageProps.children}
      </PluginRenderer>
    ),
    [config.root]
  );

  const PageFieldWrapper = useCallback(
    (props) => (
      <PluginRenderer
        plugins={plugins}
        renderMethod="renderRootFields"
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

  const rootFields = config.root?.fields || defaultPageFields;

  let fields =
    selectedIndex !== null
      ? (config.components[data.content[selectedIndex].type]?.fields as Record<
          string,
          Field<any>
        >) || {}
      : rootFields;

  useEffect(() => {
    if (onChange) onChange(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const { onDragUpdate, placeholderStyle } = usePlaceholderStyle();

  const [leftSidebarVisible, setLeftSidebarVisible] = useState(true);

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
            gridTemplateColumns: `${
              leftSidebarVisible ? "288px" : "0px"
            } auto 288px`,
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
              gridArea: "header",
              borderBottom: "1px solid var(--puck-color-grey-8)",
            }}
          >
            {renderHeader ? (
              renderHeader({
                children: (
                  <Button
                    onClick={() => {
                      onPublish(data);
                    }}
                    icon={<Globe size="14px" />}
                  >
                    Publish
                  </Button>
                ),
                data,
                setData,
              })
            ) : (
              <div
                style={{
                  display: "grid",
                  padding: 16,
                  gridTemplateAreas: '"left middle right"',
                  gridTemplateColumns: "288px auto 288px",
                  gridTemplateRows: "auto",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                  }}
                >
                  <IconButton
                    onClick={() => setLeftSidebarVisible(!leftSidebarVisible)}
                    title="Toggle left sidebar"
                  >
                    <Sidebar />
                  </IconButton>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Heading rank={2} size="xs">
                    {headerTitle || data.root.title || "Page"}
                    {headerPath && (
                      <small style={{ fontWeight: 400, marginLeft: 4 }}>
                        <code>{headerPath}</code>
                      </small>
                    )}
                  </Heading>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    justifyContent: "flex-end",
                  }}
                >
                  {renderHeaderActions &&
                    renderHeaderActions({ data, setData })}
                  <Button
                    onClick={() => {
                      onPublish(data);
                    }}
                    icon={<Globe size="14px" />}
                  >
                    Publish
                  </Button>
                </div>
              </div>
            )}
          </header>
          <div
            style={{
              gridArea: "left",
              background: "var(--puck-color-grey-11)",
              borderRight: "1px solid var(--puck-color-grey-8)",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <SidebarSection title="Components">
              <ComponentList config={config} />
            </SidebarSection>
            <SidebarSection title="Outline">
              {data.content.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    color: "var(--puck-color-grey-6)",
                    fontFamily: "var(--puck-font-stack)",
                  }}
                >
                  Add items to your page
                </div>
              )}
              <OutlineList>
                {data.content.map((item, i) => {
                  return (
                    <OutlineList.Item
                      key={i}
                      onClick={() => {
                        setSelectedIndex(i);

                        const id = data.content[i].props.id;

                        scrollIntoView(
                          document.querySelector(
                            `[data-rbd-drag-handle-draggable-id="draggable-${id}"]`
                          ) as HTMLElement
                        );
                      }}
                    >
                      {item.type}
                    </OutlineList.Item>
                  );
                })}
              </OutlineList>
            </SidebarSection>
          </div>
          <div
            style={{
              background: "var(--puck-color-grey-9)",
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
                border: "1px solid var(--puck-color-grey-8)",
                overflow: "hidden",
                zoom: 0.75,
              }}
            >
              <Page data={data} {...data.root}>
                <DroppableStrictMode droppableId="droppable">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      style={{
                        minHeight: 128,
                        position: "relative",
                        zoom: 1.33,
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
                                <div
                                  style={{ padding: 48, textAlign: "center" }}
                                >
                                  No configuration for {item.type}
                                </div>
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
              borderLeft: "1px solid var(--puck-color-grey-8)",
              overflowY: "auto",
              gridArea: "right",
              fontFamily: "var(--puck-font-stack)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <FieldWrapper data={data}>
              <SidebarSection
                noPadding
                breadcrumb={selectedIndex !== null ? "Page" : ""}
                breadcrumbClick={() => setSelectedIndex(null)}
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
                      currentProps = data.root;
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
                          value,
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
                      setData({ ...data, root: newProps });
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
                          data.root._meta?.locked?.indexOf(fieldName) > -1
                        }
                        value={data.root[fieldName]}
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
