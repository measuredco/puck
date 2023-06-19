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
  label?: string;
  adaptor?: Adaptor;
  adaptorParams?: object;
  groupFields?: {
    [SubPropName in keyof Props]: Field<Props[SubPropName]>;
  };
  getItemSummary?: (item: Props, index: number) => string;
  options?: {
    label: string;
    value: string | number;
  }[];
};

type DefaultComponentProps = { [key: string]: any; editMode?: boolean };

export type Fields<
  ComponentProps extends DefaultComponentProps = DefaultComponentProps
> = {
  [PropName in keyof Omit<
    Required<ComponentProps>,
    "children" | "editMode"
  >]: Field<ComponentProps[PropName][0]>;
};

export type ComponentConfig<
  ComponentProps extends DefaultComponentProps = DefaultComponentProps
> = {
  render: (props: ComponentProps) => ReactElement;
  defaultProps?: ComponentProps;
  fields?: Fields<ComponentProps>;
};

export type Config<
  Props extends { [key: string]: any } = { [key: string]: any },
  PageProps extends { title: string; [key: string]: any } = {
    title: string;
    [key: string]: any;
  }
> = {
  components: {
    [ComponentName in keyof Props]: ComponentConfig<Props[ComponentName]>;
  };
  page?: ComponentConfig<PageProps & { children: ReactNode }>;
};

type MappedItem<Props extends { [key: string]: any } = { [key: string]: any }> =
  {
    type: keyof Props;
    props: {
      [key: string]: any;
    } & { id: string };
  };

export type Data<
  Props extends { [key: string]: any } = { [key: string]: any },
  PageProps extends { title: string; [key: string]: any } = {
    title: string;
    [key: string]: any;
  }
> = {
  page: PageProps;
  content: MappedItem<Props>[];
};
