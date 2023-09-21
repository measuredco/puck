import { ReactElement } from "react";
import { ReactNode } from "react";

export type Adaptor<AdaptorParams = {}> = {
  name: string;
  fetchList: (
    adaptorParams?: AdaptorParams
  ) => Promise<Record<string, any>[] | null>;
};

type WithId<T> = T & {
  id: string;
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
    | "radio"
    | "custom";
  label?: string;
  adaptor?: Adaptor;
  adaptorParams?: object;
  arrayFields?: {
    [SubPropName in keyof Props]: Field<Props[SubPropName][0]>;
  };
  getItemSummary?: (item: Props, index?: number) => string;
  defaultItemProps?: Props;
  render?: (props: {
    field: Field;
    name: string;
    value: any;
    onChange: (value: any) => void;
    readOnly?: boolean;
  }) => ReactElement;
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

export type Content<
  Props extends { [key: string]: any } = { [key: string]: any }
> = MappedItem<Props>[];

export type ComponentConfig<
  ComponentProps extends DefaultComponentProps = DefaultComponentProps,
  DefaultProps = ComponentProps
> = {
  render: (props: WithId<ComponentProps>) => ReactElement;
  defaultProps?: DefaultProps;
  fields?: Fields<ComponentProps>;
};

export type Config<
  Props extends { [key: string]: any } = { [key: string]: any },
  RootProps extends DefaultRootProps = DefaultRootProps
> = {
  components: {
    [ComponentName in keyof Props]: ComponentConfig<
      Props[ComponentName],
      Props[ComponentName]
    >;
  };
  root?: ComponentConfig<
    RootProps & { children: ReactNode },
    Partial<RootProps & { children: ReactNode }>
  >;
};

type MappedItem<Props extends { [key: string]: any } = { [key: string]: any }> =
  {
    type: keyof Props;
    props: WithId<{
      [key: string]: any;
    }>;
  };

export type Data<
  Props extends { [key: string]: any } = { [key: string]: any },
  RootProps extends { title: string; [key: string]: any } = {
    title: string;
    [key: string]: any;
  }
> = {
  root: RootProps;
  content: Content<Props>;
  zones?: Record<string, Content<Props>>;
};
