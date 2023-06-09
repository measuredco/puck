import { ReactNode, useState } from "react";
import styles from "./Button.module.css";
import getClassNameFactory from "../lib/get-class-name-factory";
import Link from "next/link";
import { ClipLoader } from "react-spinners";

const getClassName = getClassNameFactory("Button", styles);

export const Button = ({
  children,
  href,
  onClick,
  variant = "primary",
  type,
  disabled,
  tabIndex,
  newTab,
  fullWidth,
}: {
  children: ReactNode;
  href?: string;
  onClick?: (e: any) => void | Promise<void>;
  variant?: "primary" | "secondary";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  tabIndex?: number;
  newTab?: boolean;
  fullWidth?: boolean;
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
      onClick={() => {
        if (!onClick) return;

        setLoading(true);
        Promise.resolve(onClick()).then(() => {
          setLoading(false);
        });
      }}
      type={type}
      disabled={disabled || loading}
      tabIndex={tabIndex}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noreferrer" : undefined}
    >
      {children}
      {loading && (
        <>
          &nbsp;&nbsp;
          <ClipLoader color="inherit" size="14px" />
        </>
      )}
    </ElementType>
  );

  if (ElementType === "a") {
    return <Link href={href!}>{el}</Link>;
  }

  return el;
};
