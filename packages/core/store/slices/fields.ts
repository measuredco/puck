import { ComponentData } from "../../types";
import type { Fields } from "../../types";
import { AppStore, useAppStoreApi } from "../";
import { useCallback, useEffect } from "react";
import { getChanged } from "../../lib/get-changed";

type ComponentOrRootData = Omit<ComponentData<any>, "type">;

export type FieldsSlice = {
  fields: Fields | Partial<Fields>;
  loading: boolean;
  lastResolvedData: Partial<ComponentOrRootData>;
};

export const createFieldsStore = (
  _set: (newState: Partial<AppStore>) => void,
  _get: () => AppStore
): FieldsSlice => {
  return {
    fields: {},
    loading: false,
    lastResolvedData: {},
  };
};

export const useRegisterFieldsSlice = (
  appStore: ReturnType<typeof useAppStoreApi>,
  id?: string
) => {
  const resolveFields = useCallback(
    async (reset?: boolean) => {
      const { fields, lastResolvedData } = appStore.getState().fields;
      const nodeStore = appStore.getState().nodes;
      const node = nodeStore.nodes[id || "root"];
      const componentData = node?.data;
      const parentNode = node?.parentId ? nodeStore.nodes[node.parentId] : null;
      const parent = parentNode?.data || null;

      const { getComponentConfig, state } = appStore.getState();

      const componentConfig = getComponentConfig(componentData?.type);

      if (!componentData || !componentConfig) return;

      const defaultFields = componentConfig.fields || {};
      const resolver = componentConfig.resolveFields;
      let lastFields: Fields | null = fields as Fields;

      if (reset) {
        appStore.setState((s) => ({
          fields: { ...s.fields, fields: defaultFields },
        }));

        lastFields = defaultFields;
      }

      if (resolver) {
        const timeout = setTimeout(() => {
          appStore.setState((s) => ({
            fields: { ...s.fields, loading: true },
          }));
        }, 50);

        const lastData =
          lastResolvedData.props?.id === id ? lastResolvedData : null;

        const changed = getChanged(componentData, lastData);

        const newFields = await resolver(componentData, {
          changed,
          fields: defaultFields,
          lastFields,
          lastData: lastData as ComponentOrRootData,
          appState: state,
          parent,
        });

        clearTimeout(timeout);

        // Abort if item has changed during resolution (happens with history)
        if (appStore.getState().selectedItem?.props.id !== id) {
          return;
        }

        appStore.setState({
          fields: {
            fields: newFields,
            loading: false,
            lastResolvedData: componentData,
          },
        });
      } else {
        appStore.setState((s) => ({
          fields: { ...s.fields, fields: defaultFields },
        }));
      }
    },
    [id]
  );

  useEffect(() => {
    resolveFields(true);

    return appStore.subscribe(
      (s) => s.nodes.nodes[id || "root"],
      () => resolveFields()
    );
  }, [id]);
};
