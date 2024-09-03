import { Fields } from "./Fields";
import { ComponentData, RootData } from "./Data";

import { AsFieldProps, WithId, WithPuckProps } from "./Utils";
import { AppState } from "./AppState";
import { DefaultComponentProps, DefaultRootRenderProps } from "./Props";
import { Permissions } from "./API";

export type PuckComponent<Props> = (
  props: WithId<WithPuckProps<Props>>
) => JSX.Element;

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
  Props extends DefaultComponentProps = DefaultComponentProps,
  RootProps extends DefaultComponentProps = any,
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
