import getClassNameFactory from "../../../../lib/get-class-name-factory";
import styles from "../../styles.module.css";
import type { InputProps } from "../..";
import { ExternalInput } from "../../../ExternalInput";

const getClassName = getClassNameFactory("Input", styles);

export const ExternalField = ({
  field,
  onChange,
  readOnly,
  value,
  name,
  label,
}: InputProps) => {
  if (!field.adaptor) {
    return null;
  }

  return (
    <div className={getClassName("")}>
      <div className={getClassName("label")}>
        {name === "_data" ? "External content" : label || name}
      </div>
      <ExternalInput field={field} onChange={onChange} value={value} />
    </div>
  );
};
