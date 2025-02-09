import {
  useCallback,
  useMemo,
  useState,
  useEffect,
} from "react";

import type {
  Overrides,
  UserGenerics,
  Config,
} from "../../../../types";
import { Button } from "../../../Button";
import {
  ChevronDown,
  ChevronUp,
  Globe,
  PanelLeft,
  PanelRight,
} from "lucide-react";
import { Heading } from "../../../Heading";
import { IconButton } from "../../../IconButton/IconButton";
import getClassNameFactory from "../../../../lib/get-class-name-factory";
import { MenuBar } from "../../../MenuBar";
import styles from "../../styles.module.css";
import { DefaultOverride } from "../../../DefaultOverride";
import { useAppContext } from "../../context";
import { type PuckProps } from "../..";

const getLayoutClassName = getClassNameFactory("PuckLayout", styles);


export function Header<
  UserConfig extends Config = Config,
  G extends UserGenerics<UserConfig> = UserGenerics<UserConfig>
>({
  renderHeader,
  onPublish,
  headerPath,
  headerTitle,
  renderHeaderActions,
  onMenuStateChange,
}: Pick<PuckProps<UserConfig, G>, "renderHeader" | "onPublish" | "renderHeaderActions" | 'headerPath' | 'headerTitle'> & {
  onMenuStateChange?: (menuOpen: boolean) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { dispatch, state, overrides } = useAppContext();
  const { data, ui } = state;

  // DEPRECATED
  const rootProps = data.root.props || data.root;

   // DEPRECATED
    const defaultHeaderRender = useMemo((): Overrides["header"] => {
      if (renderHeader) {
        console.warn(
          "`renderHeader` is deprecated. Please use `overrides.header` and the `usePuck` hook instead"
        );
  
        const RenderHeader = ({ actions, ...props }: any) => {
          const Comp = renderHeader!;
  
          return (
            <Comp {...props} dispatch={dispatch} state={state}>
              {actions}
            </Comp>
          );
        };
  
        return RenderHeader;
      }
  
      return DefaultOverride;
    }, [renderHeader]);

    
  
    // DEPRECATED
    const defaultHeaderActionsRender = useMemo((): Overrides["headerActions"] => {
      if (renderHeaderActions) {
        console.warn(
          "`renderHeaderActions` is deprecated. Please use `overrides.headerActions` and the `usePuck` hook instead."
        );
  
        const RenderHeader = (props: any) => {
          const Comp = renderHeaderActions!;
  
          return <Comp {...props} dispatch={dispatch} state={state}></Comp>;
        };
  
        return RenderHeader;
      }
  
      return DefaultOverride;
    }, [renderHeader]);

  const CustomHeader = useMemo(
    () => overrides.header || defaultHeaderRender,
    [overrides]
  );
  const CustomHeaderActions = useMemo(
    () => overrides.headerActions || defaultHeaderActionsRender,
    [overrides]
  );

  const toggleSidebars = useCallback(
    (sidebar: "left" | "right") => {
      const widerViewport = window.matchMedia("(min-width: 638px)").matches;
      const sideBarVisible =
        sidebar === "left" ? ui.leftSideBarVisible : ui.rightSideBarVisible;
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
    [dispatch, ui.leftSideBarVisible, ui.rightSideBarVisible]
  );

  useEffect(() => {
    onMenuStateChange && onMenuStateChange(menuOpen);
  }, [onMenuStateChange, menuOpen])
  
  return <CustomHeader
      actions={
        <>
          <CustomHeaderActions>
            <Button
              onClick={() => {
                onPublish && onPublish(data as G['UserData']);
              }}
              icon={<Globe size="14px" />}
            >
              Publish
            </Button>
          </CustomHeaderActions>
        </>
      }
    >
      <header className={getLayoutClassName("header")}>
        <div className={getLayoutClassName("headerInner")}>
          <div className={getLayoutClassName("headerToggle")}>
            <div
              className={getLayoutClassName("leftSideBarToggle")}
            >
              <IconButton
                onClick={() => {
                  toggleSidebars("left");
                }}
                title="Toggle left sidebar"
              >
                <PanelLeft focusable="false" />
              </IconButton>
            </div>
            <div
              className={getLayoutClassName("rightSideBarToggle")}
            >
              <IconButton
                onClick={() => {
                  toggleSidebars("right");
                }}
                title="Toggle right sidebar"
              >
                <PanelRight focusable="false" />
              </IconButton>
            </div>
          </div>
          <div className={getLayoutClassName("headerTitle")}>
            <Heading rank="2" size="xs">
              {headerTitle || rootProps.title || "Page"}
              {headerPath && (
                <>
                  {" "}
                  <code
                    className={getLayoutClassName("headerPath")}
                  >
                    {headerPath}
                  </code>
                </>
              )}
            </Heading>
          </div>
          <div className={getLayoutClassName("headerTools")}>
            <div className={getLayoutClassName("menuButton")}>
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
            <MenuBar<G["UserData"]>
              appState={state as G['UserAppState'] }
              dispatch={dispatch}
              onPublish={onPublish}
              menuOpen={menuOpen}
              renderHeaderActions={() => (
                <CustomHeaderActions>
                  <Button
                    onClick={() => {
                      onPublish && onPublish(data as G['UserData']);
                    }}
                    icon={<Globe size="14px" />}
                  >
                    Publish
                  </Button>
                </CustomHeaderActions>
              )}
              setMenuOpen={setMenuOpen}
            />
          </div>
        </div>
      </header>
    </CustomHeader>;
}