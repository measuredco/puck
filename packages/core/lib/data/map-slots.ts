import { ComponentData, Content, RootData } from "../../types";
import { isSlot as _isSlot } from "./is-slot";

export async function mapSlots<T extends ComponentData | RootData>(
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
              return await mapSlots(item, map, recursive, isSlot);
            })
          )
        : content;

      props[propKey] = await map(mappedContent, propKey);
    }
  }

  return { ...item, props };
}
