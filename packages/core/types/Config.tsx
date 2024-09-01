import { ReactNode } from "react";
import { ItemSelector } from "../lib/get-item";
import { DropZoneProps } from "../components/DropZone/types";
import { Viewport } from "./Viewports";
import { Fields } from "./Fields";

type WithId<Props> = Props & {
  id: string;
};

type WithPuckProps<Props> = WithId<Props> & { puck: PuckContext };
type AsFieldProps<Props> = Partial<
  Omit<Props, "children" | "puck" | "editMode">
>;

type WithChildren<Props> = Props & {
  children: ReactNode;
};

export type DefaultRootFieldProps = {
  title?: string;
};

export type DefaultRootRenderProps<
  Props extends DefaultComponentProps = DefaultRootFieldProps
> = WithPuckProps<WithChildren<Props>>;

export type DefaultRootProps = DefaultRootRenderProps; // Deprecated

export type DefaultComponentProps = { [key: string]: any };

export type Content<
  PropsMap extends { [key: string]: any } = { [key: string]: any }
> = ComponentDataMap<PropsMap>[];

export type PuckComponent<Props> = (
  props: WithPuckProps<
    Props & {
      puck: PuckContext;
      editMode?: boolean; // Deprecated
    }
  >
) => JSX.Element;

export type PuckContext = {
  renderDropZone: React.FC<DropZoneProps>;
  isEditing: boolean;
};

export type ComponentConfig<
  RenderProps extends DefaultComponentProps = DefaultComponentProps,
  FieldProps extends DefaultComponentProps = RenderProps,
  DataShape = Omit<ComponentData<FieldProps>, "type">
> = {
  render: PuckComponent<RenderProps>;
  label?: string;
  defaultProps?: FieldProps;
  fields?: Fields<FieldProps>;
  permissions?: Partial<Permissions>;
  resolveFields?: (
    data: DataShape,
    params: {
      changed: Partial<Record<keyof FieldProps, boolean>>;
      fields: Fields<FieldProps>;
      lastFields: Fields<FieldProps>;
      lastData: DataShape;
      appState: AppState;
    }
  ) => Promise<Fields<FieldProps>> | Fields<FieldProps>;
  resolveData?: (
    data: DataShape,
    params: {
      changed: Partial<Record<keyof FieldProps, boolean>>;
      lastData: DataShape;
    }
  ) =>
    | Promise<{
        props?: Partial<FieldProps>;
        readOnly?: Partial<Record<keyof FieldProps, boolean>>;
      }>
    | {
        props?: Partial<FieldProps>;
        readOnly?: Partial<Record<keyof FieldProps, boolean>>;
      };
  resolvePermissions?: (
    data: DataShape,
    params: {
      changed: Partial<Record<keyof FieldProps, boolean>>;
      lastPermissions: Partial<Permissions> | undefined;
      initialPermissions: Partial<Permissions>;
      appState: AppState;
    }
  ) => Partial<Permissions>;
};

type Category<ComponentName> = {
  components?: ComponentName[];
  title?: string;
  visible?: boolean;
  defaultExpanded?: boolean;
};

export type Config<
  Props extends Record<string, any> = Record<string, any>,
  RootProps extends DefaultComponentProps = DefaultRootFieldProps,
  CategoryName extends string = string
> = {
  categories?: Record<CategoryName, Category<keyof Props>> & {
    other?: Category<keyof Props>;
  };
  components: {
    [ComponentName in keyof Props]: Omit<
      ComponentConfig<Props[ComponentName], Props[ComponentName]>,
      "type"
    >;
  };
  root?: Partial<
    ComponentConfig<
      DefaultRootRenderProps<RootProps>,
      AsFieldProps<RootProps>,
      RootData
    >
  >;
};

export type BaseData<
  Props extends { [key: string]: any } = { [key: string]: any }
> = {
  readOnly?: Partial<Record<keyof Props, boolean>>;
};

export type ComponentData<
  Props extends DefaultComponentProps = DefaultComponentProps,
  Name = string
> = {
  type: Name;
  props: WithId<Props>;
} & BaseData<Props>;

export type ComponentDataMap<
  Props extends Record<string, DefaultComponentProps> = DefaultComponentProps
> = {
  [K in keyof Props]: ComponentData<Props[K], K>;
}[keyof Props];

export type RootDataWithProps<
  Props extends DefaultComponentProps = DefaultRootFieldProps
> = BaseData<Props> & {
  props: Props;
};

// DEPRECATED
export type RootDataWithoutProps<
  Props extends DefaultComponentProps = DefaultRootFieldProps
> = Props;

export type RootData<
  Props extends DefaultComponentProps = DefaultRootFieldProps
> = Partial<RootDataWithProps<AsFieldProps<Props>>> &
  Partial<RootDataWithoutProps<Props>>; // DEPRECATED

// Backwards compatibility
export type MappedItem = ComponentData;

export type Data<
  Props extends DefaultComponentProps = DefaultComponentProps,
  RootProps extends DefaultComponentProps = DefaultRootFieldProps
> = {
  root: RootData<RootProps>;
  content: Content<Props>;
  zones?: Record<string, Content<Props>>;
};

export type ItemWithId = {
  _arrayId: string;
  _originalIndex: number;
};

export type ArrayState = { items: ItemWithId[]; openId: string };

export type UiState = {
  leftSideBarVisible: boolean;
  rightSideBarVisible: boolean;
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
  isDragging: boolean;
  viewports: {
    current: {
      width: number;
      height: number | "auto";
    };
    controlsVisible: boolean;
    options: Viewport[];
  };
};

export type AppState = { data: Data; ui: UiState };

export type Permissions = {
  drag: boolean;
  duplicate: boolean;
  delete: boolean;
  edit: boolean;
  insert: boolean;
} & Record<string, boolean>;
