import { ComponentData, Config, Content, RootData } from "../../types";
import { isSlot as _isSlot, createIsSlotConfig } from "./is-slot";

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

export function mapSlotsSync<T extends ComponentData | RootData>(
  item: T,
  map: (data: Content, parentId: string, propName: string) => Content,
  isSlot: (type: string, propName: string, propValue: any) => boolean = _isSlot
): T {
  const props: Record<string, any> = { ...item.props };

  const propKeys = Object.keys(props);

  for (let i = 0; i < propKeys.length; i++) {
    const propKey = propKeys[i];

    const itemType = "type" in item ? item.type : "root";

    if (isSlot(itemType, propKey, props[propKey])) {
      const content = props[propKey] as Content;

      const mappedContent = content.map((item) => {
        return mapSlotsSync(item, map, isSlot);
      });

      props[propKey] = map(mappedContent, props.id, propKey);
    }
  }

  return { ...item, props };
}

type MapSlotOptions = {
  parentId: string;
  propName: string;
};

export function mapSlotsPublic<T extends ComponentData | RootData>(
  item: T,
  config: Config,
  map: (data: Content, options: MapSlotOptions) => Content
): T {
  const isSlot = createIsSlotConfig(config);

  return mapSlotsSync(
    item,
    (content, parentId, propName) => map(content, { parentId, propName }),
    isSlot
  );
}
