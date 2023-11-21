import {
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from "react";
import { DragDropContext, DragStart, DragUpdate } from "@hello-pangea/dnd";
import type { AppState, Config, Data, Field } from "../../types/Config";
import { InputOrGroup } from "../InputOrGroup";
import { ComponentList } from "../ComponentList";
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
import {
  PuckAction,
  ReplaceAction,
  StateReducer,
  createReducer,
  replaceAction,
} from "../../reducer";
import { LayerTree } from "../LayerTree";
import { findZonesForArea } from "../../lib/find-zones-for-area";
import { areaContainsZones } from "../../lib/area-contains-zones";
import { flushZones } from "../../lib/flush-zones";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { usePuckHistory } from "../../lib/use-puck-history";
import { AppProvider, defaultAppState } from "./context";
import { useComponentList } from "../../lib/use-component-list";
import { useResolvedData } from "../../lib/use-resolved-data";
import styles from "./styles.module.css";

const getClassName = getClassNameFactory("Puck", styles);

const Field = () => {};

const defaultPageFields: Record<string, Field> = {
  title: { type: "text" },
};

const PluginRenderer = ({
  children,
  dispatch,
  state,
  plugins,
  renderMethod,
}: {
  children: ReactNode;
  dispatch: (action: PuckAction) => void;
  state: AppState;
  plugins;
  renderMethod:
    | "renderRoot"
    | "renderRootFields"
    | "renderFields"
    | "renderComponentList";
}) => {
  return plugins
    .filter((item) => item[renderMethod])
    .map((item) => item[renderMethod])
    .reduce(
      (accChildren, Item) => (
        <Item dispatch={dispatch} state={state}>
          {accChildren}
        </Item>
      ),
      children
    );
};

export function Puck({
  config,
  data: initialData = { content: [], root: { props: { title: "" } } },
  onChange,
  onPublish,
  plugins = [],
  renderComponentList,
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
  renderComponentList?: (props: {
    children: ReactNode;
    dispatch: (action: PuckAction) => void;
    state: AppState;
  }) => ReactElement;
  renderHeader?: (props: {
    children: ReactNode;
    dispatch: (action: PuckAction) => void;
    state: AppState;
  }) => ReactElement;
  renderHeaderActions?: (props: {
    state: AppState;
    dispatch: (action: PuckAction) => void;
  }) => ReactElement;
  headerTitle?: string;
  headerPath?: string;
}) {
  const [reducer] = useState(() => createReducer({ config }));

  const [initialAppState] = useState<AppState>({
    ...defaultAppState,
    data: initialData,
    ui: {
      ...defaultAppState.ui,

      // Store categories under componentList on state to allow render functions and plugins to modify
      componentList: config.categories
        ? Object.entries(config.categories).reduce(
            (acc, [categoryName, category]) => {
              return {
                ...acc,
                [categoryName]: {
                  title: category.title,
                  components: category.components,
                  expanded: category.defaultExpanded,
                  visible: category.visible,
                },
              };
            },
            {}
          )
        : {},
    },
  });

  const [appState, dispatch] = useReducer<StateReducer>(
    reducer,
    flushZones(initialAppState)
  );

  const { data, ui } = appState;

  const { resolveData, componentState } = useResolvedData(
    data,
    config,
    dispatch
  );

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
        dispatch={pageProps.dispatch}
        state={pageProps.state}
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
        dispatch={props.dispatch}
        state={props.state}
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
        dispatch={props.dispatch}
        state={props.state}
      >
        {props.children}
      </PluginRenderer>
    ),
    []
  );

  const ComponentListWrapper = useCallback((props) => {
    const children = (
      <PluginRenderer
        plugins={plugins}
        renderMethod="renderComponentList"
        dispatch={props.dispatch}
        state={props.state}
      >
        {props.children}
      </PluginRenderer>
    );

    // User's render method wraps the plugin render methods
    return renderComponentList
      ? renderComponentList({
          children,
          dispatch,
          state: appState,
        })
      : children;
  }, []);

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

  const componentList = useComponentList(config, appState.ui);

  // DEPRECATED
  const rootProps = data.root.props || data.root;

  // DEPRECATED
  useEffect(() => {
    if (Object.keys(data.root).length > 0 && !data.root.props) {
      console.error(
        "Warning: Defining props on `root` is deprecated. Please use `root.props`. This will be a breaking change in a future release."
      );
    }
  }, []);

  return (
    <div>
      <AppProvider
        value={{ state: appState, dispatch, config, componentState }}
      >
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
              droppedItem.source.droppableId.startsWith("component-list") &&
              droppedItem.destination
            ) {
              const [_, componentId] = droppedItem.draggableId.split("::");

              dispatch({
                type: "insert",
                componentType: componentId || droppedItem.draggableId,
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
                  <div className={getClassName({ leftSideBarVisible })}>
                    <header className={getClassName("header")}>
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
                          dispatch,
                          state: appState,
                        })
                      ) : (
                        <div className={getClassName("headerInner")}>
                          <div className={getClassName("headerToggle")}>
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
                          <div className={getClassName("headerTitle")}>
                            <Heading rank={2} size="xs">
                              {headerTitle || rootProps.title || "Page"}
                              {headerPath && (
                                <>
                                  {" "}
                                  <code className={getClassName("headerPath")}>
                                    {headerPath}
                                  </code>
                                </>
                              )}
                            </Heading>
                          </div>
                          <div className={getClassName("headerTools")}>
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
                            <>
                              {renderHeaderActions &&
                                renderHeaderActions({
                                  state: appState,
                                  dispatch,
                                })}
                            </>
                            <div>
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
                        </div>
                      )}
                    </header>
                    <div className={getClassName("leftSideBar")}>
                      <SidebarSection title="Components">
                        <ComponentListWrapper>
                          {componentList ? (
                            componentList
                          ) : (
                            <ComponentList id="all" />
                          )}
                        </ComponentListWrapper>
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
                      className={getClassName("frame")}
                      onClick={() => setItemSelector(null)}
                      id="puck-frame"
                    >
                      <div className={getClassName("root")}>
                        <div className={getClassName("page")}>
                          <Page
                            dispatch={dispatch}
                            state={appState}
                            {...rootProps}
                          >
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
                    <div className={getClassName("rightSideBar")}>
                      <FieldWrapper dispatch={dispatch} state={appState}>
                        <SidebarSection
                          noPadding
                          showBreadcrumbs
                          title={selectedItem ? selectedItem.type : "Page"}
                          isLoading={
                            selectedItem
                              ? componentState[selectedItem?.props.id]?.loading
                              : componentState["puck-root"]?.loading
                          }
                        >
                          {Object.keys(fields).map((fieldName) => {
                            const field = fields[fieldName];

                            const onChange = (value: any) => {
                              let currentProps;

                              if (selectedItem) {
                                currentProps = selectedItem.props;
                              } else {
                                currentProps = rootProps;
                              }

                              const newProps = {
                                ...currentProps,
                                [fieldName]: value,
                              };

                              if (itemSelector) {
                                const action: ReplaceAction = {
                                  type: "replace",
                                  destinationIndex: itemSelector.index,
                                  destinationZone:
                                    itemSelector.zone || rootDroppableId,
                                  data: { ...selectedItem, props: newProps },
                                };

                                // If the component has a resolveData method, we let resolveData run and handle the dispatch once it's done
                                if (
                                  config.components[selectedItem!.type]
                                    ?.resolveData
                                ) {
                                  resolveData(replaceAction(data, action));
                                } else {
                                  dispatch(action);
                                }
                              } else {
                                if (data.root.props) {
                                  // If the component has a resolveData method, we let resolveData run and handle the dispatch once it's done
                                  if (config.root?.resolveData) {
                                    resolveData({
                                      ...data,
                                      root: { props: newProps },
                                    });
                                  } else {
                                    dispatch({
                                      type: "setData",
                                      data: { root: { props: newProps } },
                                    });
                                  }
                                } else {
                                  // DEPRECATED
                                  dispatch({
                                    type: "setData",
                                    data: { root: newProps },
                                  });
                                }
                              }
                            };

                            if (selectedItem && itemSelector) {
                              const { readOnly = {} } = selectedItem;

                              return (
                                <InputOrGroup
                                  key={`${selectedItem.props.id}_${fieldName}`}
                                  field={field}
                                  name={fieldName}
                                  label={field.label}
                                  readOnly={readOnly[fieldName]}
                                  readOnlyFields={readOnly}
                                  value={selectedItem.props[fieldName]}
                                  onChange={onChange}
                                />
                              );
                            } else {
                              const { readOnly = {} } = data.root;

                              return (
                                <InputOrGroup
                                  key={`page_${fieldName}`}
                                  field={field}
                                  name={fieldName}
                                  label={field.label}
                                  readOnly={readOnly[fieldName]}
                                  readOnlyFields={readOnly}
                                  value={rootProps[fieldName]}
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
      <div id="puck-portal-root" />
    </div>
  );
}
