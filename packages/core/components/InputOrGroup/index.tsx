import getClassNameFactory from "../../lib/get-class-name-factory";
import { Field, UiState } from "../../types/Config";

import styles from "./styles.module.css";
import {
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
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
import { Lock } from "react-feather";
import { useDebouncedCallback } from "use-debounce";
import { ObjectField } from "./fields/ObjectField";
import { useAppContext } from "../Puck/context";

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

export const FieldLabelInternal = ({
  children,
  icon,
  label,
  el = "label",
  readOnly,
}: {
  children?: ReactNode;
  icon?: ReactNode;
  label: string;
  el?: "label" | "div";
  readOnly?: boolean;
}) => {
  return (
    <FieldLabel
      label={label}
      icon={icon}
      className={getClassName({ readOnly })}
      readOnly={readOnly}
      el={el}
    >
      {children}
    </FieldLabel>
  );
};

export type InputProps<F = Field<any>> = {
  name: string;
  field: F;
  value: any;
  id: string;
  label?: string;
  onChange: (value: any, uiState?: Partial<UiState>) => void;
  readOnly?: boolean;
  readOnlyFields?: Record<string, boolean | undefined>;
};

export const InputOrGroup = ({ onChange, ...props }: InputProps) => {
  const { customUi } = useAppContext();

  const { name, field, value, readOnly } = props;

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

  if (field.type === "custom") {
    if (!field.render) {
      return null;
    }

    return (
      <div className={getClassName()}>
        {field.render({
          field,
          name,
          readOnly,
          ...localProps,
        })}
      </div>
    );
  }

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
    ...customUi.fields,
    array: customUi.fields?.array || defaultFields.array,
    external: customUi.fields?.external || defaultFields.external,
    object: customUi.fields?.object || defaultFields.object,
    select: customUi.fields?.select || defaultFields.select,
    textarea: customUi.fields?.textarea || defaultFields.textarea,
    radio: customUi.fields?.radio || defaultFields.radio,
    text: customUi.fields?.text || defaultFields.text,
    number: customUi.fields?.number || defaultFields.number,
  };

  const mergedProps = { ...props, ...localProps, field };

  const children = defaultFields[field.type](mergedProps);

  const Render = render[field.type] as (props: InputProps) => ReactElement;

  return <Render {...mergedProps}>{children}</Render>;
};
