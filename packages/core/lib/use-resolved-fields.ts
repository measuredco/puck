import { ComponentData } from "../types";
import type { Fields as FieldsType } from "../types";
import { getAppStore, useAppStore } from "../components/Puck/context";
import { useCallback, useEffect, useState } from "react";
import { getChanged } from "../lib/get-changed";
import { useNodeStore } from "../stores/node-store";

type ComponentOrRootData = Omit<ComponentData<any>, "type">;

export const useResolvedFields = (): [FieldsType, boolean] => {
  const defaultFields = useAppStore(
    (s) => s.getComponentConfig()?.fields || {}
  );

  const id = useAppStore((s) => s.selectedItem?.props.id as string | undefined);

  const [lastResolvedData, setLastResolvedData] = useState<
    Partial<ComponentOrRootData>
  >({});
  const [resolvedFields, setResolvedFields] = useState(defaultFields);
  const [fieldsLoading, setFieldsLoading] = useState(false);

  const resolveFields = useCallback(
    async (reset?: boolean) => {
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
      let lastFields: FieldsType | null = resolvedFields;

      if (reset) {
        setResolvedFields(defaultFields);
        lastFields = defaultFields;
      }

      if (resolver) {
        setFieldsLoading(true);

        const lastData =
          lastResolvedData.props?.id === id ? lastResolvedData : null;

        const changed = getChanged(componentData, lastData);

        if (resolver) {
          const newFields = await resolver(componentData, {
            changed,
            fields: defaultFields,
            lastFields,
            lastData: lastData as ComponentOrRootData,
            appState: state,
            parent,
          });

          setLastResolvedData(componentData);
          setResolvedFields(newFields || {});
          setFieldsLoading(false);
        }
      } else {
        setResolvedFields(defaultFields);
      }
    },
    [id, resolvedFields]
  );

  useEffect(() => {
    resolveFields(true);

    return useNodeStore.subscribe(() => {
      resolveFields();
    });
  }, [id]);

  return [resolvedFields, fieldsLoading];
};
