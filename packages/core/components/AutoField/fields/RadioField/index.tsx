import getClassNameFactory from "../../../../lib/get-class-name-factory";
import styles from "../../styles.module.css";
import { CheckCircle } from "lucide-react";
import { FieldPropsInternal } from "../..";

const getClassName = getClassNameFactory("Input", styles);

export const RadioField = ({
  field,
  onChange,
  readOnly,
  value,
  name,
  id,
  label,
  Label,
}: FieldPropsInternal) => {
  if (field.type !== "radio" || !field.options) {
    return null;
  }

  return (
    <Label
      icon={<CheckCircle size={16} />}
      label={label || name}
      readOnly={readOnly}
      el="div"
    >
      <div className={getClassName("radioGroupItems")} id={id}>
        {field.options.map((option) => (
          <label
            key={option.label + option.value}
            className={getClassName("radio")}
          >
            <input
              type="radio"
              className={getClassName("radioInput")}
              value={option.value as string | number}
              name={name}
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
              disabled={readOnly}
              checked={value === option.value}
            />
            <div className={getClassName("radioInner")}>
              {option.label || option.value}
            </div>
          </label>
        ))}
      </div>
    </Label>
  );
};
