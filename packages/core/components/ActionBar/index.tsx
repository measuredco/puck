import { ReactNode, SyntheticEvent } from "react";
import getClassNameFactory from "../../lib/get-class-name-factory";
import styles from "./styles.module.css";
const getClassName = getClassNameFactory("ActionBar", styles);

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
  label,
  onClick,
}: {
  children: ReactNode;
  label?: string;
  onClick: (e: SyntheticEvent) => void;
}) => (
  <button
    type="button"
    className={getClassName("action")}
    onClick={onClick}
    title={label}
  >
    {children}
  </button>
);

export const Group = ({ children }: { children: ReactNode }) => (
  <div className={getClassName("group")}>{children}</div>
);

ActionBar.Action = Action;
ActionBar.Group = Group;
