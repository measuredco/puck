import { ComponentData, Content, RootData } from "../types";
import { forEachSlot } from "../lib/for-each-slot";

export async function mapSlots<T extends ComponentData | RootData>(
  item: T,
  map: (data: Content, propName: string) => Promise<Content>,
  recursive: boolean = true
): Promise<T> {
  const props: Record<string, any> = { ...item.props };

  await forEachSlot(item, async (_parentId, propName, content) => {
    const mappedContent = recursive
      ? await Promise.all(
          content.map(async (item) => {
            return await mapSlots(item, map, recursive);
          })
        )
      : content;

    props[propName] = await map(mappedContent, propName);
  });

  return { ...item, props };
}
