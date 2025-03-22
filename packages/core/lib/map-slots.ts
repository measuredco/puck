import { ComponentData, Content, RootData } from "../types";
import { forEachSlot } from "../lib/for-each-slot";

export function mapSlots<T extends ComponentData | RootData>(
  item: T,
  map: (data: Content, path: string[]) => Content,
  path: string[] = []
): T {
  const props: Record<string, any> = { ...item.props };

  forEachSlot(item, (_parentId, propName, content) => {
    const currentPath = [...path, `${_parentId}:${propName}`];

    props[propName] = map(
      content.map((item) => {
        return mapSlots(item, map as any, currentPath);
      }),
      currentPath
    );
  });

  return { ...item, props };
}
