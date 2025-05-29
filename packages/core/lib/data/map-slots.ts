import {
  ComponentData,
  Config,
  Content,
  Fields,
  RootData,
  SlotField,
} from "../../types";
import { isSlot as _isSlot } from "./is-slot";

type MapFn<T = any> = (
  data: Content,
  parentId: string,
  propName: string,
  field: SlotField,
  propPath: string
) => T;

type PromiseMapFn = MapFn<Promise<any>>;

type EitherMapFn = MapFn<any | Promise<any>>;

type WalkFieldOpts = {
  value: unknown;
  fields: Fields;
  map: EitherMapFn;
  propKey?: string;
  propPath?: string;
  id?: string;
};

type WalkObjectOpts = {
  value: Record<string, any>;
  fields: Fields;
  map: EitherMapFn;
  id: string;
  getPropPath: (str: string) => string;
};

const isPromise = <T = unknown>(v: any): v is Promise<T> =>
  !!v && typeof v.then === "function";

const flatten = (values: Record<string, any>[]) =>
  values.reduce((acc, item) => ({ ...acc, ...item }), {});

const containsPromise = (arr: any[]) => arr.some(isPromise);

export const walkField = ({
  value,
  fields,
  map,
  propKey = "",
  propPath = "",
  id = "",
}: WalkFieldOpts): any | Promise<any> => {
  if (fields[propKey]?.type === "slot") {
    const content = (value as Content) || [];

    return map(content, id, propPath, fields[propKey], propPath);
  }

  if (value && typeof value === "object") {
    if (Array.isArray(value)) {
      const arrayFields =
        fields[propKey]?.type === "array" ? fields[propKey].arrayFields : null;

      if (!arrayFields) return value;

      const newValue = value.map((el, idx) =>
        walkField({
          value: el,
          fields: arrayFields,
          map,
          propKey,
          propPath: `${propPath}[${idx}]`,
          id,
        })
      );

      if (containsPromise(newValue)) {
        return Promise.all(newValue);
      }

      return newValue;
    } else if ("$$typeof" in value) {
      return value;
    } else {
      const objectFields =
        fields[propKey]?.type === "object"
          ? fields[propKey].objectFields
          : fields;

      return walkObject({
        value,
        fields: objectFields,
        map,
        id,
        getPropPath: (k) => `${propPath}.${k}`,
      });
    }
  }

  return value;
};

const walkObject = ({
  value,
  fields,
  map,
  id,
  getPropPath,
}: WalkObjectOpts): Record<string, any> => {
  const newProps = Object.entries(value).map(([k, v]) => {
    const opts: WalkFieldOpts = {
      value: v,
      fields,
      map,
      propKey: k,
      propPath: getPropPath(k),
      id,
    };

    const newValue = walkField(opts);

    if (isPromise(newValue)) {
      return newValue.then((resolvedValue: any) => ({
        [k]: resolvedValue,
      }));
    }

    return {
      [k]: newValue,
    };
  }, {});

  if (containsPromise(newProps)) {
    return Promise.all(newProps).then(flatten);
  }

  return flatten(newProps);
};

export function mapSlots<T extends ComponentData | RootData>(
  item: T,
  map: MapFn,
  config: Config
): T;

export function mapSlots<T extends ComponentData | RootData>(
  item: T,
  map: PromiseMapFn,
  config: Config
): Promise<T>;

export function mapSlots(item: any, map: EitherMapFn, config: Config): any {
  const itemType = "type" in item ? item.type : "root";

  const componentConfig =
    itemType === "root" ? config.root : config.components?.[itemType];

  const newProps = walkObject({
    value: item.props ?? {},
    fields: componentConfig?.fields ?? {},
    map,
    id: item.props ? item.props.id : "root",
    getPropPath: (k) => k,
  });

  if (isPromise(newProps)) {
    return newProps.then((resolvedProps) => ({
      ...item,
      props: resolvedProps,
    }));
  }

  return {
    ...item,
    props: newProps,
  };
}
