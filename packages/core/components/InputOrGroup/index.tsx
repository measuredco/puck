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

const getClassName = getClassNameFactory("Input", styles);

export const FieldLabel = ({
  children,
  icon,
  label,
}: {
  children?: ReactNode;
  icon?: ReactNode;
  label: string;
}) => {
  return (
    <label>
      <div className={getClassName("label")}>
        {icon ? <div className={getClassName("labelIcon")}>{icon}</div> : <></>}
        {label}
      </div>
      {children}
    </label>
  );
};

export type InputProps = {
  name: string;
  field: Field<any>;
  value: any;
  label?: string;
  onChange: (value: any) => void;
  readOnly?: boolean;
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
