import { Dispatch, ReactElement, SetStateAction } from "react";
import { Globe, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "../Button";
import { IconButton } from "../IconButton/IconButton";
import { useAppContext } from "../Puck/context";
import getClassNameFactory from "../../lib/get-class-name-factory";
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
  onPublish?: (data: Data) => void;
  menuOpen: boolean;
  renderHeaderActions?: (props: {
    state: AppState;
    dispatch: (action: PuckAction) => void;
  }) => ReactElement;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const {
    history: { back, forward, historyStore },
  } = useAppContext();

  const { hasFuture = false, hasPast = false } = historyStore || {};

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
          <IconButton title="undo" disabled={!hasPast} onClick={back}>
            <ChevronLeft
              size={21}
              stroke={
                hasPast
                  ? "var(--puck-color-black)"
                  : "var(--puck-color-grey-08)"
              }
            />
          </IconButton>
          <IconButton title="redo" disabled={!hasFuture} onClick={forward}>
            <ChevronRight
              size={21}
              stroke={
                hasFuture
                  ? "var(--puck-color-black)"
                  : "var(--puck-color-grey-08)"
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
              onPublish && onPublish(data);
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
