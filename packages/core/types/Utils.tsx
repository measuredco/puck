import { ReactNode } from "react";
import { Config } from "./Config";
import { PuckContext } from "./Props";
import { ComponentData, Data } from "./Data";
import { AppState } from "./AppState";

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

export type UserGenerics<
  UserConfig extends Config = Config,
  UserProps extends ExtractPropsFromConfig<UserConfig> = ExtractPropsFromConfig<UserConfig>,
  UserRootProps extends ExtractRootPropsFromConfig<UserConfig> = ExtractRootPropsFromConfig<UserConfig>,
  UserData extends Data<UserProps, UserRootProps> | Data = Data<
    UserProps,
    UserRootProps
  >,
  UserAppState extends AppState<UserData> = AppState<UserData>,
  UserComponentData extends ComponentData = UserData["content"][0]
> = {
  UserConfig: UserConfig;
  UserProps: UserProps;
  UserRootProps: UserRootProps;
  UserData: UserData;
  UserAppState: UserAppState;
  UserComponentData: UserComponentData;
};
