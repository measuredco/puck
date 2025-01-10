import getClassNameFactory from "../../../../lib/get-class-name-factory";
import styles from "./styles.module.css";
import { MoreVertical } from "lucide-react";
import {
  AutoFieldPrivate,
  FieldLabelInternal,
  FieldPropsInternal,
} from "../..";
import { useAppContext } from "../../../Puck/context";

const getClassName = getClassNameFactory("ObjectField", styles);

export const ObjectField = ({
  field,
  onChange,
  value,
  name,
  label,
  Label,
  readOnly,
  id,
}: FieldPropsInternal) => {
  const { selectedItem } = useAppContext();

  if (field.type !== "object" || !field.objectFields) {
    return null;
  }

  const readOnlyFields = selectedItem?.readOnly || {};

  const data = value || {};

  return (
    <Label
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

            const subReadOnly = readOnly
              ? readOnly
              : typeof readOnlyFields[subFieldName] !== "undefined"
              ? readOnlyFields[subFieldName]
              : readOnlyFields[wildcardFieldName];

            const label = subField.label || fieldName;

            return (
              <AutoFieldPrivate
                key={subFieldName}
                name={subFieldName}
                label={label}
                id={`${id}_${fieldName}`}
                readOnly={subReadOnly}
                field={{
                  ...subField,
                  label, // May be used by custom fields
                }}
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
    </Label>
  );
};
