import { ReactNode, SyntheticEvent } from "react";
import getClassNameFactory from "../../lib/get-class-name-factory";
import styles from "./styles.module.css";
const getClassName = getClassNameFactory("ActionBarComponent", styles);

export const ActionBar = ({
  label,
  children,
}: {
  label?: string;
  children?: ReactNode;
}) => (
  <div className={getClassName()}>
    {label && <div className={getClassName("actionsLabel")}>{label}</div>}
    {children}
  </div>
);

export const Action = ({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: (e: SyntheticEvent) => void;
}) => (
  <button className={getClassName("action")} onClick={onClick}>
    {children}
  </button>
);

ActionBar.Action = Action;
