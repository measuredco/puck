"use client";

import {
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from "react";
import { DragDropContext, DragStart, DragUpdate } from "react-beautiful-dnd";
import type { AppState, Config, Data, Field } from "../../types/Config";
import { InputOrGroup } from "../InputOrGroup";
import { ComponentList } from "../ComponentList";
import { filter } from "../../lib";
import { Button } from "../Button";

import { Plugin } from "../../types/Plugin";
import { usePlaceholderStyle } from "../../lib/use-placeholder-style";

import { SidebarSection } from "../SidebarSection";
import { Globe, Sidebar, ChevronLeft, ChevronRight } from "react-feather";
import { Heading } from "../Heading";
import { IconButton } from "../IconButton/IconButton";
import { DropZone, DropZoneProvider, dropZoneContext } from "../DropZone";
import { rootDroppableId } from "../../lib/root-droppable-id";
import { ItemSelector, getItem } from "../../lib/get-item";
import { PuckAction, StateReducer, createReducer } from "../../reducer";
import { LayerTree } from "../LayerTree";
import { findZonesForArea } from "../../lib/find-zones-for-area";
import { areaContainsZones } from "../../lib/area-contains-zones";
import { flushZones } from "../../lib/flush-zones";
import { usePuckHistory } from "../../lib/use-puck-history";
import { AppProvider, defaultAppState } from "./context";

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
    appState: AppState;
    dispatch: (action: PuckAction) => void;
  }) => ReactElement;
  renderHeaderActions?: (props: {
    data: Data;
    appState: AppState;
    dispatch: (action: PuckAction) => void;
  }) => ReactElement;
  headerTitle?: string;
  headerPath?: string;
}) {
  const [reducer] = useState(() => createReducer({ config }));

  const initialAppState: AppState = {
    ...defaultAppState,
    data: initialData,
  };

  const [appState, dispatch] = useReducer<StateReducer>(
    reducer,
    flushZones(initialAppState)
  );

  const { data, ui } = appState;

  const { canForward, canRewind, rewind, forward } = usePuckHistory({
    appState,
    dispatch,
  });

  const { itemSelector, leftSideBarVisible } = ui;

  const setItemSelector = useCallback(
    (newItemSelector: ItemSelector | null) => {
      dispatch({
        type: "setUi",
        ui: { itemSelector: newItemSelector },
      });
    },
    []
  );

  const selectedItem = itemSelector ? getItem(itemSelector, data) : null;

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

  const FieldWrapper = itemSelector ? ComponentFieldWrapper : PageFieldWrapper;

  const rootFields = config.root?.fields || defaultPageFields;

  let fields = selectedItem
    ? (config.components[selectedItem.type]?.fields as Record<
        string,
        Field<any>
      >) || {}
    : rootFields;

  useEffect(() => {
    if (onChange) onChange(data);
  }, [data]);

  const { onDragStartOrUpdate, placeholderStyle } = usePlaceholderStyle();

  const [draggedItem, setDraggedItem] = useState<
    DragStart & Partial<DragUpdate>
  >();

  return (
    <div className="puck">
      <AppProvider value={{ state: appState, dispatch }}>
        <DragDropContext
          onDragUpdate={(update) => {
            setDraggedItem({ ...draggedItem, ...update });
            onDragStartOrUpdate(update);
          }}
          onBeforeDragStart={(start) => {
            onDragStartOrUpdate(start);
            setItemSelector(null);
          }}
          onDragEnd={(droppedItem) => {
            setDraggedItem(undefined);

            // User cancel drag
            if (!droppedItem.destination) {
              return;
            }

            // New component
            if (
              droppedItem.source.droppableId === "component-list" &&
              droppedItem.destination
            ) {
              dispatch({
                type: "insert",
                componentType: droppedItem.draggableId,
                destinationIndex: droppedItem.destination!.index,
                destinationZone: droppedItem.destination.droppableId,
              });

              setItemSelector({
                index: droppedItem.destination!.index,
                zone: droppedItem.destination.droppableId,
              });

              return;
            } else {
              const { source, destination } = droppedItem;

              if (source.droppableId === destination.droppableId) {
                dispatch({
                  type: "reorder",
                  sourceIndex: source.index,
                  destinationIndex: destination.index,
                  destinationZone: destination.droppableId,
                });
              } else {
                dispatch({
                  type: "move",
                  sourceZone: source.droppableId,
                  sourceIndex: source.index,
                  destinationIndex: destination.index,
                  destinationZone: destination.droppableId,
                });
              }

              setItemSelector({
                index: destination.index,
                zone: destination.droppableId,
              });
            }
          }}
        >
          <DropZoneProvider
            value={{
              data,
              itemSelector,
              setItemSelector,
              config,
              dispatch,
              draggedItem,
              placeholderStyle,
              mode: "edit",
              areaId: "root",
            }}
          >
            <dropZoneContext.Consumer>
              {(ctx) => {
                return (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateAreas:
                        '"header header header" "left editor right"',
                      gridTemplateColumns: `${
                        leftSideBarVisible ? "288px" : "0px"
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
                        color: "var(--puck-color-black)",
                        background: "var(--puck-color-white)",
                        borderBottom: "1px solid var(--puck-color-grey-8)",
                      }}
                    >
                      {renderHeader ? (
                        renderHeader({
                          appState,
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
                          dispatch,
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
                              onClick={() =>
                                dispatch({
                                  type: "setUi",
                                  ui: {
                                    leftSideBarVisible: !leftSideBarVisible,
                                  },
                                })
                              }
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
                                <small
                                  style={{ fontWeight: 400, marginLeft: 4 }}
                                >
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
                            <div style={{ display: "flex" }}>
                              <IconButton
                                title="undo"
                                disabled={!canRewind}
                                onClick={rewind}
                              >
                                <ChevronLeft
                                  size={21}
                                  stroke={
                                    canRewind
                                      ? "var(--puck-color-black)"
                                      : "var(--puck-color-grey-7)"
                                  }
                                />
                              </IconButton>
                              <IconButton
                                title="redo"
                                disabled={!canForward}
                                onClick={forward}
                              >
                                <ChevronRight
                                  size={21}
                                  stroke={
                                    canForward
                                      ? "var(--puck-color-black)"
                                      : "var(--puck-color-grey-7)"
                                  }
                                />
                              </IconButton>
                            </div>
                            {renderHeaderActions &&
                              renderHeaderActions({ data, dispatch, appState })}
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
                        {ctx?.activeZones &&
                          ctx?.activeZones[rootDroppableId] && (
                            <LayerTree
                              data={data}
                              label={
                                areaContainsZones(data, "root")
                                  ? rootDroppableId
                                  : ""
                              }
                              zoneContent={data.content}
                              setItemSelector={setItemSelector}
                              itemSelector={itemSelector}
                            />
                          )}

                        {Object.entries(findZonesForArea(data, "root")).map(
                          ([zoneKey, zone]) => {
                            return (
                              <LayerTree
                                key={zoneKey}
                                data={data}
                                label={zoneKey}
                                zone={zoneKey}
                                zoneContent={zone}
                                setItemSelector={setItemSelector}
                                itemSelector={itemSelector}
                              />
                            );
                          }
                        )}
                      </SidebarSection>
                    </div>

                    <div
                      style={{
                        overflowY: "auto",
                        gridArea: "editor",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                      }}
                      onClick={() => setItemSelector(null)}
                      id="puck-frame"
                    >
                      <div
                        className="puck-root"
                        style={{
                          boxShadow:
                            "0px 0px 0px 32px var(--puck-color-grey-10)",
                          margin: 32,
                          zoom: 0.75,
                        }}
                      >
                        <div
                          style={{
                            border: "1px solid var(--puck-color-grey-8)",
                          }}
                        >
                          <Page data={data} {...data.root}>
                            <DropZone zone={rootDroppableId} />
                          </Page>
                        </div>
                      </div>
                      {/* Fill empty space under root */}
                      <div
                        style={{
                          background: "var(--puck-color-grey-10)",
                          height: "100%",
                          flexGrow: 1,
                        }}
                      ></div>
                    </div>
                    <div
                      style={{
                        borderLeft: "1px solid var(--puck-color-grey-8)",
                        overflowY: "auto",
                        gridArea: "right",
                        fontFamily: "var(--puck-font-stack)",
                        display: "flex",
                        flexDirection: "column",
                        background: "var(--puck-color-white)",
                      }}
                    >
                      <FieldWrapper data={data}>
                        <SidebarSection
                          noPadding
                          showBreadcrumbs
                          title={selectedItem ? selectedItem.type : "Page"}
                        >
                          {Object.keys(fields).map((fieldName) => {
                            const field = fields[fieldName];

                            const onChange = (value: any) => {
                              let currentProps;
                              let newProps;

                              if (selectedItem) {
                                currentProps = selectedItem.props;
                              } else {
                                currentProps = data.root;
                              }

                              if (fieldName === "_data") {
                                // Reset the link if value is falsey
                                if (!value) {
                                  const { locked, ..._meta } =
                                    currentProps._meta || {};

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

                              if (itemSelector) {
                                dispatch({
                                  type: "replace",
                                  destinationIndex: itemSelector.index,
                                  destinationZone:
                                    itemSelector.zone || rootDroppableId,
                                  data: { ...selectedItem, props: newProps },
                                });
                              } else {
                                dispatch({
                                  type: "setData",
                                  data: { root: newProps },
                                });
                              }
                            };

                            if (selectedItem && itemSelector) {
                              return (
                                <InputOrGroup
                                  key={`${selectedItem.props.id}_${fieldName}`}
                                  field={field}
                                  name={fieldName}
                                  label={field.label}
                                  readOnly={
                                    getItem(
                                      itemSelector,
                                      data
                                    )!.props._meta?.locked?.indexOf(fieldName) >
                                    -1
                                  }
                                  value={selectedItem.props[fieldName]}
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
                                    data.root._meta?.locked?.indexOf(
                                      fieldName
                                    ) > -1
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
                );
              }}
            </dropZoneContext.Consumer>
          </DropZoneProvider>
        </DragDropContext>
      </AppProvider>
    </div>
  );
}
