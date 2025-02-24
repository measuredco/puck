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
import { getAppStore, useAppStore } from "../../../../stores/app-store";

import styles from "./styles.module.css";
import { getClassNameFactory } from "../../../../lib";
import { ReactNode, useCallback, useMemo } from "react";
import { ItemSelector } from "../../../../lib/get-item";
import {
  useRegisterFieldStore,
  useFieldStore,
} from "../../../../stores/field-store";
import { useShallow } from "zustand/react/shallow";
import { usePermissionsStore } from "../../../../stores/permissions-store";

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

const createOnChange =
  (fieldName: string) => (value: any, updatedUi?: Partial<UiState>) => {
    let currentProps;

    const { dispatch, resolveData, config, state, selectedItem } =
      getAppStore();

    const { data, ui } = state;
    const { itemSelector } = ui;

    // DEPRECATED
    const rootProps = data.root.props || data.root;

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

const FieldsChild = ({ fieldName }: { fieldName: string }) => {
  const field = useFieldStore((s) => s.fields[fieldName]);
  const isReadOnly = useAppStore(
    (s) =>
      ((s.selectedItem
        ? s.selectedItem.readOnly
        : s.state.data.root.readOnly) || {})[fieldName]
  );

  const value = useAppStore((s) => {
    // DEPRECATED
    const rootProps = s.state.data.root.props || s.state.data.root;

    return s.selectedItem
      ? s.selectedItem.props[fieldName]
      : rootProps[fieldName];
  });

  const id = useAppStore((s) => {
    if (!field) return null;

    return s.selectedItem
      ? `${s.selectedItem.props.id}_${field.type}_${fieldName}`
      : `root_${field.type}_${fieldName}`;
  });

  const permissions = usePermissionsStore(
    useShallow((s) => {
      const { selectedItem } = getAppStore();

      return selectedItem
        ? s.getPermissions({ item: selectedItem })
        : s.getPermissions({ root: true });
    })
  );

  const onChange = useCallback(createOnChange(fieldName), [fieldName]);

  if (!field || !id) return null;

  return (
    <div key={id} className={getClassName("field")}>
      <AutoFieldPrivate
        field={field}
        name={fieldName}
        id={id}
        readOnly={!permissions.edit || isReadOnly}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export const Fields = ({ wrapFields = true }: { wrapFields?: boolean }) => {
  const overrides = useAppStore((s) => s.overrides);
  const componentResolving = useAppStore((s) => {
    const loadingCount = s.selectedItem
      ? s.componentState[s.selectedItem.props.id]?.loadingCount
      : s.componentState["puck-root"]?.loadingCount;

    return (loadingCount ?? 0) > 0;
  });
  const itemSelector = useAppStore(useShallow((s) => s.state.ui.itemSelector));

  useRegisterFieldStore();

  const fieldsLoading = useFieldStore((s) => s.loading);
  const fieldNames = useFieldStore(useShallow((s) => Object.keys(s.fields)));

  const isLoading = fieldsLoading || componentResolving;

  const Wrapper = useMemo(() => overrides.fields || DefaultFields, [overrides]);

  return (
    <form
      className={getClassName({ wrapFields })}
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <Wrapper isLoading={isLoading} itemSelector={itemSelector}>
        {fieldNames.map((fieldName) => (
          <FieldsChild key={fieldName} fieldName={fieldName} />
        ))}
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
