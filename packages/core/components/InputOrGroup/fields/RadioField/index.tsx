import getClassNameFactory from "../../../../lib/get-class-name-factory";
import styles from "../../styles.module.css";
import { CheckCircle } from "react-feather";
import { FieldLabelInternal, type InputProps } from "../..";

const getClassName = getClassNameFactory("Input", styles);

export const RadioField = ({
  field,
  onChange,
  readOnly,
  value,
  name,
}: InputProps) => {
  if (field.type !== "radio" || !field.options) {
    return null;
  }

  return (
    <FieldLabelInternal
      icon={<CheckCircle size={16} />}
      label={field.label || name}
      readOnly={readOnly}
      el="div"
    >
      <div className={getClassName("radioGroupItems")}>
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
              defaultChecked={value === option.value}
            />
            <div className={getClassName("radioInner")}>
              {option.label || option.value}
            </div>
          </label>
        ))}
      </div>
    </FieldLabelInternal>
  );
};
