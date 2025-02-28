import React, { CSSProperties } from "react";

export { AutoField } from "@/core/components/AutoField";

import { ReactNode } from "react";
import "@/core/styles.css";
import { Puck } from "@/core/components/Puck";

import { ComponentConfig } from "@/core/types";
import { getClassNameFactory } from "@/core/lib";

import styles from "./styles.module.css";
import { usePuck } from "@/core/lib/use-puck";
import { FieldLabel } from "@/core/components/AutoField";

const getClassNamePreview = getClassNameFactory("PreviewFrame", styles);
const getClassNameConfigPreview = getClassNameFactory("ConfigPreview", styles);

export const PreviewFrame = ({
  children,
  label,
  style = {},
  disableOnClick = false,
}: {
  children?: ReactNode;
  label?: string;
  style?: CSSProperties;
  disableOnClick?: boolean;
}) => {
  const { dispatch } = usePuck();

  return (
    <div
      className={getClassNamePreview()}
      onClick={() => {
        if (disableOnClick) return;

        dispatch({ type: "setUi", ui: { itemSelector: null } });
      }}
    >
      <div className={getClassNamePreview("header")}>
        <div className={getClassNamePreview("annotation")}>
          Interactive Demo
        </div>
        {label && <div className={getClassNamePreview("label")}>{label}</div>}
      </div>
      <div className={getClassNamePreview("body")} style={style}>
        {children}
      </div>
    </div>
  );
};

export const PuckPreview = ({
  label,
  children,
  style = {},
  ...puckProps
}: React.ComponentProps<typeof Puck> & {
  label: string;
  children: ReactNode;
  style?: CSSProperties;
}) => {
  return (
    <Puck config={{}} data={{}} {...puckProps} iframe={{ enabled: false }}>
      <PreviewFrame label={label} style={style}>
        {children}
      </PreviewFrame>
    </Puck>
  );
};

const ConfigPreviewInner = ({
  componentConfig,
}: {
  componentConfig: ComponentConfig;
}) => {
  const { appState } = usePuck();

  return (
    <div className={getClassNameConfigPreview()}>
      <div className={getClassNameConfigPreview("field")}>
        <Puck.Fields />
      </div>

      {componentConfig.render && (
        <div className={getClassNameConfigPreview("preview")}>
          {componentConfig.render({
            ...appState.data["content"][0]?.props,
            puck: { renderDropZone: () => <div />, isEditing: false },
          })}
        </div>
      )}
    </div>
  );
};

export const ConfigPreview = ({
  componentConfig,
  label,
}: {
  componentConfig: ComponentConfig;
  label: string;
}) => {
  return (
    <Puck
      config={{ components: { Example: componentConfig } }}
      data={{
        content: [
          {
            type: "Example",
            props: { ...componentConfig.defaultProps, id: "example" },
          },
        ],
        root: { props: {} },
      }}
      onPublish={() => {}}
      ui={{ itemSelector: { index: 0 } }}
    >
      <PreviewFrame label={label} style={{ padding: 0 }} disableOnClick>
        <ConfigPreviewInner componentConfig={componentConfig} />
      </PreviewFrame>
    </Puck>
  );
};
