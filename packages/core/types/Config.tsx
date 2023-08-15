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
  type:
    | "text"
    | "textarea"
    | "number"
    | "select"
    | "array"
    | "external"
    | "radio";
  label?: string;
  adaptor?: Adaptor;
  adaptorParams?: object;
  arrayFields?: {
    [SubPropName in keyof Props]: Field<Props[SubPropName]>;
  };
  getItemSummary?: (item: Props, index?: number) => string;
  defaultItemProps?: Props;
  options?: {
    label: string;
    value: string | number | boolean;
  }[];
};

export type DefaultRootProps = {
  children: ReactNode;
  title: string;
  editMode: boolean;
  [key: string]: any;
};

export type DefaultComponentProps = { [key: string]: any; editMode?: boolean };

export type Fields<
  ComponentProps extends DefaultComponentProps = DefaultComponentProps
> = {
  [PropName in keyof Omit<
    Required<ComponentProps>,
    "children" | "editMode"
  >]: Field<ComponentProps[PropName][0]>;
};

export type ComponentConfig<
  ComponentProps extends DefaultComponentProps = DefaultComponentProps,
  DefaultProps = ComponentProps
> = {
  render: (props: ComponentProps) => ReactElement;
  defaultProps?: DefaultProps;
  fields?: Fields<ComponentProps>;
};

export type Config<
  Props extends { [key: string]: any } = { [key: string]: any },
  RootProps extends DefaultRootProps = DefaultRootProps
> = {
  components: {
    [ComponentName in keyof Props]: ComponentConfig<Props[ComponentName]>;
  };
  root?: ComponentConfig<
    RootProps & { children: ReactNode },
    Partial<RootProps & { children: ReactNode }>
  >;
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
  RootProps extends { title: string; [key: string]: any } = {
    title: string;
    [key: string]: any;
  }
> = {
  root: RootProps;
  content: MappedItem<Props>[];
};
