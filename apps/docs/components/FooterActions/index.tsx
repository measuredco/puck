import { getClassNameFactory } from "@/core/lib";

import styles from "./styles.module.css";
import { ThemeSwitch } from "nextra-theme-docs";
import { ReleaseSwitcher } from "../ReleaseSwitcher";

const getClassName = getClassNameFactory("FooterActions", styles);

export const FooterActions = () => {
  return (
    <div className={getClassName()}>
      <div className={getClassName("themeSwitch")}>
        <ThemeSwitch />
      </div>
      <div className={getClassName("releaseSwitcher")}>
        <ReleaseSwitcher variant="light" />
      </div>
    </div>
  );
};
