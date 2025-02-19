import { Dispatch, ReactElement, SetStateAction } from "react";
import { Undo2Icon, Redo2Icon } from "lucide-react";

import { IconButton } from "../IconButton/IconButton";
import { useAppStore } from "../Puck/context";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { PuckAction } from "../../reducer";
import type { Data } from "../../types";

import styles from "./styles.module.css";

const getClassName = getClassNameFactory("MenuBar", styles);

export function MenuBar<UserData extends Data>({
  // appState,
  dispatch,
  menuOpen = false,
  onPublish,
  renderHeaderActions,
  setMenuOpen,
}: {
  // appState: AppState<UserData>;
  dispatch: (action: PuckAction) => void;
  onPublish?: (data: UserData) => void;
  menuOpen: boolean;
  renderHeaderActions?: () => ReactElement;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const history = useAppStore((s) => s.history);
  const { back, forward, historyStore } = history;

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
            <Undo2Icon size={21} />
          </IconButton>
          <IconButton title="redo" disabled={!hasFuture} onClick={forward}>
            <Redo2Icon size={21} />
          </IconButton>
        </div>
        <>{renderHeaderActions && renderHeaderActions()}</>
      </div>
    </div>
  );
}
