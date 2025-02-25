import { DefaultComponentProps, DefaultRootFieldProps } from "./Props";
import { AsFieldProps, WithId } from "./Utils";

export type BaseData<
  Props extends { [key: string]: any } = { [key: string]: any }
> = {
  readOnly?: Partial<Record<keyof Props, boolean>>;
};

export type RootDataWithProps<
  Props extends DefaultComponentProps = DefaultRootFieldProps
> = BaseData<Props> & {
  props: Props;
};

// DEPRECATED
export type RootDataWithoutProps<
  Props extends DefaultComponentProps = DefaultRootFieldProps
> = Props;

export type RootData<
  Props extends DefaultComponentProps = DefaultRootFieldProps
> = Partial<RootDataWithProps<AsFieldProps<Props>>> &
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
  Props extends Record<string, DefaultComponentProps> = DefaultComponentProps
> = {
  [K in keyof Props]: ComponentData<Props[K], K extends string ? K : never>;
}[keyof Props];

export type Content<
  PropsMap extends { [key: string]: any } = { [key: string]: any }
> = ComponentDataMap<PropsMap>[];

export type Data<
  Props extends DefaultComponentProps = DefaultComponentProps,
  RootProps extends DefaultComponentProps = DefaultRootFieldProps
> = {
  root: RootData<RootProps>;
  content: Content<Props>;
  zones?: Record<string, Content<Props>>;
};
