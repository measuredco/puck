import getClassNameFactory from "../../../../lib/get-class-name-factory";
import styles from "../../styles.module.css";
import { ChevronDown } from "lucide-react";
import { FieldPropsInternal } from "../..";

const getClassName = getClassNameFactory("Input", styles);

export const SelectField = ({
  field,
  onChange,
  label,
  Label,
  value,
  name,
  readOnly,
  id,
}: FieldPropsInternal) => {
  if (field.type !== "select" || !field.options) {
    return null;
  }

  return (
    <Label
      label={label || name}
      icon={<ChevronDown size={16} />}
      readOnly={readOnly}
    >
      <select
        id={id}
        className={getClassName("input")}
        disabled={readOnly}
        onChange={(e) => {
          if (
            e.currentTarget.value === "true" ||
            e.currentTarget.value === "false"
          ) {
            onChange(JSON.parse(e.currentTarget.value));
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
    </Label>
  );
};
