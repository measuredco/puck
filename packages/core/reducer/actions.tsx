import { AppState, Data, UiState } from "../types/Config";

export type InsertAction = {
  type: "insert";
  componentType: string;
  destinationIndex: number;
  destinationZone: string;
};

export type DuplicateAction = {
  type: "duplicate";
  sourceIndex: number;
  sourceZone: string;
};

export type ReplaceAction = {
  type: "replace";
  destinationIndex: number;
  destinationZone: string;
  data: any;
};

export type ReorderAction = {
  type: "reorder";
  sourceIndex: number;
  destinationIndex: number;
  destinationZone: string;
};

export type MoveAction = {
  type: "move";
  sourceIndex: number;
  sourceZone: string;
  destinationIndex: number;
  destinationZone: string;
};

export type RemoveAction = {
  type: "remove";
  index: number;
  zone: string;
};

export type SetUiAction = {
  type: "setUi";
  ui: Partial<UiState> | ((previous: UiState) => Partial<UiState>);
};

export type SetDataAction = {
  type: "setData";
  data: Partial<Data> | ((previous: Data) => Partial<Data>);
};

export type SetAction = {
  type: "set";
  state: Partial<AppState>;
};

export type RegisterZoneAction = {
  type: "registerZone";
  zone: string;
};

export type UnregisterZoneAction = {
  type: "unregisterZone";
  zone: string;
};

export type PuckAction = { recordHistory?: boolean } & (
  | ReorderAction
  | InsertAction
  | MoveAction
  | ReplaceAction
  | RemoveAction
  | DuplicateAction
  | SetAction
  | SetDataAction
  | SetUiAction
  | RegisterZoneAction
  | UnregisterZoneAction
);
