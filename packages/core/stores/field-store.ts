import { ComponentData } from "../types";
import type { Fields as FieldsType } from "../types";
import { getAppStore, useAppStore } from "../stores/app-store";
import { useCallback, useEffect } from "react";
import { getChanged } from "../lib/get-changed";
import { useNodeStore } from "../stores/node-store";
import { create } from "zustand";

type ComponentOrRootData = Omit<ComponentData<any>, "type">;

export const useFieldStore = create<{
  fields: FieldsType | Partial<FieldsType>;
  loading: boolean;
  lastResolvedData: Partial<ComponentOrRootData>;
}>(() => ({
  fields: {},
  loading: false,
  lastResolvedData: {},
}));

export const useRegisterFieldStore = () => {
  const id = useAppStore((s) => s.selectedItem?.props.id as string | undefined);

  const resolveFields = useCallback(
    async (reset?: boolean) => {
      const { fields, lastResolvedData } = useFieldStore.getState();

      const nodeStore = useNodeStore.getState();
      const node = nodeStore.nodes[id || "root"];
      const componentData = node?.data;
      const parentNode = node?.parentId ? nodeStore.nodes[node.parentId] : null;
      const parent = parentNode?.data || null;

      const { getComponentConfig, state } = getAppStore();

      const componentConfig = getComponentConfig(componentData?.type);

      if (!componentData || !componentConfig) return;

      const defaultFields = componentConfig.fields || {};
      const resolver = componentConfig.resolveFields;
      let lastFields: FieldsType | null = fields as FieldsType;

      if (reset) {
        useFieldStore.setState({ fields: defaultFields });

        lastFields = defaultFields;
      }

      if (resolver) {
        const timeout = setTimeout(() => {
          useFieldStore.setState({ loading: true });
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
        if (getAppStore().selectedItem?.props.id !== id) {
          return;
        }

        useFieldStore.setState({
          fields: newFields,
          loading: false,
          lastResolvedData: componentData,
        });
      } else {
        useFieldStore.setState({ fields: defaultFields });
      }
    },
    [id]
  );

  useEffect(() => {
    resolveFields(true);

    return useNodeStore.subscribe(
      (s) => s.nodes[id || "root"],
      () => {
        resolveFields();
      }
    );
  }, [id]);
};
