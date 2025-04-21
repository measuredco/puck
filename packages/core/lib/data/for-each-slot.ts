import { ComponentData, Content, RootData } from "../../types";
import { isSlot as _isSlot } from "./is-slot";

export const forEachSlot = <T extends ComponentData | RootData>(
  item: T,
  cb: (
    parentId: string,
    slotId: string,
    content: Content
  ) => Promise<void> | void,
  recursive: boolean = false,
  isSlot: (type: string, propName: string, propValue: any) => boolean = _isSlot
) => {
  const props: Record<string, any> = item.props || {};

  const propKeys = Object.keys(props);

  for (let i = 0; i < propKeys.length; i++) {
    const propKey = propKeys[i];

    const itemType = "type" in item ? item.type : "root";

    if (isSlot(itemType, propKey, props[propKey])) {
      const content = props[propKey] as Content;

      cb(props.id, propKey, content);

      if (recursive) {
        content.forEach(async (childItem) =>
          forEachSlot(childItem, cb, true, isSlot)
        );
      }
    }
  }
};
