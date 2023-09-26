import type { Config, Data } from "../types/Config";
import { useReducer, useState } from "react";
import { StateReducer, createReducer, PuckAction } from "./reducer";
import { flushZones } from "./flush-zones";
import { useActionHistory } from "./use-action-history";
import { getItem, ItemSelector } from "./get-item";

export function usePuckData({
  config,
  initialData,
}: {
  config: Config;
  initialData: Data;
}) {
  const { canForward, canRewind, rewind, forward, record } = useActionHistory();
  const [reducer] = useState(() => createReducer({ config }));
  const [data, _dispatch] = useReducer<StateReducer>(
    reducer,
    flushZones(initialData)
  );
  const [itemSelector, setItemSelector] = useState<ItemSelector | null>(null);
  const selectedItem = itemSelector ? getItem(itemSelector, data) : null;

  const dispatch = (action: PuckAction) => {
    if (action.type === "insert") {
      const forward = () => _dispatch(action);
      const rewind = () =>
        _dispatch({
          type: "remove",
          index: action.destinationIndex,
          zone: action.destinationZone,
        });

      record({ forward, rewind });
      forward();
    } else if (action.type === "reorder") {
      const forward = () => _dispatch(action);
      const rewind = () =>
        _dispatch({
          type: "reorder",
          sourceIndex: action.destinationIndex,
          destinationIndex: action.sourceIndex,
          destinationZone: action.destinationZone,
        });

      record({ forward, rewind });
      forward();
    } else if (action.type === "move") {
      const forward = () => _dispatch(action);
      const rewind = () =>
        _dispatch({
          type: "move",
          sourceIndex: action.destinationIndex,
          sourceZone: action.destinationZone,
          destinationIndex: action.sourceIndex,
          destinationZone: action.destinationZone,
        });

      record({ forward, rewind });
      forward();
    } else if (action.type === "replace") {
      const currentProps = selectedItem?.props || data.root;
      const forward = () => _dispatch(action);
      const rewind = () =>
        _dispatch({
          ...action,
          data: { ...selectedItem, props: currentProps },
        });

      record({ forward, rewind });
      forward();
    } else if (action.type === "set") {
      const currentProps = selectedItem?.props || data.root;
      const forward = () => _dispatch(action);
      const rewind = () =>
        _dispatch({
          ...action,
          data: { root: currentProps as any },
        });

      record({ forward, rewind });
      forward();
    } else if (action.type === "duplicate") {
      const forward = () => _dispatch(action);
      const rewind = () => {
        _dispatch({
          type: "remove",
          index: action.sourceIndex,
          zone: action.sourceZone,
        });
        setItemSelector(null);
      };

      record({ forward, rewind });
      forward();
    } else if (action.type === "remove") {
      const currentItem = getItem(
        { index: action.index, zone: action.zone },
        data
      );
      const forward = () => _dispatch(action);
      const rewind = () => {
        _dispatch({
          type: "recovery",
          destinationIndex: action.index,
          destinationZone: action.zone,
          data: currentItem,
        });
        setItemSelector({
          zone: action.zone,
          index: action.index,
        });
      };

      record({ forward, rewind });
      forward();
    }
  };

  return {
    data,
    dispatch,
    canForward,
    canRewind,
    rewind,
    forward,
    record,
    itemSelector,
    setItemSelector,
    selectedItem,
  };
}
