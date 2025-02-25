import type { JSX } from "react";
import { Fields } from "./Fields";
import { ComponentData, Metadata, RootData } from "./Data";

import { AsFieldProps, WithChildren, WithId, WithPuckProps } from "./Utils";
import { AppState } from "./AppState";
import { DefaultComponentProps } from "./Props";
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
  inline?: boolean;
  resolveFields?: (
    data: DataShape,
    params: {
      changed: Partial<Record<keyof FieldProps, boolean>>;
      fields: Fields<FieldProps>;
      lastFields: Fields<FieldProps>;
      lastData: DataShape | null;
      appState: AppState;
      parent: ComponentData | null;
    }
  ) => Promise<Fields<FieldProps>> | Fields<FieldProps>;
  resolveData?: (
    data: DataShape,
    params: {
      changed: Partial<Record<keyof FieldProps, boolean>>;
      lastData: DataShape | null;
      metadata: Metadata;
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
      lastPermissions: Partial<Permissions>;
      permissions: Partial<Permissions>;
      appState: AppState;
      lastData: DataShape | null;
    }
  ) => Promise<Partial<Permissions>> | Partial<Permissions>;
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
      WithChildren<RootProps>,
      AsFieldProps<RootProps>,
      RootData<AsFieldProps<RootProps>>
    >
  >;
};
