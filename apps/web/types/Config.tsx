import { ReactElement } from "react";
import { ReactNode } from "react";

export type Field<Props extends { [key: string]: any }> = {
  type: "text" | "number" | "group";
  items?: {
    [SubPropName in keyof Props]: Field<Props[SubPropName]>;
  }[];
};

export type Config<Props extends { [key: string]: any }> = {
  // TODO make tighter
  initialData?: {
    type: string;
    props: {
      [key: string]: any;
    } & { id: string };
  }[];
  fields: {
    [ComponentName in keyof Props]: {
      [PropName in keyof Required<Props[ComponentName]>]: Field<
        Props[ComponentName][PropName][0]
      >;
    };
  };
  mapping: {
    [ComponentName in keyof Props]: (props: Props[ComponentName]) => ReactNode;
  } & { Base?: (props: any) => ReactElement };
};
