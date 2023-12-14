import { getClassNameFactory } from "@/core/lib";

import styles from "./styles.module.css";
import { ReactNode } from "react";

const getClassName = getClassNameFactory("Viewport", styles);

export const Viewport = ({
  children,
  mobile,
  desktop,
}: {
  children: ReactNode;
  mobile?: boolean;
  desktop?: boolean;
}) => {
  return <div className={getClassName({ mobile, desktop })}>{children}</div>;
};
