import {
  ComponentData,
  Config,
  Content,
  RootData,
  UserGenerics,
} from "../../types";
import { mapSlotsSync } from "./map-slots";

type WalkTreeOptions = {
  parentId: string;
  propName: string;
};

export function walkTree<
  T extends ComponentData | RootData | G["UserData"],
  UserConfig extends Config = Config,
  G extends UserGenerics<UserConfig> = UserGenerics<UserConfig>
>(
  data: T,
  config: UserConfig,
  callbackFn: (data: Content, options: WalkTreeOptions) => Content | null | void
): T {
  const walkItem = (item: ComponentData | RootData) => {
    return mapSlotsSync(
      item,
      (content, parentId, propName) => {
        return callbackFn(content, { parentId, propName }) ?? content;
      },
      config
    );
  };

  if ("props" in data) {
    return walkItem(data) as T;
  }

  const _data = data as G["UserData"];
  const zones = _data.zones ?? {};

  const mappedContent = _data.content.map(walkItem) as ComponentData[];

  return {
    root: walkItem(_data.root),
    content:
      callbackFn(mappedContent, {
        parentId: "root",
        propName: "default-zone",
      }) ?? mappedContent,
    zones: Object.keys(zones).reduce(
      (acc, zoneCompound) => ({
        ...acc,
        [zoneCompound]: zones[zoneCompound].map(walkItem),
      }),
      {}
    ),
  } as T;
}
