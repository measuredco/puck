import { ReactNode } from "react";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { Heading } from "../Heading";
import { ChevronRight } from "react-feather";
import { useBreadcrumbs } from "../../lib/use-breadcrumbs";
import { useAppContext } from "../Puck/context";
import { ClipLoader } from "react-spinners";

const getClassName = getClassNameFactory("SidebarSection", styles);

export const SidebarSection = ({
  children,
  title,
  background,
  showBreadcrumbs,
  noPadding,
  isLoading,
}: {
  children: ReactNode;
  title: ReactNode;
  background?: string;
  showBreadcrumbs?: boolean;
  noPadding?: boolean;
  isLoading?: boolean | null;
}) => {
  const { setUi } = useAppContext();
  const breadcrumbs = useBreadcrumbs(1);

  return (
    <div className={getClassName({ noPadding })} style={{ background }}>
      <div className={getClassName("title")}>
        <div className={getClassName("breadcrumbs")}>
          {showBreadcrumbs
            ? breadcrumbs.map((breadcrumb, i) => (
                <div key={i} className={getClassName("breadcrumb")}>
                  <div
                    className={getClassName("breadcrumbLabel")}
                    onClick={() => setUi({ itemSelector: breadcrumb.selector })}
                  >
                    {breadcrumb.label}
                  </div>
                  <ChevronRight size={16} />
                </div>
              ))
            : null}
          <div className={getClassName("heading")}>
            <Heading rank={2} size="xs">
              {title}
            </Heading>
          </div>
        </div>
      </div>
      <div className={getClassName("content")}>{children}</div>
      {isLoading && (
        <div className={getClassName("loadingOverlay")}>
          <ClipLoader />
        </div>
      )}
    </div>
  );
};
