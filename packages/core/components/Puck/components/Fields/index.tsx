import { Loader } from "../../../Loader";
import { rootDroppableId } from "../../../../lib/root-droppable-id";
import {
  ReplaceAction,
  SetAction,
  replaceAction,
  setAction,
} from "../../../../reducer";
import { ComponentData, RootData, UiState } from "../../../../types";
import type { Field, Fields as FieldsType } from "../../../../types";
import { AutoFieldPrivate } from "../../../AutoField";
import { useAppContext } from "../../context";

import styles from "./styles.module.css";
import { getClassNameFactory } from "../../../../lib";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { ItemSelector } from "../../../../lib/get-item";
import { getChanged } from "../../../../lib/get-changed";

const getClassName = getClassNameFactory("PuckFields", styles);

const defaultPageFields: Record<string, Field> = {
  title: { type: "text" },
};

const DefaultFields = ({
  children,
}: {
  children: ReactNode;
  isLoading: boolean;
  itemSelector?: ItemSelector | null;
}) => {
  return <>{children}</>;
};

type ComponentOrRootData = Omit<ComponentData<any>, "type">;

const useResolvedFields = (): [FieldsType, boolean] => {
  const { selectedItem, state, config } = useAppContext();

  const { data } = state;

  const rootFields = config.root?.fields || defaultPageFields;

  const componentConfig = selectedItem
    ? config.components[selectedItem.type]
    : null;

  const defaultFields = selectedItem
    ? (componentConfig?.fields as Record<string, Field<any>>)
    : rootFields;

  // DEPRECATED
  const rootProps = data.root.props || data.root;

  const [lastSelectedData, setLastSelectedData] = useState<
    Partial<ComponentOrRootData>
  >({});
  const [resolvedFields, setResolvedFields] = useState(defaultFields || {});
  const [fieldsLoading, setFieldsLoading] = useState(false);

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
            lastFields: resolvedFields,
            lastData: lastData as ComponentData,
            appState: state,
          }
        );
      }

      if (hasRootResolver) {
        return await config.root!.resolveFields!(componentData, {
          changed,
          fields,
          lastFields: resolvedFields,
          lastData: lastData as RootData,
          appState: state,
        });
      }

      return defaultResolveFields(componentData, {
        changed,
        fields,
        lastFields: resolvedFields,
        lastData,
      });
    },
    [data, config, componentData, selectedItem, resolvedFields, state]
  );

  useEffect(() => {
    if (hasResolver) {
      setFieldsLoading(true);

      resolveFields(defaultFields).then((fields) => {
        setResolvedFields(fields || {});

        setFieldsLoading(false);
      });
    } else {
      setResolvedFields(defaultFields);
    }
  }, [data, defaultFields, state.ui.itemSelector, hasResolver]);

  return [resolvedFields, fieldsLoading];
};

export const Fields = () => {
  const {
    selectedItem,
    state,
    dispatch,
    config,
    resolveData,
    componentState,
    overrides,
  } = useAppContext();
  const { data, ui } = state;
  const { itemSelector } = ui;

  const [fields, fieldsResolving] = useResolvedFields();

  const { getPermissions } = useAppContext();

  const componentResolving = selectedItem
    ? componentState[selectedItem?.props.id]?.loadingCount > 0
    : componentState["puck-root"]?.loadingCount > 0;

  const isLoading = fieldsResolving || componentResolving;

  // DEPRECATED
  const rootProps = data.root.props || data.root;

  const Wrapper = useMemo(() => overrides.fields || DefaultFields, [overrides]);

  return (
    <form
      className={getClassName()}
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <Wrapper isLoading={isLoading} itemSelector={itemSelector}>
        {Object.keys(fields).map((fieldName) => {
          const field = fields[fieldName];

          if (!field?.type) return null;

          const onChange = (value: any, updatedUi?: Partial<UiState>) => {
            let currentProps;

            if (selectedItem) {
              currentProps = selectedItem.props;
            } else {
              currentProps = rootProps;
            }

            const newProps = {
              ...currentProps,
              [fieldName]: value,
            };

            if (itemSelector) {
              const replaceActionData: ReplaceAction = {
                type: "replace",
                destinationIndex: itemSelector.index,
                destinationZone: itemSelector.zone || rootDroppableId,
                data: { ...selectedItem, props: newProps },
              };

              // We use `replace` action, then feed into `set` action so we can also process any UI changes
              const replacedData = replaceAction(data, replaceActionData);

              const setActionData: SetAction = {
                type: "set",
                state: {
                  data: { ...data, ...replacedData },
                  ui: { ...ui, ...updatedUi },
                },
              };

              // If the component has a resolveData method, we let resolveData run and handle the dispatch once it's done
              if (config.components[selectedItem!.type]?.resolveData) {
                resolveData(setAction(state, setActionData));
              } else {
                dispatch({
                  ...setActionData,
                  recordHistory: true,
                });
              }
            } else {
              if (data.root.props) {
                // If the component has a resolveData method, we let resolveData run and handle the dispatch once it's done
                if (config.root?.resolveData) {
                  resolveData({
                    ui: { ...ui, ...updatedUi },
                    data: {
                      ...data,
                      root: { props: newProps },
                    },
                  });
                } else {
                  dispatch({
                    type: "set",
                    state: {
                      ui: { ...ui, ...updatedUi },
                      data: {
                        ...data,
                        root: { props: newProps },
                      },
                    },
                    recordHistory: true,
                  });
                }
              } else {
                // DEPRECATED
                dispatch({
                  type: "setData",
                  data: { root: newProps },
                });
              }
            }
          };

          if (selectedItem && itemSelector) {
            const { readOnly = {} } = selectedItem;
            const { edit } = getPermissions({
              item: selectedItem,
            });

            return (
              <AutoFieldPrivate
                key={`${selectedItem.props.id}_${fieldName}`}
                field={field}
                name={fieldName}
                id={`${selectedItem.props.id}_${fieldName}`}
                readOnly={!edit || readOnly[fieldName]}
                value={selectedItem.props[fieldName]}
                onChange={onChange}
              />
            );
          } else {
            const readOnly = (data.root.readOnly || {}) as Record<
              string,
              boolean
            >;
            const { edit } = getPermissions({
              root: true,
            });

            return (
              <AutoFieldPrivate
                key={`page_${fieldName}`}
                field={field}
                name={fieldName}
                id={`root_${fieldName}`}
                readOnly={!edit || readOnly[fieldName]}
                value={(rootProps as Record<string, any>)[fieldName]}
                onChange={onChange}
              />
            );
          }
        })}
      </Wrapper>
      {isLoading && (
        <div className={getClassName("loadingOverlay")}>
          <div className={getClassName("loadingOverlayInner")}>
            <Loader size={16} />
          </div>
        </div>
      )}
    </form>
  );
};
