import getClassNameFactory from "../../../../lib/get-class-name-factory";
import styles from "../../styles.module.css";
import { CheckSquare, ToggleLeft, ToggleRight } from "lucide-react";
import { FieldLabelInternal, type InputProps } from "../..";

const getClassName = getClassNameFactory("Input", styles);

export const CheckboxField = ({
  field,
  onChange,
  readOnly,
  value,
  name,
  id,
  label,
}: InputProps) => {
  if (field.type !== "checkbox") {
    return null;
  }

  return (
    <FieldLabelInternal
      icon={<CheckSquare size={16} />}
      label={label || name}
      readOnly={readOnly}
      el="div"
    >
      <div className={getClassName("checkboxGroupItems")} id={id}>
        <label
          className={getClassName("checkbox")}
        >
          <input
            type="checkbox"
            className={getClassName("checkboxInput")}
            name={name}
            onChange={(e) => {
              onChange(e.currentTarget.checked);
            }}
            disabled={readOnly}
            checked={value}
          />
          <div className={getClassName("checkboxInner")}>
            {value === true ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}<span>{field.checkboxLabel || label || name}</span>
          </div>
        </label>
      </div>
    </FieldLabelInternal>
  );
};
