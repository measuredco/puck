import getClassNameFactory from "../../lib/get-class-name-factory";
import { Field, FieldProps } from "../../types/Fields";
import { UiState } from "../../types/Config";

import styles from "./styles.module.css";
import {
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  RadioField,
  SelectField,
  ExternalField,
  ArrayField,
  DefaultField,
  TextareaField,
} from "./fields";
import { Lock } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { ObjectField } from "./fields/ObjectField";
import { useAppContext } from "../Puck/context";
import { useSafeId } from "../../lib/use-safe-id";

const getClassName = getClassNameFactory("Input", styles);

export const FieldLabel = ({
  children,
  icon,
  label,
  el = "label",
  readOnly,
  className,
}: {
  children?: ReactNode;
  icon?: ReactNode;
  label: string;
  el?: "label" | "div";
  readOnly?: boolean;
  className?: string;
}) => {
  const El = el;
  return (
    <El className={className}>
      <div className={getClassName("label")}>
        {icon ? <div className={getClassName("labelIcon")}>{icon}</div> : <></>}
        {label}

        {readOnly && (
          <div className={getClassName("disabledIcon")} title="Read-only">
            <Lock size="12" />
          </div>
        )}
      </div>
      {children}
    </El>
  );
};

type FieldLabelPropsInternal = {
  children?: ReactNode;
  icon?: ReactNode;
  label?: string;
  el?: "label" | "div";
  readOnly?: boolean;
};

export const FieldLabelInternal = ({
  children,
  icon,
  label,
  el = "label",
  readOnly,
}: FieldLabelPropsInternal) => {
  const { overrides } = useAppContext();

  const Wrapper = useMemo(
    () => overrides.fieldLabel || FieldLabel,
    [overrides]
  );

  if (!label) {
    return <>{children}</>;
  }

  return (
    <Wrapper
      label={label}
      icon={icon}
      className={getClassName({ readOnly })}
      readOnly={readOnly}
      el={el}
    >
      {children}
    </Wrapper>
  );
};

type FieldPropsInternalOptional<ValueType = any, F = Field<any>> = FieldProps<
  ValueType,
  F
> & {
  Label?: React.FC<FieldLabelPropsInternal>;
  label?: string;
  name?: string;
};

export type FieldPropsInternal<ValueType = any, F = Field<any>> = FieldProps<
  ValueType,
  F
> & {
  Label: React.FC<FieldLabelPropsInternal>;
  label?: string;
  id: string;
  name?: string;
};

function AutoFieldInternal<
  ValueType = any,
  FieldType extends Field<ValueType> = Field<ValueType>
>(
  props: FieldPropsInternalOptional<ValueType, FieldType> & {
    Label?: React.FC<FieldLabelPropsInternal>;
  }
) {
  const { overrides } = useAppContext();

  const { field, label = field.label, id, Label = FieldLabelInternal } = props;

  const defaultId = useSafeId();
  const resolvedId = id || defaultId;

  const defaultFields = {
    array: ArrayField,
    external: ExternalField,
    object: ObjectField,
    select: SelectField,
    textarea: TextareaField,
    radio: RadioField,
    text: DefaultField,
    number: DefaultField,
  };

  const render = {
    ...overrides.fieldTypes,
    array: overrides.fieldTypes?.array || defaultFields.array,
    external: overrides.fieldTypes?.external || defaultFields.external,
    object: overrides.fieldTypes?.object || defaultFields.object,
    select: overrides.fieldTypes?.select || defaultFields.select,
    textarea: overrides.fieldTypes?.textarea || defaultFields.textarea,
    radio: overrides.fieldTypes?.radio || defaultFields.radio,
    text: overrides.fieldTypes?.text || defaultFields.text,
    number: overrides.fieldTypes?.number || defaultFields.number,
  };

  const mergedProps = {
    ...props,
    field,
    label,
    Label,
    id: resolvedId,
  };

  if (field.type === "custom") {
    if (!field.render) {
      return null;
    }

    const CustomField = field.render as any;

    return (
      <div className={getClassName()}>
        <CustomField {...mergedProps} />
      </div>
    );
  }

  const children = defaultFields[field.type](mergedProps);

  const Render = render[field.type] as (props: FieldProps) => ReactElement;

  return <Render {...mergedProps}>{children}</Render>;
}

export function AutoFieldPrivate<
  ValueType = any,
  FieldType extends Field<ValueType> = Field<ValueType>
>(
  props: FieldPropsInternalOptional<ValueType, FieldType> & {
    Label?: React.FC<FieldLabelPropsInternal>;
  }
) {
  const { value, onChange } = props;

  const [localValue, setLocalValue] = useState(value);

  const onChangeDb = useDebouncedCallback(
    (val, ui) => {
      onChange(val, ui);
    },
    50,
    { leading: true }
  );

  const onChangeLocal = useCallback((val: any, ui?: Partial<UiState>) => {
    setLocalValue(val);
    onChangeDb(val, ui);
  }, []);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const localProps = {
    value: localValue,
    onChange: onChangeLocal,
  };

  return <AutoFieldInternal<ValueType, FieldType> {...props} {...localProps} />;
}

const DefaultLabel = (props) => <div {...props} />;

export function AutoField<
  ValueType = any,
  FieldType extends Field<ValueType> = Field<ValueType>
>(props: FieldProps<ValueType, FieldType>) {
  return (
    <AutoFieldInternal<ValueType, FieldType> {...props} Label={DefaultLabel} />
  );
}
