import getClassNameFactory from "../../../../lib/get-class-name-factory";
import styles from "../../styles.module.css";
import { CheckCircle } from "lucide-react";
import { FieldPropsInternal } from "../..";
import { safeJsonParse } from "../../../../lib/safe-json-parse";

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
        {field.options.map((option, index) => (
          <label
            htmlFor={`${label}-${name}-${index}-${id}`}
            key={option.label + option.value}
            className={getClassName("radio")}
          >
            <input
              id={`${label}-${name}-${index}-${id}`}
              type="radio"
              className={getClassName("radioInput")}
              value={option.value as string | number}
<<<<<<< Updated upstream
              name={name}
              onChange={({ target: { value } }) =>
                onChange(safeJsonParse(value) || value)
              }
=======
              name={`${label}-${name}-${index}-${id}`}
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
>>>>>>> Stashed changes
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
