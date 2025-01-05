import { DefaultComponentProps, DefaultRootFieldProps } from "./Props";
import { AsFieldProps, WithId } from "./Utils";

export type BaseData<
  Props extends { [key: string]: any } = { [key: string]: any }
> = {
  readOnly?: Partial<Record<keyof Props, boolean>>;
};

export type RootDataWithProps<
  Props extends DefaultComponentProps = DefaultRootFieldProps,
  PropsMap extends DefaultComponentProps = DefaultComponentProps
> = BaseData<Props> & {
  props: Props;
  // props: Props & { children?: Content<PropsMap> };
};

// DEPRECATED
export type RootDataWithoutProps<
  Props extends DefaultComponentProps = DefaultRootFieldProps
> = Props;

export type RootData<
  Props extends DefaultComponentProps = DefaultRootFieldProps,
  PropsMap extends DefaultComponentProps = DefaultComponentProps
> = Partial<RootDataWithProps<AsFieldProps<Props>, PropsMap>> &
  Partial<RootDataWithoutProps<Props>>; // DEPRECATED

export type ComponentData<
  Props extends DefaultComponentProps = DefaultComponentProps,
  Name = string
> = {
  type: Name;
  props: WithId<Props>;
} & BaseData<Props>;

// Backwards compatibility
export type MappedItem = ComponentData;

export type ComponentDataMap<
  PropsMap extends Record<string, DefaultComponentProps> = DefaultComponentProps
> = {
  [K in keyof PropsMap]: ComponentData<
    PropsMap[K],
    K extends string ? K : never
  >;
}[keyof PropsMap];

export type Content<
  PropsMap extends { [key: string]: any } = { [key: string]: any }
> = ComponentDataMap<PropsMap>[];

export type Data<
  PropsMap extends DefaultComponentProps = DefaultComponentProps,
  RootProps extends DefaultComponentProps = DefaultRootFieldProps
> = {
  root: RootData<RootProps, PropsMap>;
  content: Content<PropsMap>;
  zones?: Record<string, Content<PropsMap>>;
};
