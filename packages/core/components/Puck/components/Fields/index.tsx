import { Loader } from "../../../Loader";
import { rootDroppableId } from "../../../../lib/root-droppable-id";
import {
  ReplaceAction,
  SetAction,
  replaceAction,
  setAction,
} from "../../../../reducer";
import { UiState } from "../../../../types";
import { AutoFieldPrivate } from "../../../AutoField";
import { useAppContext } from "../../context";

import styles from "./styles.module.css";
import { getClassNameFactory } from "../../../../lib";
import { ReactNode, useMemo } from "react";
import { ItemSelector } from "../../../../lib/get-item";
import { useResolvedFields } from "../../../../lib/use-resolved-fields";

const getClassName = getClassNameFactory("PuckFields", styles);

const DefaultFields = ({
  children,
}: {
  children: ReactNode;
  isLoading: boolean;
  itemSelector?: ItemSelector | null;
}) => {
  return <>{children}</>;
};

export const Fields = ({ wrapFields = true }: { wrapFields?: boolean }) => {
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
      className={getClassName({ wrapFields })}
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

            if (selectedItem && itemSelector) {
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
              if (config.components[selectedItem.type]?.resolveData) {
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

            const id = `${selectedItem.props.id}_${field.type}_${fieldName}`;

            return (
              <div key={id} className={getClassName("field")}>
                <AutoFieldPrivate
                  field={field}
                  name={fieldName}
                  id={id}
                  readOnly={!edit || readOnly[fieldName]}
                  value={selectedItem.props[fieldName]}
                  onChange={onChange}
                />
              </div>
            );
          } else {
            const readOnly = (data.root.readOnly || {}) as Record<
              string,
              boolean
            >;
            const { edit } = getPermissions({
              root: true,
            });

            const id = `root_${field.type}_${fieldName}`;

            return (
              <div key={id} className={getClassName("field")}>
                <AutoFieldPrivate
                  field={field}
                  name={fieldName}
                  id={id}
                  readOnly={!edit || readOnly[fieldName]}
                  value={(rootProps as Record<string, any>)[fieldName]}
                  onChange={onChange}
                />
              </div>
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
