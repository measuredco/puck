import { ReactElement } from "react";
import { ReactNode } from "react";
import { ItemSelector } from "../lib/get-item";

export type Adaptor<
  AdaptorParams = {},
  TableShape extends Record<string, any> = {},
  PropShape = TableShape
> = {
  name: string;
  fetchList: (adaptorParams?: AdaptorParams) => Promise<TableShape[] | null>;
  mapProp?: (value: TableShape) => PropShape;
};

type WithPuckProps<Props> = Props & {
  id: string;
  _meta?: {
    readOnly: Partial<Record<keyof Props, boolean>>;
  };
};

export type BaseField = {
  label?: string;
};

export type TextField = BaseField & {
  type: "text" | "number" | "textarea";
};

export type SelectField = BaseField & {
  type: "select" | "radio";
  options: {
    label: string;
    value: string | number | boolean;
  }[];
};

export type ArrayField<
  Props extends { [key: string]: any } = { [key: string]: any }
> = BaseField & {
  type: "array";
  arrayFields: {
    [SubPropName in keyof Props[0]]: Field<Props[0][SubPropName]>;
  };
  defaultItemProps?: Props[0];
  getItemSummary?: (item: Props[0], index?: number) => string;
};

export type ExternalField<
  Props extends { [key: string]: any } = { [key: string]: any }
> = BaseField & {
  type: "external";
  adaptor: Adaptor<any, any, Props>;
  adaptorParams?: object;
  getItemSummary: (item: Props, index?: number) => string;
};

export type CustomField<
  Props extends { [key: string]: any } = { [key: string]: any }
> = BaseField & {
  type: "custom";
  render: (props: {
    field: CustomField;
    name: string;
    value: any;
    onChange: (value: Props) => void;
    readOnly?: boolean;
  }) => ReactElement;
};

export type Field<
  Props extends { [key: string]: any } = { [key: string]: any }
> =
  | TextField
  | SelectField
  | ArrayField<Props>
  | ExternalField<Props>
  | CustomField;

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
  >]: Field<ComponentProps[PropName]>;
};

export type Content<
  Props extends { [key: string]: any } = { [key: string]: any }
> = MappedItem<Props>[];

export type ComponentConfig<
  ComponentProps extends DefaultComponentProps = DefaultComponentProps,
  DefaultProps = ComponentProps
> = {
  render: (props: WithPuckProps<ComponentProps>) => ReactElement;
  defaultProps?: DefaultProps;
  fields?: Fields<ComponentProps>;
  resolveProps?: (
    props: WithPuckProps<ComponentProps>,
    params: { changed: Partial<Record<keyof ComponentProps, boolean>> }
  ) =>
    | Promise<{
        props: WithPuckProps<ComponentProps>;
        readOnly?: Partial<Record<keyof ComponentProps, boolean>>;
      }>
    | {
        props: WithPuckProps<ComponentProps>;
        readOnly?: Partial<Record<keyof ComponentProps, boolean>>;
      };
};

type Category<ComponentName> = {
  components?: ComponentName[];
  title?: string;
  visible?: boolean;
  defaultExpanded?: boolean;
};

export type Config<
  Props extends { [key: string]: any } = { [key: string]: any },
  RootProps extends DefaultRootProps = DefaultRootProps,
  CategoryName extends string = string
> = {
  categories?: Record<CategoryName, Category<keyof Props>> & {
    other?: Category<Props>;
  };
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

export type MappedItem<
  Props extends { [key: string]: any } = { [key: string]: any }
> = {
  type: keyof Props;
  props: WithPuckProps<{
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

export type ItemWithId = {
  _arrayId: string;
  data: any;
};

export type ArrayState = { items: ItemWithId[]; openId: string };

export type UiState = {
  leftSideBarVisible: boolean;
  itemSelector: ItemSelector | null;
  arrayState: Record<string, ArrayState | undefined>;
  componentList: Record<
    string,
    {
      components?: string[];
      title?: string;
      visible?: boolean;
      expanded?: boolean;
    }
  >;
};

export type AppState = { data: Data; ui: UiState };
