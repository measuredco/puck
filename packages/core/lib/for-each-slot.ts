import { ComponentData, Config, Content, RootData } from "../types";
import { isSlot } from "./is-slot";

export const forEachSlot = <T extends ComponentData | RootData>(
  item: T,
  cb: (parentId: string, slotId: string, content: Content) => void,
  recursive: boolean = false
) => {
  const props: Record<string, any> = item.props || {};

  const propKeys = Object.keys(props);

  for (let i = 0; i < propKeys.length; i++) {
    const propKey = propKeys[i];

    if (isSlot(props[propKey])) {
      const content = props[propKey] as Content;

      cb(props.id, propKey, content);

      if (recursive) {
        content.forEach((childItem) => forEachSlot(childItem, cb, true));
      }
    }
  }
};
