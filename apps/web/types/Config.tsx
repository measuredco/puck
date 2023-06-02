import { ReactElement } from "react";
import { ReactNode } from "react";

export type Adaptor = {
  name: string;
  fetchList: (adaptorParams: object) => Promise<object[] | null>;
};

export type Field<Props extends { [key: string]: any }> = {
  type: "text" | "number" | "group" | "external";
  adaptor?: Adaptor;
  adaptorParams?: object;
  items?: {
    [SubPropName in keyof Props]: Field<Props[SubPropName]>;
  }[];
};

export type Config<Props extends { [key: string]: any }> = {
  [ComponentName in keyof Props]: {
    render: (props: Props[ComponentName]) => ReactNode;
    fields?: {
      [PropName in keyof Required<Props[ComponentName]>]: Field<
        Props[ComponentName][PropName][0]
      >;
    };
  };
} & { Base?: { render: (props: any) => ReactElement } };

export type InitialData<Props extends { [key: string]: any }> = {
  type: keyof Props;
  props: {
    [key: string]: any;
  } & { id: string };
}[];
