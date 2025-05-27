import type { JSX, ReactNode } from "react";
import { Fields } from "./Fields";
import { ComponentData, Metadata, RootData } from "./Data";

import { AsFieldProps, WithChildren, WithId, WithPuckProps } from "./Utils";
import { AppState } from "./AppState";
import { DefaultComponentProps } from "./Props";
import { Permissions, Slot } from "./API";
import { DropZoneProps } from "../components/DropZone/types";

type SlotComponent = (props?: Omit<DropZoneProps, "zone">) => ReactNode;

/**
 * Recursively walk T and replace Slots with SlotComponents
 */
type WithDeepSlots<T> =
  // ────────────────────────────── leaf conversions ─────────────────────────────
  T extends Slot
    ? SlotComponent
    : // ────────────────────────── recurse into arrays & tuples ────────────────
    T extends readonly (infer U)[]
    ? ReadonlyArray<WithDeepSlots<U>>
    : T extends (infer U)[]
    ? WithDeepSlots<U>[]
    : // ───────────── recurse into objects while preserving optionality ────
    T extends object
    ? { [K in keyof T]: WithDeepSlots<T[K]> }
    : T;

export type PuckComponent<Props> = (
  props: WithId<
    WithPuckProps<{
      [K in keyof Props]: WithDeepSlots<Props[K]>;
    }>
  >
) => JSX.Element;

export type ResolveDataTrigger = "insert" | "replace" | "load" | "force";

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
