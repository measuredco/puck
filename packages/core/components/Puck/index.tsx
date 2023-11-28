import {
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from "react";
import { DragDropContext, DragStart, DragUpdate } from "@hello-pangea/dnd";

import type { AppState, Config, Data } from "../../types/Config";
import { Button } from "../Button";

import { Plugin } from "../../types/Plugin";
import { usePlaceholderStyle } from "../../lib/use-placeholder-style";

import { SidebarSection } from "../SidebarSection";
import { ChevronDown, ChevronUp, Globe, Sidebar } from "react-feather";
import { Heading } from "../Heading";
import { IconButton } from "../IconButton/IconButton";
import { DropZoneProvider } from "../DropZone";
import { ItemSelector, getItem } from "../../lib/get-item";
import { PuckAction, StateReducer, createReducer } from "../../reducer";
import { flushZones } from "../../lib/flush-zones";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { AppProvider, defaultAppState } from "./context";
import { useResolvedData } from "../../lib/use-resolved-data";
import { MenuBar } from "../MenuBar";
import styles from "./styles.module.css";
import { Fields } from "./components/Fields";
import { Components } from "./components/Components";
import { Preview } from "./components/Preview";
import { Outline } from "./components/Outline";

const getClassName = getClassNameFactory("Puck", styles);

export const PluginRenderer = ({
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
  config: Config<any, any, any>;
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

  const [initialAppState] = useState<AppState>(() => ({
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
  }));

  const [appState, dispatch] = useReducer<StateReducer>(
    reducer,
    flushZones(initialAppState)
  );

  const { data, ui } = appState;

  const { resolveData, componentState } = useResolvedData(
    appState,
    config,
    dispatch
  );

  const [menuOpen, setMenuOpen] = useState(false);

  const { itemSelector, leftSideBarVisible, rightSideBarVisible } = ui;

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

  useEffect(() => {
    if (onChange) onChange(data);
  }, [data]);

  const { onDragStartOrUpdate, placeholderStyle } = usePlaceholderStyle();

  const [draggedItem, setDraggedItem] = useState<
    DragStart & Partial<DragUpdate>
  >();

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

  const toggleSidebars = useCallback(
    (sidebar: "left" | "right") => {
      const widerViewport = window.matchMedia("(min-width: 638px)").matches;
      const sideBarVisible =
        sidebar === "left" ? leftSideBarVisible : rightSideBarVisible;
      const oppositeSideBar =
        sidebar === "left" ? "rightSideBarVisible" : "leftSideBarVisible";

      dispatch({
        type: "setUi",
        ui: {
          [`${sidebar}SideBarVisible`]: !sideBarVisible,
          ...(!widerViewport ? { [oppositeSideBar]: false } : {}),
        },
      });
    },
    [dispatch, leftSideBarVisible, rightSideBarVisible]
  );

  useEffect(() => {
    if (!window.matchMedia("(min-width: 638px)").matches) {
      dispatch({
        type: "setUi",
        ui: {
          leftSideBarVisible: false,
          rightSideBarVisible: false,
        },
      });
    }

    const handleResize = () => {
      if (!window.matchMedia("(min-width: 638px)").matches) {
        dispatch({
          type: "setUi",
          ui: (ui) => ({
            ...ui,
            ...(ui.rightSideBarVisible ? { leftSideBarVisible: false } : {}),
          }),
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div>
      <AppProvider
        value={{
          state: appState,
          dispatch,
          config,
          componentState,
          resolveData,
          plugins,
        }}
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
              const [_, componentType] = droppedItem.draggableId.split("::");

              dispatch({
                type: "insert",
                componentType: componentType || droppedItem.draggableId,
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
            <div
              className={getClassName({
                leftSideBarVisible,
                menuOpen,
                rightSideBarVisible,
              })}
            >
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
                      <div className={getClassName("leftSideBarToggle")}>
                        <IconButton
                          onClick={() => {
                            toggleSidebars("left");
                          }}
                          title="Toggle left sidebar"
                        >
                          <Sidebar focusable="false" />
                        </IconButton>
                      </div>
                      <div className={getClassName("rightSideBarToggle")}>
                        <IconButton
                          onClick={() => {
                            toggleSidebars("right");
                          }}
                          title="Toggle right sidebar"
                        >
                          <Sidebar focusable="false" />
                        </IconButton>
                      </div>
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
                      <div className={getClassName("menuButton")}>
                        <IconButton
                          onClick={() => {
                            return setMenuOpen(!menuOpen);
                          }}
                          title="Toggle menu bar"
                        >
                          {menuOpen ? (
                            <ChevronUp focusable="false" />
                          ) : (
                            <ChevronDown focusable="false" />
                          )}
                        </IconButton>
                      </div>
                      <MenuBar
                        appState={appState}
                        data={data}
                        dispatch={dispatch}
                        onPublish={onPublish}
                        menuOpen={menuOpen}
                        renderHeaderActions={renderHeaderActions}
                        setMenuOpen={setMenuOpen}
                      />
                    </div>
                  </div>
                )}
              </header>
              <div className={getClassName("leftSideBar")}>
                <SidebarSection title="Components">
                  <Components />
                </SidebarSection>
                <SidebarSection title="Outline">
                  <Outline />
                </SidebarSection>
              </div>
              <div
                className={getClassName("frame")}
                onClick={() => setItemSelector(null)}
              >
                <div className={getClassName("root")}>
                  <Preview />
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
                  >
                    <Fields />
                  </SidebarSection>
                </FieldWrapper>
              </div>
            </div>
          </DropZoneProvider>
        </DragDropContext>
      </AppProvider>
      <div id="puck-portal-root" />
    </div>
  );
}

Puck.Components = Components;
Puck.Fields = Fields;
Puck.Outline = Outline;
Puck.Preview = Preview;
