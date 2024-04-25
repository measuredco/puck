import getClassNameFactory from "../../../../lib/get-class-name-factory";
import styles from "./styles.module.css";
import { MoreVertical } from "lucide-react";
import type { FieldProps } from "../../../../types/Fields";
import { FieldLabelInternal, AutoField } from "../..";
import { useAppContext } from "../../../Puck/context";

const getClassName = getClassNameFactory("ObjectField", styles);

export const ObjectField = ({
  field,
  onChange,
  value,
  name,
  label,
  readOnly,
  id,
}: FieldProps) => {
  const { selectedItem } = useAppContext();

  if (field.type !== "object" || !field.objectFields) {
    return null;
  }

  const readOnlyFields = selectedItem?.readOnly || {};

  const data = value || {};

  return (
    <FieldLabelInternal
      label={label || name}
      icon={<MoreVertical size={16} />}
      el="div"
      readOnly={readOnly}
    >
      <div className={getClassName()}>
        <fieldset className={getClassName("fieldset")}>
          {Object.keys(field.objectFields!).map((fieldName) => {
            const subField = field.objectFields![fieldName];

            const subFieldName = `${name}.${fieldName}`;
            const wildcardFieldName = `${name}.${fieldName}`;

            return (
              <AutoField
                key={subFieldName}
                name={subFieldName}
                label={subField.label || fieldName}
                id={`${id}_${fieldName}`}
                readOnly={
                  typeof readOnlyFields[subFieldName] !== "undefined"
                    ? readOnlyFields[subFieldName]
                    : readOnlyFields[wildcardFieldName]
                }
                field={subField}
                value={data[fieldName]}
                onChange={(val, ui) => {
                  onChange(
                    {
                      ...data,
                      [fieldName]: val,
                    },
                    ui
                  );
                }}
              />
            );
          })}
        </fieldset>
      </div>
    </FieldLabelInternal>
  );
};
