import getClassNameFactory from "../../lib/get-class-name-factory";
import { Field } from "../../types/Config";
import { ExternalInput } from "../ExternalInput";

import styles from "./styles.module.css";

const getClassName = getClassNameFactory("Input", styles);

export const InputOrGroup = ({
  name,
  field,
  value,
  onChange,
  readOnly,
}: {
  name: string;
  field: Field<any>;
  value: any;
  onChange: (value: any) => void;
  readOnly: boolean;
}) => {
  if (field.type === "group") {
    if (!field.items) {
      return null;
    }

    // Can't support groups until we have proper form system
    return <div>Groups not supported yet</div>;
  }

  if (field.type === "external") {
    if (!field.adaptor) {
      return null;
    }

    return (
      <div className={getClassName("")}>
        <div className={getClassName("label")}>
          {name === "_data" ? "External content" : name}
        </div>
        <ExternalInput field={field} onChange={onChange} value={value} />
      </div>
    );
  }

  if (field.type === "select") {
    if (!field.options) {
      return null;
    }

    return (
      <label className={getClassName()}>
        <div className={getClassName("label")}>{name}</div>
        <select onChange={(e) => onChange(e.currentTarget.value)} value={value}>
          {field.options.map((option) => (
            <option
              key={option.label + option.value}
              label={option.label}
              value={option.value}
            />
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className={getClassName({ readOnly })}>
      <div className={getClassName("label")}>{name}</div>
      <input
        autoComplete="off"
        type={field.type}
        name={name}
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        readOnly={readOnly}
      />
    </label>
  );
};
