import { ComponentData, Content, Data, RootData } from "../types";
import { isSlot } from "./flatten-slots";

function mapSlotsRecursive<T extends ComponentData<any, string> | RootData>(
  oldItem: T,
  index: number,
  mapFn: (data: T, index: number) => T
): T {
  if (!oldItem) return oldItem;

  // Apply the transform/map function at this level
  const newItem = mapFn(oldItem, index);

  // If no props, no children to process
  if (!newItem?.props) return newItem === oldItem ? oldItem : newItem;

  let changedProps = newItem.props !== oldItem.props;
  const nextProps: Record<string, any> = changedProps
    ? { ...newItem.props }
    : newItem.props;

  // Walk each prop that might be a slot
  for (const propKey of Object.keys(nextProps)) {
    const maybeSlot = nextProps[propKey];
    if (isSlot(maybeSlot)) {
      const oldSlot = oldItem.props?.[propKey] || [];
      const nextSlot = maybeSlot as Content;

      let childChanged = false;
      const updatedSlot = new Array(nextSlot.length);
      for (let i = 0; i < nextSlot.length; i++) {
        const oldChild = oldSlot[i];
        const newChild = mapSlotsRecursive(nextSlot[i] as any, i, mapFn);
        if (newChild !== oldChild) childChanged = true;
        updatedSlot[i] = newChild;
      }

      if (childChanged) {
        // Only make a new array if children changed
        if (!changedProps) {
          nextProps[propKey] = updatedSlot;
          changedProps = true;
        } else {
          nextProps[propKey] = updatedSlot;
        }
      }
    }
  }

  // If *nothing* changed at this level or below, reuse the old item
  if (!changedProps && newItem === oldItem) return oldItem;

  // Otherwise, return a new object (with nextProps if needed)
  if (changedProps || newItem !== oldItem) {
    return { ...newItem, props: nextProps };
  }
  return newItem;
}

/**
 * Public helper: map a single component (or root) with `mapFn`,
 * traversing all slots once, immutably.
 */
export function mapSlots<
  T extends ComponentData | RootData<Record<string, any>>
>(item: T, mapFn: (data: T, index: number) => T): T {
  return mapSlotsRecursive(item, -1, mapFn);
}

/**
 * Apply `mapFn` across the entire Data object (root, content, zones),
 * doing a single pass and returning new references only if needed.
 */
export function dataMap<UserData extends Data>(
  data: Partial<UserData>,
  mapFn: <T extends ComponentData | RootData<Record<string, any>>>(
    data: T,
    index: number
  ) => T
): UserData {
  if (!data) return data as UserData;

  let changed = false;
  const nextData = { ...data } as UserData;

  // Optional root slot
  // if (data.root) {
  //   const newRoot = mapSlotsRecursive(data.root, -1, "root", mapFn);
  //   if (newRoot !== data.root) {
  //     nextData.root = newRoot;
  //     changed = true;
  //   }
  // }

  // Content
  if (data.content) {
    const oldContent = data.content;
    const newContent = new Array(oldContent.length);
    let contentChanged = false;
    for (let i = 0; i < oldContent.length; i++) {
      const newItem = mapSlotsRecursive(oldContent[i], i, mapFn);
      if (newItem !== oldContent[i]) contentChanged = true;
      newContent[i] = newItem;
    }
    if (contentChanged) {
      nextData.content = newContent;
      changed = true;
    }
  }

  // Zones
  if (data.zones) {
    const oldZones = data.zones;
    const newZones = { ...oldZones };
    let zonesChanged = false;
    for (const zoneId of Object.keys(oldZones)) {
      const items = oldZones[zoneId];
      if (!items) continue;

      let zoneChanged = false;
      const newZoneItems = new Array(items.length);
      for (let i = 0; i < items.length; i++) {
        const newItem = mapSlotsRecursive(items[i], i, mapFn);
        if (newItem !== items[i]) zoneChanged = true;
        newZoneItems[i] = newItem;
      }
      if (zoneChanged) {
        newZones[zoneId] = newZoneItems;
        zonesChanged = true;
      }
    }
    if (zonesChanged) {
      nextData.zones = newZones;
      changed = true;
    }
  }

  return changed ? nextData : (data as UserData);
}
