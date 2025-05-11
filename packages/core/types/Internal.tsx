import { Slot } from "./API";
import { AppState } from "./AppState";
import { BaseData, ComponentData, Content, Data } from "./Data";
import { DefaultComponentProps } from "./Props";

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

export type WithPopulatedSlots<
  Props extends DefaultComponentProps = DefaultComponentProps,
  SlotProps extends DefaultComponentProps = Props
> = Props extends any
  ? any
  : {
      [PropName in keyof Props]: Props[PropName] extends Slot<SlotProps>
        ? Content<SlotProps>
        : Props[PropName];
    };
