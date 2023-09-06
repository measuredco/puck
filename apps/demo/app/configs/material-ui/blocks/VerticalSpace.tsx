import React from "react";

import { ComponentConfig } from "@measured/puck";
import { Box } from "@mui/material";
import { spacingOptions } from "../options";

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
  render: ({ size = "8" }) => {
    return <Box sx={{ height: (theme) => theme.spacing(parseInt(size)) }} />;
  },
};
