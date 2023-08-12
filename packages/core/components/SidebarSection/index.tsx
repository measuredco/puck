import { ReactNode } from "react";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { Heading } from "../Heading";
import { ChevronRight } from "react-feather";

const getClassName = getClassNameFactory("SidebarSection", styles);

export const SidebarSection = ({
  children,
  title,
  background,
  breadcrumb,
  breadcrumbClick,
  noPadding,
}: {
  children: ReactNode;
  title: ReactNode;
  background?: string;
  breadcrumb?: string;
  breadcrumbClick?: () => void;
  noPadding?: boolean;
}) => {
  return (
    <div className={getClassName({ noPadding })} style={{ background }}>
      <div className={getClassName("title")}>
        <span
          style={{
            display: "flex",
            gap: 4,
            alignItems: "center",
          }}
        >
          {breadcrumb && (
            <>
              <div
                className={getClassName("breadcrumb")}
                onClick={breadcrumbClick}
              >
                {breadcrumb}
              </div>
              <ChevronRight size={16} />
            </>
          )}
          <Heading rank={2} size="xs">
            {title}
          </Heading>
        </span>
      </div>
      <div className={getClassName("content")}>{children}</div>
    </div>
  );
};
