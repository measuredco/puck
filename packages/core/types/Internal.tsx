import { AppState } from "./AppState";
import { ComponentData, Data } from "./Data";

export type ZoneType = "root" | "dropzone" | "slot";

export type PuckNodeData = {
  data: ComponentData;
  flatData: ComponentData;
  parentId: string | null;
  zone: string;
  path: string[];
};

export type PuckZoneData = {
  contentIds: string[];
  type: ZoneType;
};

export type NodeIndex = Record<string, PuckNodeData>;
export type ZoneIndex = Record<string, PuckZoneData>;

export type PrivateAppState<UserData extends Data = Data> =
  AppState<UserData> & {
    indexes: {
      nodes: NodeIndex;
      zones: ZoneIndex;
    };
  };
