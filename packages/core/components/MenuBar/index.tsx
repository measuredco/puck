import { Dispatch, ReactElement, SetStateAction } from "react";
import { Undo2Icon, Redo2Icon } from "lucide-react";

import { IconButton } from "../IconButton/IconButton";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { PuckAction } from "../../reducer";
import type { Data } from "../../types";

import styles from "./styles.module.css";
import { useHistoryStore } from "../../stores/history-store";

const getClassName = getClassNameFactory("MenuBar", styles);

export function MenuBar<UserData extends Data>({
  menuOpen = false,
  renderHeaderActions,
  setMenuOpen,
}: {
  dispatch: (action: PuckAction) => void;
  onPublish?: (data: UserData) => void;
  menuOpen: boolean;
  renderHeaderActions?: () => ReactElement;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const back = useHistoryStore((s) => s.back);
  const forward = useHistoryStore((s) => s.forward);
  const hasFuture = useHistoryStore((s) => s.hasFuture());
  const hasPast = useHistoryStore((s) => s.hasPast());

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
