import { forEachSlot } from "./for-each-slot";
import { forRelatedZones } from "./for-related-zones";
import { rootDroppableId } from "../root-droppable-id";
import {
  ComponentData,
  Config,
  Content,
  Data,
  RootDataWithProps,
} from "../../types";
import {
  NodeIndex,
  PrivateAppState,
  ZoneIndex,
  ZoneType,
} from "../../types/Internal";
import { createIsSlotConfig } from "./is-slot";
import { stripSlots } from "./strip-slots";

/**
 * Walk the Puck state, generate indexes and make modifications to nodes.
 *
 * @param state The initial state
 * @param mapContent A callback to modify the content of a DropZone or slot. Called for all DropZones, slots and the root content.
 * @param mapNodeOrSkip A callback to modify a node. Called for every node in the tree. Returning a node will cause it to be reindexed. Conversely, returning `null` will skip indexing for that node.
 *
 * @returns The updated state
 */
export function walkTree<UserData extends Data = Data>(
  state: PrivateAppState<UserData>,
  config: Config,
  mapContent: (
    content: Content,
    zoneCompound: string,
    zoneType: ZoneType
  ) => Content | void = (content) => content,
  mapNodeOrSkip: (
    item: ComponentData,
    path: string[],
    index: number
  ) => ComponentData | null = (item) => item
): PrivateAppState<UserData> {
  let newZones: Record<string, Content> = {};
  const newZoneIndex: ZoneIndex = {};
  const newNodeIndex: NodeIndex = {};

  const processContent = (
    path: string[],
    zoneCompound: string,
    content: Content,
    zoneType: ZoneType,
    newId?: string
  ): [string, Content] => {
    const [parentId] = zoneCompound.split(":");
    const mappedContent =
      (mapContent(content, zoneCompound, zoneType) ?? content) || [];

    const [_, zone] = zoneCompound.split(":");
    const newZoneCompound = `${newId || parentId}:${zone}`;

    const newContent = mappedContent.map((zoneChild, index) =>
      processItem(zoneChild, [...path, newZoneCompound], index)
    );

    newZoneIndex[newZoneCompound] = {
      contentIds: newContent.map((item) => item.props.id),
      type: zoneType,
    };

    return [newZoneCompound, newContent];
  };

  const processRelatedZones = (
    item: ComponentData,
    newId: string,
    initialPath: string[]
  ) => {
    forRelatedZones(
      item,
      state.data,
      (relatedPath, relatedZoneCompound, relatedContent) => {
        const [zoneCompound, newContent] = processContent(
          relatedPath,
          relatedZoneCompound,
          relatedContent,
          "dropzone",
          newId
        );

        newZones[zoneCompound] = newContent;
      },
      initialPath
    );
  };

  const processItem = (
    item: ComponentData,
    path: string[],
    index: number
  ): ComponentData => {
    const mappedItem = mapNodeOrSkip(item, path, index);

    // Only modify the item if the user has returned it, enabling us to prevent unnecessary mapping and creating new references, which results in re-renders
    if (!mappedItem) return item;

    const id = mappedItem.props.id;

    const newProps: ComponentData["props"] = { ...mappedItem.props };

    forEachSlot(
      mappedItem,
      (parentId, slotId, content) => {
        const zoneCompound = `${parentId}:${slotId}`;

        const [_, newContent] = processContent(
          path,
          zoneCompound,
          content,
          "slot",
          parentId
        );

        newProps[slotId] = newContent;
      },
      false,
      createIsSlotConfig(config)
    );

    processRelatedZones(item, id, path);

    const newItem = { ...item, props: newProps };

    const thisZoneCompound = path[path.length - 1];
    const [parentId, zone] = thisZoneCompound
      ? thisZoneCompound.split(":")
      : [null, ""];

    newNodeIndex[id] = {
      data: newItem,
      flatData: stripSlots(newItem),
      path,
      parentId,
      zone,
    };

    // For now, we strip type and id from root. This may change in future.
    const finalData: any = { ...newItem, props: { ...newItem.props } };

    if (newProps.id === "root") {
      delete finalData["type"];
      delete finalData.props["id"];
    }

    return finalData;
  };

  const zones = state.data.zones || {};

  const [_, newContent] = processContent(
    [],
    rootDroppableId,
    state.data.content,
    "root"
  );

  const processedContent = newContent;

  const zonesAlreadyProcessed = Object.keys(newZones);

  Object.keys(zones || {}).forEach((zoneCompound) => {
    const [parentId] = zoneCompound.split(":");

    // Don't reprocess zones already processed as related zones
    if (zonesAlreadyProcessed.includes(zoneCompound)) {
      return;
    }

    const [_, newContent] = processContent(
      [rootDroppableId],
      zoneCompound,
      zones[zoneCompound],
      "dropzone",
      parentId
    );

    newZones[zoneCompound] = newContent;
  }, newZones);

  const processedRoot = processItem(
    {
      type: "root",
      props: { ...(state.data.root.props ?? state.data.root), id: "root" },
    },
    [],
    -1
  );

  const root = {
    ...state.data.root,
    props: processedRoot.props,
  } as RootDataWithProps;

  return {
    ...state,
    data: {
      root,
      content: processedContent,
      zones: {
        ...state.data.zones,
        ...newZones,
      },
    } as UserData,
    indexes: {
      nodes: { ...state.indexes.nodes, ...newNodeIndex },
      zones: { ...state.indexes.zones, ...newZoneIndex },
    },
  };
}
