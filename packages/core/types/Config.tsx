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
  title?: string;
  [key: string]: any;
};

export type DefaultRootRenderProps = {
  editMode: boolean;
} & DefaultRootProps;

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
> = ComponentData<Props>[];

export type ComponentConfig<
  ComponentProps extends DefaultComponentProps = DefaultComponentProps,
  DefaultProps = ComponentProps,
  DataShape = ComponentData<ComponentProps>
> = {
  render: (props: WithPuckProps<ComponentProps>) => ReactElement;
  defaultProps?: DefaultProps;
  fields?: Fields<ComponentProps>;
  resolveData?: (
    data: DataShape,
    params: { changed: Partial<Record<keyof ComponentProps, boolean>> }
  ) =>
    | Promise<Partial<ComponentDataWithOptionalProps<ComponentProps>>>
    | Partial<ComponentDataWithOptionalProps<ComponentProps>>;
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
    [ComponentName in keyof Props]: Omit<
      ComponentConfig<Props[ComponentName], Props[ComponentName]>,
      "type"
    >;
  };
  root?: Partial<
    ComponentConfig<
      RootProps & { children: ReactNode },
      Partial<RootProps & { children: ReactNode }>,
      RootDataWithProps<RootProps>
    >
  >;
};

export type BaseData<
  Props extends { [key: string]: any } = { [key: string]: any }
> = {
  readOnly?: Partial<Record<keyof Props, boolean>>;
};

export type ComponentData<
  Props extends DefaultComponentProps = DefaultComponentProps
> = {
  type: keyof Props;
  props: WithPuckProps<Props>;
} & BaseData<Props>;

export type RootDataWithProps<
  Props extends DefaultRootProps = DefaultRootProps
> = {
  props: Props;
};

// DEPRECATED
export type RootDataWithoutProps<
  Props extends DefaultRootProps = DefaultRootProps
> = Props;

export type RootData<Props extends DefaultRootProps = DefaultRootProps> =
  BaseData<Props> &
    Partial<RootDataWithProps<Props>> &
    Partial<RootDataWithoutProps<Props>>; // DEPRECATED

type ComponentDataWithOptionalProps<
  Props extends { [key: string]: any } = { [key: string]: any }
> = Omit<ComponentData, "props"> & {
  props: Partial<WithPuckProps<Props>>;
};

// Backwards compatability
export type MappedItem = ComponentData;

export type Data<
  Props extends DefaultComponentProps = DefaultComponentProps,
  RootProps extends DefaultRootProps = DefaultRootProps
> = {
  root: RootData<RootProps>;
  content: Content<WithPuckProps<Props>>;
  zones?: Record<string, Content<WithPuckProps<Props>>>;
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
