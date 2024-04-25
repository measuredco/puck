import getClassNameFactory from "../../../../lib/get-class-name-factory";
import styles from "../../styles.module.css";
import { Type } from "lucide-react";
import { FieldLabelInternal } from "../..";
import type { FieldProps } from "../../../../types/Fields";

const getClassName = getClassNameFactory("Input", styles);

export const TextareaField = ({
  onChange,
  readOnly,
  value,
  name,
  label,
  id,
}: FieldProps) => {
  return (
    <FieldLabelInternal
      label={label || name}
      icon={<Type size={16} />}
      readOnly={readOnly}
    >
      <textarea
        id={id}
        className={getClassName("input")}
        autoComplete="off"
        name={name}
        value={typeof value === "undefined" ? "" : value}
        onChange={(e) => onChange(e.currentTarget.value)}
        readOnly={readOnly}
        tabIndex={readOnly ? -1 : undefined}
        rows={5}
      />
    </FieldLabelInternal>
  );
};