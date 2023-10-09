import getClassNameFactory from "../../../../lib/get-class-name-factory";
import styles from "../../styles.module.css";
import { Hash, Type } from "react-feather";
import type { InputProps } from "../..";

const getClassName = getClassNameFactory("Input", styles);

export const DefaultField = ({
  field,
  onChange,
  readOnly,
  value,
  name,
  label,
}: InputProps) => {
  return (
    <label className={getClassName({ readOnly })}>
      <div className={getClassName("label")}>
        <div className={getClassName("labelIcon")}>
          {field.type === "text" && <Type size={16} />}
          {field.type === "number" && <Hash size={16} />}
        </div>
        {label || name}
      </div>
      <input
        className={getClassName("input")}
        autoComplete="off"
        type={field.type}
        name={name}
        value={typeof value === "undefined" ? "" : value}
        onChange={(e) => {
          if (field.type === "number") {
            onChange(Number(e.currentTarget.value));
          } else {
            onChange(e.currentTarget.value);
          }
        }}
        readOnly={readOnly}
      />
    </label>
  );
};
