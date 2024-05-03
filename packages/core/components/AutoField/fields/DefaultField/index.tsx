import getClassNameFactory from "../../../../lib/get-class-name-factory";
import styles from "../../styles.module.css";
import { Hash, Type } from "lucide-react";
import { FieldPropsInternal } from "../..";

const getClassName = getClassNameFactory("Input", styles);

export const DefaultField = ({
  field,
  onChange,
  readOnly,
  value,
  name,
  label,
  Label,
  id,
}: FieldPropsInternal) => {
  return (
    <Label
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
        tabIndex={readOnly ? -1 : undefined}
        id={id}
        min={field.type === "number" ? field.min : undefined}
        max={field.type === "number" ? field.max : undefined}
      />
    </Label>
  );
};
