import { Dispatch, ReactElement, SetStateAction } from "react";
import { Globe, ChevronLeft, ChevronRight } from "react-feather";

import { Button } from "../Button";
import { IconButton } from "../IconButton/IconButton";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { usePuckHistory } from "../../lib/use-puck-history";
import { PuckAction } from "../../reducer";
import type { AppState, Data } from "../../types/Config";

import styles from "./styles.module.css";

const getClassName = getClassNameFactory("MenuBar", styles);

export const MenuBar = ({
  appState,
  data = { content: [], root: { props: { title: "" } } },
  dispatch,
  menuOpen = false,
  onPublish,
  renderHeaderActions,
  setMenuOpen,
}: {
  appState: AppState;
  data: Data;
  dispatch: (action: PuckAction) => void;
  onPublish: (data: Data) => void;
  menuOpen: boolean;
  renderHeaderActions?: (props: {
    state: AppState;
    dispatch: (action: PuckAction) => void;
  }) => ReactElement;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const { canForward, canRewind, rewind, forward } = usePuckHistory({
    appState,
    dispatch,
  });

  return (
    <div
      className={getClassName({ menuOpen })}
      onClick={(event) => {
        const element = event.target as HTMLElement;

        if (window.matchMedia("(min-width: 638px)").matches) {
          return;
        }
        if (
          element.tagName === "A" &&
          element.getAttribute("href")?.startsWith("#")
        ) {
          setMenuOpen(false);
        }
      }}
    >
      <div className={getClassName("inner")}>
        <div className={getClassName("history")}>
          <IconButton title="undo" disabled={!canRewind} onClick={rewind}>
            <ChevronLeft
              size={21}
              stroke={
                canRewind
                  ? "var(--puck-color-black)"
                  : "var(--puck-color-grey-7)"
              }
            />
          </IconButton>
          <IconButton title="redo" disabled={!canForward} onClick={forward}>
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
  );
};
