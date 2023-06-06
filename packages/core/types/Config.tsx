import { ReactElement } from "react";
import { ReactNode } from "react";

export type Adaptor<AdaptorParams = {}> = {
  name: string;
  fetchList: (
    adaptorParams?: AdaptorParams
  ) => Promise<Record<string, any>[] | null>;
};

export type Field<
  Props extends { [key: string]: any } = { [key: string]: any }
> = {
  type: "text" | "number" | "select" | "group" | "external";
  adaptor?: Adaptor;
  adaptorParams?: object;
  items?: {
    [SubPropName in keyof Props]: Field<Props[SubPropName]>;
  }[];
  options?: {
    label: string;
    value: string | number;
  }[];
};

export type ComponentConfig<
  ComponentProps extends { [key: string]: any[] } = { [key: string]: any[] }
> = {
  render: (props: ComponentProps) => ReactNode;
  fields?: {
    [PropName in keyof Required<ComponentProps>]: Field<
      ComponentProps[PropName][0]
    >;
  };
};

export type Config<
  Props extends { [key: string]: any } = { [key: string]: any }
> = {
  [ComponentName in keyof Props]: ComponentConfig<Props[ComponentName]>;
} & { Base?: { render: (props: any) => ReactElement } };

export type Data<
  Props extends { [key: string]: any } = { [key: string]: any }
> = {
  type: keyof Props;
  props: {
    [key: string]: any;
  } & { id: string };
}[];
