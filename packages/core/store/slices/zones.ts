import { StoreApi } from "zustand";
import { Content, Data } from "../../types";
import deepEqual from "fast-deep-equal";
import { useEffect } from "react";
import { AppStore, useAppStoreApi } from "../";
import { rootDroppableId } from "../../lib/root-droppable-id";
import {
  flattenAllSlots,
  flattenSlots,
  forEachSlot,
} from "../../lib/flatten-slots";
import { dataMap } from "../../lib/data-map";

const partialDeepEqual = (
  newItem: Record<string, any>,
  existingItem: Record<string, any>
) => {
  const filteredExistingItem = Object.keys(newItem).reduce(
    (acc, key) => ({ ...acc, [key]: existingItem[key] }),
    {}
  );

  return deepEqual(newItem, filteredExistingItem);
};

export type ZoneType = "root" | "dropzone" | "slot";

type PuckZone = {
  zoneCompound: string;
  contentIds: string[];
  type: ZoneType;
};

export const generateZonesSlice = (data: Data, appStore: AppStore) => {
  const config = appStore.config;
  const zones = appStore.zones;

  // let zoneIndex: Record<string, Content> = {
  //   [rootDroppableId]: data.content,
  //   ...flattenSlots(config, data),
  //   ...data.zones,
  // };

  zones.registerZone(rootDroppableId, {
    zoneCompound: rootDroppableId,
    contentIds: data.content.map((item) => item.props.id),
    type: "root",
  });

  Object.entries(data.zones || {}).forEach(([zoneCompound, content]) => {
    zones.registerZone(zoneCompound, {
      contentIds: content.map((item) => item.props.id),
      type: "dropzone",
    });
  });

  const allSlots = flattenAllSlots(data);

  Object.entries(allSlots).forEach(([zoneCompound, content]) => {
    zones.registerZone(zoneCompound, {
      contentIds: content.map((item) => item.props.id),
      type: "slot",
    });
  });

  // Remove old slots
  // Object.keys(zones.zones).forEach((key) => {
  //   if (!zoneIndex[key] && key !== "root") {
  //     zones.unregisterZone(key);
  //   }
  // });
};

export type ZonesSlice = {
  zones: Record<string, PuckZone | undefined>;
  registerZone: (id: string, zone: Partial<PuckZone>) => void;
  unregisterZone: (id: string, zone?: Partial<PuckZone>) => void;
  regenerate: (data: Data) => void;
};

export const createZonesSlice = (
  set: (newState: Partial<AppStore>) => void,
  get: () => AppStore
): ZonesSlice => ({
  zones: {},
  regenerate: (data) => {
    generateZonesSlice(data, get());
  },
  registerZone: (zoneCompound, zone) => {
    const s = get().zones;

    // Only update zone if it changes
    if (
      s.zones[zoneCompound] &&
      partialDeepEqual(zone, s.zones[zoneCompound])
    ) {
      return;
    }

    const emptyZone: PuckZone = {
      zoneCompound: "",
      type: "root",
      contentIds: [],
    };

    const existingZone: PuckZone | undefined = s.zones[zoneCompound];

    set({
      zones: {
        ...s,
        zones: {
          ...s.zones,
          [zoneCompound]: {
            ...emptyZone,
            ...existingZone,
            ...zone,
            zoneCompound,
          },
        },
      },
    });
  },
  unregisterZone: (id) => {
    const s = get().zones;
    const existingZone: PuckZone | undefined = s.zones[id];

    if (existingZone) {
      const newZones = { ...s.zones };

      delete newZones[id];

      set({
        zones: {
          ...s,
          zones: newZones,
        },
      });
    }
  },
});

/**
 * Reindex the entire tree whenever the state changes
 */
export const useRegisterZonesSlice = (
  appStore: ReturnType<typeof useAppStoreApi>
) => {
  useEffect(() => {
    generateZonesSlice(appStore.getState().state.data, appStore.getState());

    return appStore.subscribe(
      (s) => s.state.data,
      (data) => generateZonesSlice(data, appStore.getState())
    );
  }, []);
};
