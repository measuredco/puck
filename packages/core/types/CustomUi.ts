import { ReactElement, ReactNode } from "react";
import { InputProps } from "../components/InputOrGroup";
import { Field } from "./Config";

// Plugins can use `usePuck` instead of relying on props
type RenderFunc<
  Props extends { [key: string]: any } = { children: ReactNode }
> = (props: Props) => ReactElement;

// All direct render methods, excluding fields
export const customUiKeys = [
  "header",
  "headerActions",
  "root",
  "rootForm",
  "form",
  "componentList",
  "componentListItem",
  "outline",
  "puck",
] as const;

type CustomUiGeneric<
  Shape extends { [key in (typeof customUiKeys)[number]]: any }
> = Shape;

export type CustomUi = CustomUiGeneric<{
  fields: Partial<FieldRenderFunctions>;
  header: RenderFunc<{ actions: ReactNode; children: ReactNode }>;
  headerActions: RenderFunc<{}>;
  root: RenderFunc;
  rootForm: RenderFunc<{ children: ReactNode; isLoading: boolean }>;
  form: RenderFunc<{ children: ReactNode; isLoading: boolean }>;
  componentList: RenderFunc;
  componentListItem: RenderFunc<{ children: ReactNode; name: string }>;
  outline: RenderFunc;
  puck: RenderFunc;
}>;

export type FieldRenderFunctions = Omit<
  {
    [Type in Field["type"]]: (
      props: InputProps<Extract<Field, { type: Type }>>
    ) => ReactNode;
  },
  "custom"
> & { [key: string]: (props: InputProps<any>) => ReactNode };
