import getClassNameFactory from "../../../../lib/get-class-name-factory";
import styles from "../../styles.module.css";
import type { InputProps } from "../..";
import { ExternalInput } from "../../../ExternalInput";
import { Link } from "react-feather";

const getClassName = getClassNameFactory("Input", styles);

export const ExternalField = ({
  field,
  onChange,
  value,
  name,
  label,
}: InputProps) => {
  if (field.type !== "external" || !field.adaptor) {
    return null;
  }

  return (
    <div className={getClassName()}>
      <div className={getClassName("label")}>
        <div className={getClassName("labelIcon")}>
          <Link size={16} />
        </div>

        {label || name}
      </div>
      <ExternalInput field={field} onChange={onChange} value={value} />
    </div>
  );
};
