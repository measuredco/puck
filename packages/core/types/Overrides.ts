import { ReactElement, ReactNode } from "react";
import { InputProps } from "../components/InputOrGroup";
import { Field } from "./Config";
import { ItemSelector } from "../lib/get-item";

// Plugins can use `usePuck` instead of relying on props
type RenderFunc<
  Props extends { [key: string]: any } = { children: ReactNode }
> = (props: Props) => ReactElement;

// All direct render methods, excluding fields
export const overrideKeys = [
  "header",
  "headerActions",
  "fields",
  "fieldLabel",
  "components",
  "componentItem",
  "outline",
  "puck",
  "preview",
] as const;

export type OverrideKey = (typeof overrideKeys)[number];

type OverridesGeneric<Shape extends { [key in OverrideKey]: any }> = Shape;

export type Overrides = OverridesGeneric<{
  fieldTypes: Partial<FieldRenderFunctions>;
  header: RenderFunc<{ actions: ReactNode; children: ReactNode }>;
  headerActions: RenderFunc<{ children?: ReactNode }>;
  preview: RenderFunc;
  fields: RenderFunc<{
    children: ReactNode;
    isLoading: boolean;
    itemSelector?: ItemSelector | null;
  }>;
  fieldLabel: RenderFunc<{
    children?: ReactNode;
    icon?: ReactNode;
    label: string;
    el?: "label" | "div";
    readOnly?: boolean;
    className?: string;
  }>;
  components: RenderFunc;
  componentItem: RenderFunc<{ children: ReactNode; name: string }>;
  outline: RenderFunc;
  puck: RenderFunc;
}>;

export type FieldRenderFunctions = Omit<
  {
    [Type in Field["type"]]: React.FunctionComponent<
      InputProps<Extract<Field, { type: Type }>> & {
        children: ReactNode;
      }
    >;
  },
  "custom"
> & {
  [key: string]: React.FunctionComponent<
    InputProps<any> & {
      children: ReactNode;
    }
  >;
};
