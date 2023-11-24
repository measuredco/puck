import getClassNameFactory from "../../../../lib/get-class-name-factory";
import styles from "./styles.module.css";
import { MoreVertical } from "react-feather";
import { FieldLabelInternal, InputOrGroup, type InputProps } from "../..";

const getClassName = getClassNameFactory("ObjectField", styles);
const getClassNameItem = getClassNameFactory("ObjectFieldItem", styles);

export const ObjectField = ({
  field,
  onChange,
  value,
  name,
  label,
  readOnly,
  readOnlyFields = {},
  id,
}: InputProps) => {
  if (field.type !== "object" || !field.objectFields) {
    return null;
  }

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
              <InputOrGroup
                key={subFieldName}
                name={subFieldName}
                label={subField.label || fieldName}
                id={`${id}_${fieldName}`}
                readOnly={
                  typeof readOnlyFields[subFieldName] !== "undefined"
                    ? readOnlyFields[subFieldName]
                    : readOnlyFields[wildcardFieldName]
                }
                readOnlyFields={readOnlyFields}
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
