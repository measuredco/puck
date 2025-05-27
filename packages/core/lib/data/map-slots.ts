import {
  ComponentData,
  Config,
  Content,
  Fields,
  RootData,
  SlotField,
} from "../../types";
import { isSlot as _isSlot } from "./is-slot";

export async function mapSlotsAsync<T extends ComponentData | RootData>(
  item: T,
  map: (data: Content, propName: string) => Promise<Content>,
  recursive: boolean = true,
  isSlot: (type: string, propName: string, propValue: any) => boolean = _isSlot
): Promise<T> {
  const props: Record<string, any> = { ...item.props };

  const propKeys = Object.keys(props);

  for (let i = 0; i < propKeys.length; i++) {
    const propKey = propKeys[i];

    const itemType = "type" in item ? item.type : "root";

    if (isSlot(itemType, propKey, props[propKey])) {
      const content = props[propKey] as Content;

      const mappedContent = recursive
        ? await Promise.all(
            content.map(async (item) => {
              return await mapSlotsAsync(item, map, recursive, isSlot);
            })
          )
        : content;

      props[propKey] = await map(mappedContent, propKey);
    }
  }

  return { ...item, props };
}

export const walkField = ({
  value,
  fields,
  map,
  propKey = "",
  propPath = "",
  id = "",
}: {
  value: unknown;
  fields: Fields;
  map: (
    data: Content,
    parentId: string,
    propName: string,
    field: SlotField
  ) => any;
  propKey?: string;
  propPath?: string;
  id?: string;
}): any => {
  if (fields[propKey]?.type === "slot") {
    const content = (value as Content) || [];

    return map(content, id, propPath, fields[propKey]);
  }

  if (value && typeof value === "object") {
    if (Array.isArray(value)) {
      const arrayFields =
        fields[propKey]?.type === "array" ? fields[propKey].arrayFields : null;

      if (!arrayFields) return value;

      return value.map((el, idx) =>
        walkField({
          value: el,
          fields: arrayFields,
          map,
          propKey,
          propPath: `${propPath}[${idx}]`,
          id,
        })
      );
    } else if ("$$typeof" in value) {
      return value;
    } else {
      const objectFields =
        fields[propKey]?.type === "object"
          ? fields[propKey].objectFields
          : fields;

      return Object.entries(value as Record<string, unknown>).reduce(
        (acc, [k, v]) => {
          const newValue = walkField({
            value: v,
            fields: objectFields,
            map,
            propKey: k,
            propPath: `${propPath}.${k}`,
            id,
          });

          if (typeof newValue === "undefined" || newValue === v) return acc;

          return {
            ...acc,
            [k]: newValue,
          };
        },
        value
      );
    }
  }

  return value;
};

export function mapSlotsSync<T extends ComponentData | RootData>(
  item: T,
  map: (
    data: Content,
    parentId: string,
    propName: string,
    field: SlotField
  ) => any,
  config: Config
): T {
  const itemType = "type" in item ? item.type : "root";

  const componentConfig =
    itemType === "root" ? config.root : config.components?.[itemType];

  const newProps = { ...(item.props ?? {}) };

  Object.entries(item.props ?? {}).forEach(([k, v]) => {
    const newValue = walkField({
      value: v,
      fields: componentConfig?.fields ?? {},
      map,
      propKey: k,
      propPath: k,
      id: item.props.id ?? "root",
    });

    newProps[k] = newValue;
  }, item.props);

  return {
    ...item,
    props: newProps,
  };
}
