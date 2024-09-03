import { ReactNode } from "react";
import { Config } from "./Config";
import { PuckContext } from "./Props";

export type WithId<Props> = Props & {
  id: string;
};

export type WithPuckProps<Props> = Props & {
  puck: PuckContext;
  editMode?: boolean;
};
export type AsFieldProps<Props> = Omit<Props, "children" | "puck" | "editMode">;

export type WithChildren<Props> = Props & {
  children: ReactNode;
};

export type ExtractPropsFromConfig<UserConfig> = UserConfig extends Config<
  infer P,
  any,
  any
>
  ? P
  : never;

export type ExtractRootPropsFromConfig<UserConfig> = UserConfig extends Config<
  any,
  infer P,
  any
>
  ? P
  : never;
