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

// Helper type to increment depth (tuple length)
type IncrementDepth<D extends any[]> = [...D, any];

// Maximum depth to prevent infinite recursion
type MaxDepth = [any, any, any, any, any]; // Adjust the length to set the maximum depth

// Joins two strings with dot notation
export type DotJoin<A extends string, B extends string> = A extends ""
  ? B
  : `${A}.${B}`;

// Recursively finds all keys of a Record
export type DeepKeys<O extends Record<string, any>> = {
  [K in Extract<keyof O, string>]: O[K] extends Record<string, any>
    ? K | DotJoin<K, DeepKeys<O[K]>>
    : K;
}[Extract<keyof O, string>];

/**
 * Returns keys of an object in dot notation.
 *
 * ```
 * type Foo: {
 *  a: {
 *    b: string;
 *    c: {
 *      d: string;
 *      e: string;
 *    }
 *  }
 *  f: string;
 * }
 * ```
 *
 * type Result = DotBranch<Foo> // "a" | "a.b" | "a.c" | "a.c.d" | "a.c.e" | "f"
 */

export type DotBranch<
  O extends Record<string, any>,
  P extends string = "",
  D extends any[] = [],
  K extends string = Extract<keyof O, string>
> = D["length"] extends MaxDepth["length"]
  ? DotJoin<P, K>
  : K extends keyof O
  ? O[K] extends Record<string, any>
    ? DotBranch<O[K], DotJoin<P, K>, IncrementDepth<D>> | DotJoin<P, K>
    : DotJoin<P, K>
  : never;
