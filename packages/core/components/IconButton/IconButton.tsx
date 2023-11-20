import { ReactNode, SyntheticEvent, useState } from "react";
import styles from "./IconButton.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { ClipLoader } from "react-spinners";

const getClassName = getClassNameFactory("IconButton", styles);

export const IconButton = ({
  children,
  href,
  onClick,
  variant = "primary",
  type,
  disabled,
  tabIndex,
  newTab,
  fullWidth,
  title,
}: {
  children: ReactNode;
  href?: string;
  onClick?: (e: SyntheticEvent) => void | Promise<void>;
  variant?: "primary" | "secondary";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  tabIndex?: number;
  newTab?: boolean;
  fullWidth?: boolean;
  title: string;
}) => {
  const [loading, setLoading] = useState(false);

  const ElementType = href ? "a" : "button";

  const el = (
    <ElementType
      className={getClassName({
        primary: variant === "primary",
        secondary: variant === "secondary",
        disabled,
        fullWidth,
      })}
      onClick={(e) => {
        if (!onClick) return;

        setLoading(true);
        Promise.resolve(onClick(e)).then(() => {
          setLoading(false);
        });
      }}
      type={type}
      disabled={disabled || loading}
      tabIndex={tabIndex}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noreferrer" : undefined}
      href={href}
      title={title}
    >
      <span className={getClassName("title")}>{title}</span>
      {children}
      {loading && (
        <>
          &nbsp;&nbsp;
          <ClipLoader aria-label="Loading" color="inherit" size="14px" />
        </>
      )}
    </ElementType>
  );

  return el;
};
