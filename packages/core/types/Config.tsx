import { ReactNode } from "react";
import { ItemSelector } from "../lib/get-item";
import { DropZoneProps } from "../components/DropZone/types";
import { Viewport } from "./Viewports";
import { Fields } from "./Fields";

type WithPuckProps<Props> = Props & {
  id: string;
};

export type DefaultRootProps = {
  title?: string;
  [key: string]: any;
};

export type DefaultComponentProps = { [key: string]: any; editMode?: boolean };

export type Content<
  Props extends { [key: string]: any } = { [key: string]: any }
> = ComponentData<Props>[];

export type PuckComponent<Props> = (
  props: WithPuckProps<Props & { puck: PuckContext }>
) => JSX.Element;

export type PuckContext = {
  renderDropZone: React.FC<DropZoneProps>;
  isEditing: boolean;
};

export type ComponentConfig<
  ComponentProps extends DefaultComponentProps = DefaultComponentProps,
  DefaultProps = ComponentProps,
  DataShape = Omit<ComponentData<ComponentProps>, "type">
> = {
  render: PuckComponent<ComponentProps>;
  label?: string;
  defaultProps?: DefaultProps;
  fields?: Fields<ComponentProps>;
  resolveFields?: (
    data: DataShape,
    params: {
      changed: Partial<Record<keyof ComponentProps, boolean>>;
      fields: Fields<ComponentProps>;
      lastFields: Fields<ComponentProps>;
      lastData: DataShape;
      appState: AppState;
    }
  ) => Promise<Fields<ComponentProps>> | Fields<ComponentProps>;
  resolveData?: (
    data: DataShape,
    params: {
      changed: Partial<Record<keyof ComponentProps, boolean>>;
      lastData: DataShape;
    }
  ) =>
    | Promise<{
        props?: Partial<ComponentProps>;
        readOnly?: Partial<Record<keyof ComponentProps, boolean>>;
      }>
    | {
        props?: Partial<ComponentProps>;
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
  Props extends Record<string, any> = Record<string, any>,
  RootProps extends DefaultRootProps = DefaultRootProps,
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
      RootProps & { children?: ReactNode },
      Partial<RootProps & { children?: ReactNode }>,
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
  Props extends DefaultComponentProps = DefaultComponentProps
> = {
  type: keyof Props;
  props: WithPuckProps<Props>;
} & BaseData<Props>;

export type RootDataWithProps<
  Props extends DefaultRootProps = DefaultRootProps
> = BaseData<Props> & {
  props: Props;
};

// DEPRECATED
export type RootDataWithoutProps<
  Props extends DefaultRootProps = DefaultRootProps
> = Props;

export type RootData<Props extends DefaultRootProps = DefaultRootProps> =
  Partial<RootDataWithProps<Props>> & Partial<RootDataWithoutProps<Props>>; // DEPRECATED

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
