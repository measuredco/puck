import { ClipLoader } from "react-spinners";
import { rootDroppableId } from "../../../../lib/root-droppable-id";
import {
  ReplaceAction,
  SetAction,
  replaceAction,
  setAction,
} from "../../../../reducer";
import { Field, UiState } from "../../../../types/Config";
import { InputOrGroup } from "../../../InputOrGroup";
import { useAppContext } from "../../context";

import styles from "./styles.module.css";
import { getClassNameFactory } from "../../../../lib";
import { ReactNode, useMemo } from "react";
import { ItemSelector } from "../../../../lib/get-item";

const getClassName = getClassNameFactory("PuckFields", styles);

const defaultPageFields: Record<string, Field> = {
  title: { type: "text" },
};

const DefaultFields = ({
  children,
  isLoading,
}: {
  children: ReactNode;
  isLoading: boolean;
  itemSelector?: ItemSelector | null;
}) => {
  return (
    <div className={getClassName()}>
      {children}
      {isLoading && (
        <div className={getClassName("loadingOverlay")}>
          <ClipLoader aria-label="loading" />
        </div>
      )}
    </div>
  );
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

  const rootFields = config.root?.fields || defaultPageFields;

  const fields = selectedItem
    ? (config.components[selectedItem.type]?.fields as Record<
        string,
        Field<any>
      >) || {}
    : rootFields;

  const isLoading = selectedItem
    ? componentState[selectedItem?.props.id]?.loading
    : componentState["puck-root"]?.loading;

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

            return (
              <InputOrGroup
                key={`${selectedItem.props.id}_${fieldName}`}
                field={field}
                name={fieldName}
                id={`${selectedItem.props.id}_${fieldName}`}
                label={field.label}
                readOnly={readOnly[fieldName]}
                readOnlyFields={readOnly}
                value={selectedItem.props[fieldName]}
                onChange={onChange}
              />
            );
          } else {
            const { readOnly = {} } = data.root;

            return (
              <InputOrGroup
                key={`page_${fieldName}`}
                field={field}
                name={fieldName}
                id={`root_${fieldName}`}
                label={field.label}
                readOnly={readOnly[fieldName]}
                readOnlyFields={readOnly}
                value={rootProps[fieldName]}
                onChange={onChange}
              />
            );
          }
        })}
      </Wrapper>
    </form>
  );
};
