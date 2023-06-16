import { ReactNode } from "react";
import styles from "./styles.module.css";
import getClassNameFactory from "../lib/get-class-name-factory";
import { Heading } from "../Heading";

const getClassName = getClassNameFactory("SidebarSection", styles);

export const SidebarSection = ({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) => {
  return (
    <div className={getClassName({})}>
      <div className={getClassName("title")}>
        <Heading rank={2} size="s">
          {title}
        </Heading>
      </div>
      <div className={getClassName("content")}>{children}</div>
    </div>
  );
};
