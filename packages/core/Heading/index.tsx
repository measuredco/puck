import { ReactNode } from "react";
import styles from "./styles.module.css";
import getClassNameFactory from "../lib/get-class-name-factory";

const getClassName = getClassNameFactory("Heading", styles);

export const Heading = ({
  children,
  rank,
  size = "m",
}: {
  children: ReactNode;
  rank?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: "xxxxl" | "xxxl" | "xxl" | "xl" | "l" | "m" | "s" | "xs";
}) => {
  const Tag: any = rank ? `h${rank}` : "span";

  return (
    <Tag
      className={getClassName({
        [size]: true,
      })}
    >
      {children}
    </Tag>
  );
};
