import getClassNameFactory from "../../../../lib/get-class-name-factory";
import styles from "../../styles.module.css";
import { Type } from "react-feather";
import type { InputProps } from "../..";

const getClassName = getClassNameFactory("Input", styles);

export const TextareaField = ({
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
          <Type size={16} />
        </div>
        {label || name}
      </div>
      <textarea
        className={getClassName("input")}
        autoComplete="off"
        name={name}
        value={typeof value === "undefined" ? "" : value}
        onChange={(e) => onChange(e.currentTarget.value)}
        readOnly={readOnly}
        rows={5}
      />
    </label>
  );
};
