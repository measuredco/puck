/* eslint-disable react-hooks/rules-of-hooks */
import React, { createContext, useContext } from "react";

import { ComponentConfig } from "@/core";
import { Heading as _Heading } from "@/core/components/Heading";
import { Heading } from "../Heading";
import type { HeadingProps as _HeadingProps } from "@/core/components/Heading";
import { HeadingProps } from "../Heading";

export const localeContext = createContext("en");

export type LocalisedHeadingProps = Omit<HeadingProps, "text"> & {
  text: {
    en: string;
    de: string;
  };
};

export const LocalisedHeading: ComponentConfig<LocalisedHeadingProps> = {
  fields: {
    ...Heading.fields,
    text: {
      type: "object",
      objectFields: { en: { type: "text" }, de: { type: "text" } },
    },
  },
  defaultProps: {
    ...Heading.defaultProps,
    text: {
      en: "Hello, world",
      de: "Hallo, Welt",
    },
  },
  render: ({ text, ...props }) => {
    const locale = useContext(localeContext);

    return <Heading.render {...props} text={text[locale]} />;
  },
};
