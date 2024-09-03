import { ItemSelector } from "../lib/get-item";
import { Viewport } from "./API";
import { Data } from "./Data";

export type ItemWithId = {
  _arrayId: string;
  _originalIndex: number;
};

export type ArrayState = { items: ItemWithId[]; openId: string };

export type UiState = {
  leftSideBarVisible: boolean;
  rightSideBarVisible: boolean;
  itemSelector: ItemSelector | null;
  arrayState: Record<string, ArrayState | undefined>;
  componentList: Record<
    string,
    {
      components?: string[];
      title?: string;
      visible?: boolean;
      expanded?: boolean;
    }
  >;
  isDragging: boolean;
  viewports: {
    current: {
      width: number;
      height: number | "auto";
    };
    controlsVisible: boolean;
    options: Viewport[];
  };
};

export type AppState<UserData extends Data = Data> = {
  data: UserData;
  ui: UiState;
};
