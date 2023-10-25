import getClassNameFactory from "../../../../lib/get-class-name-factory";
import styles from "../../styles.module.css";
import { ChevronDown } from "react-feather";
import type { InputProps } from "../..";

const getClassName = getClassNameFactory("Input", styles);

export const SelectField = ({
  field,
  onChange,
  label,
  value,
  name,
}: InputProps) => {
  if (field.type !== "select" || !field.options) {
    return null;
  }

  return (
    <label className={getClassName()}>
      <div className={getClassName("label")}>
        <div className={getClassName("labelIcon")}>
          <ChevronDown size={16} />
        </div>
        {label || name}
      </div>
      <select
        className={getClassName("input")}
        onChange={(e) => {
          if (
            e.currentTarget.value === "true" ||
            e.currentTarget.value === "false"
          ) {
            onChange(Boolean(e.currentTarget.value));
            return;
          }

          onChange(e.currentTarget.value);
        }}
        value={value}
      >
        {field.options.map((option) => (
          <option
            key={option.label + option.value}
            label={option.label}
            value={option.value as string | number}
          />
        ))}
      </select>
    </label>
  );
};
