import getClassNameFactory from "../../../../lib/get-class-name-factory";
import styles from "../../styles.module.css";
import { Hash, Type } from "react-feather";
import { FieldLabelInternal, type InputProps } from "../..";

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
    <FieldLabelInternal
      label={label || name}
      icon={
        <>
          {field.type === "text" && <Type size={16} />}
          {field.type === "number" && <Hash size={16} />}
        </>
      }
      readOnly={readOnly}
    >
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
    </FieldLabelInternal>
  );
};
