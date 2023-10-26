import getClassNameFactory from "../../lib/get-class-name-factory";
import { Field } from "../../types/Config";

import styles from "./styles.module.css";
import { ReactNode } from "react";
import {
  RadioField,
  SelectField,
  ExternalField,
  ArrayField,
  DefaultField,
  TextareaField,
} from "./fields";
import { Lock } from "react-feather";

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
  const El = el;
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

export type InputProps = {
  name: string;
  field: Field<any>;
  value: any;
  label?: string;
  onChange: (value: any) => void;
  readOnly?: boolean;
  readOnlyFields?: Record<string, boolean | undefined>;
};

export const InputOrGroup = (props: InputProps) => {
  const { name, field, value, onChange, readOnly } = props;

  if (field.type === "array") {
    return <ArrayField {...props} />;
  }

  if (field.type === "external") {
    return <ExternalField {...props} />;
  }

  if (field.type === "select") {
    return <SelectField {...props} />;
  }

  if (field.type === "textarea") {
    return <TextareaField {...props} />;
  }

  if (field.type === "radio") {
    return <RadioField {...props} />;
  }

  if (field.type === "custom") {
    if (!field.render) {
      return null;
    }

    return (
      <div className={getClassName()}>
        {field.render({
          field,
          name,
          value,
          onChange,
          readOnly,
        })}
      </div>
    );
  }

  return <DefaultField {...props} />;
};
