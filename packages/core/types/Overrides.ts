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
  "components",
  "componentItem",
  "outline",
  "puck",
  "preview",
] as const;

type OverridesGeneric<
  Shape extends { [key in (typeof overrideKeys)[number]]: any }
> = Shape;

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
  components: RenderFunc;
  componentItem: RenderFunc;
  outline: RenderFunc;
  puck: RenderFunc;
}>;

export type FieldRenderFunctions = Omit<
  {
    [Type in Field["type"]]: (
      props: InputProps<Extract<Field, { type: Type }>> & {
        children: ReactNode;
      }
    ) => ReactNode;
  },
  "custom"
> & { [key: string]: (props: InputProps<any>) => ReactNode };
