import { Reducer } from "react";
import { Config, Content, Data } from "../types/Config";
import { reorder } from "./reorder";
import { rootDroppableId } from "./root-droppable-id";
import { insert } from "./insert";
import { remove } from "./remove";
import { setupDropzone } from "./setup-dropzone";
import { replace } from "./replace";
import { getItem } from "./get-item";
import {
  duplicateRelatedDropzones,
  removeRelatedDropzones,
} from "./reduce-related-dropzones";
import { generateId } from "./generate-id";

export type ActionType = "insert" | "reorder";

// Restore unregistered dropzones when re-registering in same session
export const dropzoneCache = {};

export const addToDropzoneCache = (key: string, data: Content) => {
  dropzoneCache[key] = data;
};

type InsertAction = {
  type: "insert";
  componentType: string;
  destinationIndex: number;
  destinationDropzone: string;
};

type DuplicateAction = {
  type: "duplicate";
  sourceIndex: number;
  sourceDropzone: string;
};

type ReplaceAction = {
  type: "replace";
  destinationIndex: number;
  destinationDropzone: string;
  data: any;
};

type ReorderAction = {
  type: "reorder";
  sourceIndex: number;
  destinationIndex: number;
  destinationDropzone: string;
};

type MoveAction = {
  type: "move";
  sourceIndex: number;
  sourceDropzone: string;
  destinationIndex: number;
  destinationDropzone: string;
};

type RemoveAction = {
  type: "remove";
  index: number;
  dropzone: string;
};

type SetDataAction = {
  type: "set";
  data: Partial<Data>;
};

type RegisterDropZoneAction = {
  type: "registerDropZone";
  dropzone: string;
};

type UnregisterDropZoneAction = {
  type: "unregisterDropZone";
  dropzone: string;
};

export type PuckAction =
  | ReorderAction
  | InsertAction
  | MoveAction
  | ReplaceAction
  | RemoveAction
  | DuplicateAction
  | SetDataAction
  | RegisterDropZoneAction
  | UnregisterDropZoneAction;

export type StateReducer = Reducer<Data, PuckAction>;

export const createReducer =
  ({ config }: { config: Config }): StateReducer =>
  (data, action) => {
    if (action.type === "insert") {
      const emptyComponentData = {
        type: action.componentType,
        props: {
          ...(config.components[action.componentType].defaultProps || {}),
          id: generateId(action.componentType),
        },
      };

      if (action.destinationDropzone === rootDroppableId) {
        return {
          ...data,
          content: insert(
            data.content,
            action.destinationIndex,
            emptyComponentData
          ),
        };
      }

      const newData = setupDropzone(data, action.destinationDropzone);

      return {
        ...data,
        dropzones: {
          ...newData.dropzones,
          [action.destinationDropzone]: insert(
            newData.dropzones[action.destinationDropzone],
            action.destinationIndex,
            emptyComponentData
          ),
        },
      };
    }

    if (action.type === "duplicate") {
      const item = getItem(
        { index: action.sourceIndex, dropzone: action.sourceDropzone },
        data
      )!;

      const newItem = {
        ...item,
        props: {
          ...item.props,
          id: generateId(item.type),
        },
      };

      const dataWithRelatedDuplicated = duplicateRelatedDropzones(
        item,
        data,
        newItem.props.id
      );

      if (action.sourceDropzone === rootDroppableId) {
        return {
          ...dataWithRelatedDuplicated,
          content: insert(data.content, action.sourceIndex + 1, newItem),
        };
      }

      return {
        ...dataWithRelatedDuplicated,
        dropzones: {
          ...dataWithRelatedDuplicated.dropzones,
          [action.sourceDropzone]: insert(
            dataWithRelatedDuplicated.dropzones[action.sourceDropzone],
            action.sourceIndex + 1,
            newItem
          ),
        },
      };
    }

    if (action.type === "reorder") {
      if (action.destinationDropzone === rootDroppableId) {
        return {
          ...data,
          content: reorder(
            data.content,
            action.sourceIndex,
            action.destinationIndex
          ),
        };
      }

      const newData = setupDropzone(data, action.destinationDropzone);

      return {
        ...data,
        dropzones: {
          ...newData.dropzones,
          [action.destinationDropzone]: reorder(
            newData.dropzones[action.destinationDropzone],
            action.sourceIndex,
            action.destinationIndex
          ),
        },
      };
    }

    if (action.type === "move") {
      const newData = setupDropzone(
        setupDropzone(data, action.sourceDropzone),
        action.destinationDropzone
      );

      const item = getItem(
        { dropzone: action.sourceDropzone, index: action.sourceIndex },
        newData
      );

      if (action.sourceDropzone === rootDroppableId) {
        return {
          ...newData,
          content: remove(newData.content, action.sourceIndex),
          dropzones: {
            ...newData.dropzones,

            [action.destinationDropzone]: insert(
              newData.dropzones[action.destinationDropzone],
              action.destinationIndex,
              item
            ),
          },
        };
      }

      if (action.destinationDropzone === rootDroppableId) {
        return {
          ...newData,
          content: insert(newData.content, action.destinationIndex, item),
          dropzones: {
            ...newData.dropzones,
            [action.sourceDropzone]: remove(
              newData.dropzones[action.sourceDropzone],
              action.sourceIndex
            ),
          },
        };
      }

      return {
        ...newData,
        dropzones: {
          ...newData.dropzones,
          [action.sourceDropzone]: remove(
            newData.dropzones[action.sourceDropzone],
            action.sourceIndex
          ),
          [action.destinationDropzone]: insert(
            newData.dropzones[action.destinationDropzone],
            action.destinationIndex,
            item
          ),
        },
      };
    }

    if (action.type === "replace") {
      if (action.destinationDropzone === rootDroppableId) {
        return {
          ...data,
          content: replace(data.content, action.destinationIndex, action.data),
        };
      }

      const newData = setupDropzone(data, action.destinationDropzone);

      return {
        ...newData,
        dropzones: {
          ...newData.dropzones,
          [action.destinationDropzone]: replace(
            newData.dropzones[action.destinationDropzone],
            action.destinationIndex,
            action.data
          ),
        },
      };
    }

    if (action.type === "remove") {
      const item = getItem(
        { index: action.index, dropzone: action.dropzone },
        data
      )!;

      // Remove any related dropzones
      const dataWithRelatedRemoved = setupDropzone(
        removeRelatedDropzones(item, data),
        action.dropzone
      );

      if (action.dropzone === rootDroppableId) {
        return {
          ...dataWithRelatedRemoved,
          content: remove(data.content, action.index),
        };
      }

      return {
        ...dataWithRelatedRemoved,
        dropzones: {
          ...dataWithRelatedRemoved.dropzones,
          [action.dropzone]: remove(
            dataWithRelatedRemoved.dropzones[action.dropzone],
            action.index
          ),
        },
      };
    }

    if (action.type === "registerDropZone") {
      if (dropzoneCache[action.dropzone]) {
        return {
          ...data,
          dropzones: {
            ...data.dropzones,
            [action.dropzone]: dropzoneCache[action.dropzone],
          },
        };
      }

      return setupDropzone(data, action.dropzone);
    }

    if (action.type === "unregisterDropZone") {
      const _dropzones = { ...(data.dropzones || {}) };

      if (_dropzones[action.dropzone]) {
        dropzoneCache[action.dropzone] = _dropzones[action.dropzone];

        delete _dropzones[action.dropzone];
      }

      return { ...data, dropzones: _dropzones };
    }

    if (action.type === "set") {
      return { ...data, ...action.data };
    }

    return data;
  };
