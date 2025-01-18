import { ComponentData, RootData } from "../types";
import type { Field, Fields as FieldsType } from "../types";
import { useAppContext } from "../components/Puck/context";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ItemSelector } from "../lib/get-item";
import { getChanged } from "../lib/get-changed";
import { useParent } from "../lib/use-parent";
import { useOnValueChange } from "../lib/use-on-value-change";
import { selectorIs } from "../lib/selector-is";

const defaultPageFields: Record<string, Field> = {
  title: { type: "text" },
};

type ComponentOrRootData = Omit<ComponentData<any>, "type">;

export const useResolvedFields = (): [FieldsType, boolean] => {
  const { selectedItem, state, config } = useAppContext();
  const parent = useParent();

  const { data } = state;

  const rootFields = config.root?.fields || defaultPageFields;

  const componentConfig = selectedItem
    ? config.components[selectedItem.type]
    : null;

  const defaultFields = useMemo(
    () =>
      (selectedItem
        ? (componentConfig?.fields as Record<string, Field<any>>)
        : rootFields) || {},
    [selectedItem, rootFields, componentConfig?.fields]
  );

  // DEPRECATED
  const rootProps = data.root.props || data.root;

  const [lastSelectedData, setLastSelectedData] = useState<
    Partial<ComponentOrRootData>
  >({});
  const [resolvedFields, setResolvedFields] = useState(defaultFields);
  const [fieldsLoading, setFieldsLoading] = useState(false);
  const lastFields = useRef<FieldsType>(defaultFields);

  const defaultResolveFields = (
    _componentData: ComponentOrRootData,
    _params: {
      fields: FieldsType;
      lastData: Partial<ComponentOrRootData> | null;
      lastFields: FieldsType;
      changed: Record<string, boolean>;
    }
  ) => defaultFields;

  const componentData: ComponentOrRootData = selectedItem
    ? selectedItem
    : { props: rootProps, readOnly: data.root.readOnly };

  const hasComponentResolver = selectedItem && componentConfig?.resolveFields;
  const hasRootResolver = !selectedItem && config.root?.resolveFields;
  const hasResolver = hasComponentResolver || hasRootResolver;

  const resolveFields = useCallback(
    async (fields: FieldsType = {}) => {
      const lastData =
        lastSelectedData.props?.id === componentData.props.id
          ? lastSelectedData
          : null;

      const changed = getChanged(componentData, lastData);

      setLastSelectedData(componentData);

      if (hasComponentResolver) {
        return await componentConfig!.resolveFields!(
          componentData as ComponentData,
          {
            changed,
            fields,
            lastFields: lastFields.current,
            lastData: lastData as ComponentData,
            appState: state,
            parent,
          }
        );
      }

      if (hasRootResolver) {
        return await config.root!.resolveFields!(componentData, {
          changed,
          fields,
          lastFields: lastFields.current,
          lastData: lastData as RootData,
          appState: state,
          parent,
        });
      }

      return defaultResolveFields(componentData, {
        changed,
        fields,
        lastFields: lastFields.current,
        lastData,
      });
    },
    [data, config, componentData, selectedItem, state, parent]
  );

  const triggerResolver = useCallback(() => {
    // Must either be in default zone, or have parent
    if (
      !state.ui.itemSelector?.zone ||
      state.ui.itemSelector?.zone === "default-zone" ||
      parent
    ) {
      if (hasResolver) {
        setFieldsLoading(true);

        resolveFields(defaultFields).then((fields) => {
          setResolvedFields(fields || {});

          lastFields.current = fields;

          setFieldsLoading(false);
        });

        return;
      }
    }
    setResolvedFields(defaultFields);
  }, [defaultFields, state.ui.itemSelector, hasResolver, parent]);

  useOnValueChange<ItemSelector | null>(
    state.ui.itemSelector,
    () => {
      lastFields.current = defaultFields;
    },
    selectorIs
  );

  useOnValueChange(
    { data, parent, itemSelector: state.ui.itemSelector },
    () => {
      triggerResolver();
    },
    (a, b) => JSON.stringify(a) === JSON.stringify(b)
  );

  useEffect(() => {
    triggerResolver();
  }, []);

  return [resolvedFields, fieldsLoading];
};
