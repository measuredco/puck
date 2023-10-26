import getClassNameFactory from "../../../../lib/get-class-name-factory";
import styles from "../../styles.module.css";
import { ChevronDown } from "react-feather";
import { FieldLabelInternal, type InputProps } from "../..";

const getClassName = getClassNameFactory("Input", styles);

export const SelectField = ({
  field,
  onChange,
  label,
  value,
  name,
  readOnly,
}: InputProps) => {
  if (field.type !== "select" || !field.options) {
    return null;
  }

  return (
    <FieldLabelInternal
      label={label || name}
      icon={<ChevronDown size={16} />}
      readOnly={readOnly}
    >
      <select
        className={getClassName("input")}
        disabled={readOnly}
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
    </FieldLabelInternal>
  );
};
