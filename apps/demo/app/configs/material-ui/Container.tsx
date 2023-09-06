import React, { ReactNode } from "react";

import { Breakpoint, Container as _Container } from "@mui/material";
import { breakpointOptions, spacingOptions } from "./options";

import { Fields } from "@measured/puck";

export type ContainerProps = {
  paddingBottom?: string;
  paddingTop?: string;
  maxWidth?: Breakpoint;
};

export const containerFields: Fields<ContainerProps> = {
  paddingTop: {
    type: "select",
    options: spacingOptions,
  },
  paddingBottom: {
    type: "select",
    options: spacingOptions,
  },
  maxWidth: {
    type: "select",
    options: breakpointOptions,
  },
};

export const Container = ({
  children,
  paddingBottom,
  paddingTop,
  maxWidth,
}: ContainerProps & { children: ReactNode }) => {
  return (
    <_Container
      sx={{
        pb: (theme) => theme.spacing(parseInt(paddingBottom)),
        pt: (theme) => theme.spacing(parseInt(paddingTop)),
      }}
      maxWidth={maxWidth}
    >
      {children}
    </_Container>
  );
};
