import { ReactNode } from "react";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { Heading } from "../Heading";
import { ChevronRight } from "react-feather";
import { ItemSelector } from "../../lib/get-item";

const getClassName = getClassNameFactory("SidebarSection", styles);

type Breadcrumb = { label: string; selector: ItemSelector | null };

export const SidebarSection = ({
  children,
  title,
  background,
  breadcrumbs = [],
  breadcrumbClick,
  noPadding,
}: {
  children: ReactNode;
  title: ReactNode;
  background?: string;
  breadcrumbs?: Breadcrumb[];
  breadcrumbClick?: (breadcrumb: Breadcrumb) => void;
  noPadding?: boolean;
}) => {
  return (
    <div className={getClassName({ noPadding })} style={{ background }}>
      <div className={getClassName("title")}>
        <div className={getClassName("breadcrumbs")}>
          {breadcrumbs.map((breadcrumb, i) => (
            <div key={i} className={getClassName("breadcrumb")}>
              <div
                className={getClassName("breadcrumbLabel")}
                onClick={() => breadcrumbClick && breadcrumbClick(breadcrumb)}
              >
                {breadcrumb.label}
              </div>
              <ChevronRight size={16} />
            </div>
          ))}
          <div className={getClassName("heading")}>
            <Heading rank={2} size="xs">
              {title}
            </Heading>
          </div>
        </div>
      </div>
      <div className={getClassName("content")}>{children}</div>
    </div>
  );
};
