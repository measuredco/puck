import type { JSX, ReactNode } from "react";
import { Fields } from "./Fields";
import { ComponentData, Metadata, RootData } from "./Data";

import { AsFieldProps, WithChildren, WithId, WithPuckProps } from "./Utils";
import { AppState } from "./AppState";
import { DefaultComponentProps } from "./Props";
import { Permissions } from "./API";
import { DropZoneProps } from "../components/DropZone/types";
import { WithDeepSlots } from "./Internal";

type SlotComponent = (props?: Omit<DropZoneProps, "zone">) => ReactNode;

export type PuckComponent<Props> = (
  props: WithId<
    WithPuckProps<{
      [K in keyof Props]: WithDeepSlots<Props[K], SlotComponent>;
    }>
  >
) => JSX.Element;

export type ResolveDataTrigger = "insert" | "replace" | "load" | "force";

type WithPartialProps<T, Props extends DefaultComponentProps> = Omit<
  T,
  "props"
> & {
  props?: Partial<Props>;
};

export type ComponentConfig<
  RenderProps extends DefaultComponentProps = DefaultComponentProps,
  FieldProps extends DefaultComponentProps = RenderProps,
  DataShape = Omit<ComponentData<FieldProps>, "type"> // NB this doesn't include AllProps, so types will not contain deep slot types. To fix, we require a breaking change.
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
      changed: Partial<Record<keyof FieldProps, boolean> & { id: string }>;
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
      changed: Partial<Record<keyof FieldProps, boolean> & { id: string }>;
      lastData: DataShape | null;
      metadata: Metadata;
      trigger: ResolveDataTrigger;
    }
  ) =>
    | Promise<WithPartialProps<DataShape, FieldProps>>
    | WithPartialProps<DataShape, FieldProps>;
  resolvePermissions?: (
    data: DataShape,
    params: {
      changed: Partial<Record<keyof FieldProps, boolean> & { id: string }>;
      lastPermissions: Partial<Permissions>;
      permissions: Partial<Permissions>;
      appState: AppState;
      lastData: DataShape | null;
    }
  ) => Promise<Partial<Permissions>> | Partial<Permissions>;
  metadata?: Metadata;
};

export type RootConfig<RootProps extends DefaultComponentProps = any> = Partial<
  ComponentConfig<
    WithChildren<RootProps>,
    AsFieldProps<RootProps>,
    RootData<AsFieldProps<RootProps>>
  >
>;

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
  root?: RootConfig<RootProps>;
};
