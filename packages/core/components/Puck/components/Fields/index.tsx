import { Loader } from "../../../Loader";
import { rootDroppableId } from "../../../../lib/root-droppable-id";
import { UiState } from "../../../../types";
import { AutoFieldPrivate } from "../../../AutoField";
import { AppStore, useAppStore, useAppStoreApi } from "../../../../store";

import styles from "./styles.module.css";
import { getClassNameFactory } from "../../../../lib";
import { ReactNode, useCallback, useMemo } from "react";
import { ItemSelector } from "../../../../lib/data/get-item";
import { useRegisterFieldsSlice } from "../../../../store/slices/fields";
import { useShallow } from "zustand/react/shallow";
import { StoreApi } from "zustand";

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
  (fieldName: string, appStore: StoreApi<AppStore>) =>
  async (value: any, updatedUi?: Partial<UiState>) => {
    let currentProps;

    const { dispatch, state, selectedItem, resolveComponentData } =
      appStore.getState();

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
      dispatch({
        type: "replace",
        destinationIndex: itemSelector.index,
        destinationZone: itemSelector.zone || rootDroppableId,
        data: (
          await resolveComponentData(
            { ...selectedItem, props: newProps },
            "replace"
          )
        ).node,
        ui: updatedUi,
      });
    } else {
      if (data.root.props) {
        dispatch({
          type: "replaceRoot",
          root: (
            await resolveComponentData(
              { ...data.root, props: newProps },
              "replace"
            )
          ).node,
          ui: { ...ui, ...updatedUi },
          recordHistory: true,
        });
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
  const field = useAppStore((s) => s.fields.fields[fieldName]);
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

  const permissions = useAppStore(
    useShallow((s) => {
      const { selectedItem, permissions } = s;

      return selectedItem
        ? permissions.getPermissions({ item: selectedItem })
        : permissions.getPermissions({ root: true });
    })
  );

  const appStore = useAppStoreApi();

  const onChange = useCallback(createOnChange(fieldName, appStore), [
    fieldName,
  ]);

  if (!field || !id) return null;

  if (field.type === "slot") return null;

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
      : s.componentState["root"]?.loadingCount;

    return (loadingCount ?? 0) > 0;
  });
  const itemSelector = useAppStore(useShallow((s) => s.state.ui.itemSelector));
  const id = useAppStore((s) => s.selectedItem?.props.id);
  const appStore = useAppStoreApi();
  useRegisterFieldsSlice(appStore, id);

  const fieldsLoading = useAppStore((s) => s.fields.loading);
  const fieldNames = useAppStore(
    useShallow((s) => Object.keys(s.fields.fields))
  );

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
