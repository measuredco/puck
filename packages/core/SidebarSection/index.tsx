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
    <details className={getClassName({})} open>
      <summary className={getClassName("title")}>
        <Heading rank={2} size="xs">
          {title}
        </Heading>
      </summary>
      <div className={getClassName("content")}>{children}</div>
    </details>
  );
};
