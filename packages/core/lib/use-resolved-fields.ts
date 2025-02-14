import { ComponentData, RootData } from "../types";
import type { Field, Fields as FieldsType } from "../types";
import { getAppStore, useAppStore } from "../components/Puck/context";
import { useCallback, useEffect, useRef, useState } from "react";
import { ItemSelector } from "../lib/get-item";
import { getChanged } from "../lib/get-changed";
import { useParent } from "../lib/use-parent";
import { useOnValueChange } from "../lib/use-on-value-change";
import { selectorIs } from "../lib/selector-is";

const defaultPageFields: Record<string, Field> = {
  title: { type: "text" },
};

type ComponentOrRootData = Omit<ComponentData<any>, "type">;

export const useResolvedFields = ({
  _skipValueCheck,
  _skipIdCheck,
}: {
  _skipValueCheck?: boolean;
  _skipIdCheck?: boolean;
} = {}): [FieldsType, boolean] => {
  const componentConfig = useAppStore((s) =>
    s.selectedItem ? s.config.components[s.selectedItem.type] : null
  );
  const itemSelector = useAppStore((s) => s.state.ui.itemSelector);

  const parent = null; //useParent();

  // const { data } = state;

  const defaultFields = useAppStore((s) => {
    const rootFields = s.config.root?.fields || defaultPageFields;

    return (
      (s.selectedItem
        ? (componentConfig?.fields as Record<string, Field<any>>)
        : rootFields) || {}
    );
  });

  const id = useAppStore((s) => s.selectedItem?.props.id as string | undefined);

  const [lastSelectedData, setLastSelectedData] = useState<
    Partial<ComponentOrRootData>
  >({});
  const [resolvedFields, setResolvedFields] = useState({
    fields: defaultFields,
    id,
  });
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

  const hasComponentResolver = useAppStore(
    (s) => !!(s.selectedItem && componentConfig?.resolveFields)
  );
  const hasRootResolver = useAppStore(
    (s) => !!(!s.selectedItem && s.config.root?.resolveFields)
  );
  const hasResolver = hasComponentResolver || hasRootResolver;

  const resolveFields = useCallback(
    async (fields: FieldsType = {}) => {
      const { config, state, selectedItem } = getAppStore();
      const { data } = state;

      // DEPRECATED
      const rootProps = data.root.props || data.root;

      const componentData = selectedItem
        ? selectedItem
        : { props: rootProps, readOnly: data.root.readOnly || {} };

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
    [componentConfig, parent]
  );

  const triggerResolver = useCallback(() => {
    const selectedItem = getAppStore().selectedItem;

    // Must either be in default zone, or have parent
    if (
      !itemSelector?.zone ||
      itemSelector?.zone === "default-zone" ||
      parent
    ) {
      console.log("trigger resolver", itemSelector, hasResolver, defaultFields);
      if (hasResolver) {
        setFieldsLoading(true);

        resolveFields(defaultFields).then((fields) => {
          console.log("resolved", fields);

          setResolvedFields({
            fields: fields || {},
            id: selectedItem?.props.id,
          });

          lastFields.current = fields;

          setFieldsLoading(false);
        });

        return;
      }
    }
    setResolvedFields({ fields: defaultFields, id: selectedItem?.props.id });
  }, [defaultFields, itemSelector, hasResolver, parent, resolveFields]);

  useOnValueChange<ItemSelector | null>(
    itemSelector,
    () => {
      lastFields.current = defaultFields;
    },
    selectorIs
  );

  useOnValueChange(
    { parent, itemSelector },
    // { data, parent, itemSelector },
    () => {
      if (_skipValueCheck) return;

      triggerResolver();
    },
    (a, b) => JSON.stringify(a) === JSON.stringify(b)
  );

  useEffect(() => {
    triggerResolver();
  }, []);

  if (resolvedFields.id !== id && !_skipIdCheck) {
    return [defaultFields, fieldsLoading];
  }

  return [resolvedFields.fields, fieldsLoading];
};
