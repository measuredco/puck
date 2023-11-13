import React from "react";

import { ComponentConfig } from "@/core";
import { spacingOptions } from "../../options";

export type VerticalSpaceProps = {
  size: string;
};

export const VerticalSpace: ComponentConfig<VerticalSpaceProps> = {
  fields: {
    size: {
      type: "select",
      options: spacingOptions,
    },
  },
  defaultProps: {
    size: "24px",
  },
  render: ({ size }) => {
    return <div style={{ height: size, width: "100%" }} />;
  },
};
