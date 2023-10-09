import getClassNameFactory from "../../../../lib/get-class-name-factory";
import styles from "../../styles.module.css";
import { List, Trash } from "react-feather";
import { InputOrGroup, type InputProps } from "../..";
import { IconButton } from "../../../IconButton";
import { replace } from "../../../../lib";

const getClassName = getClassNameFactory("Input", styles);

export const ArrayField = ({
  field,
  onChange,
  value,
  name,
  label,
}: InputProps) => {
  if (!field.arrayFields) {
    return null;
  }

  return (
    <div className={getClassName()}>
      <b className={getClassName("label")}>
        <div className={getClassName("labelIcon")}>
          <List size={16} />
        </div>
        {label || name}
      </b>
      <div className={getClassName("array")}>
        {Array.isArray(value) ? (
          value.map((item, i) => (
            <details key={`${name}_${i}`} className={getClassName("arrayItem")}>
              <summary>
                {field.getItemSummary
                  ? field.getItemSummary(item, i)
                  : `Item #${i}`}

                <div className={getClassName("arrayItemAction")}>
                  <IconButton
                    onClick={() => {
                      const existingValue = value || [];

                      existingValue.splice(i, 1);
                      onChange(existingValue);
                    }}
                    title="Delete"
                  >
                    <Trash size={21} />
                  </IconButton>
                </div>
              </summary>
              <fieldset className={getClassName("fieldset")}>
                {Object.keys(field.arrayFields!).map((fieldName) => {
                  const subField = field.arrayFields![fieldName];

                  return (
                    <InputOrGroup
                      key={`${name}_${i}_${fieldName}`}
                      name={`${name}_${i}_${fieldName}`}
                      label={subField.label || fieldName}
                      field={subField}
                      value={item[fieldName]}
                      onChange={(val) =>
                        onChange(
                          replace(value, i, { ...item, [fieldName]: val })
                        )
                      }
                    />
                  );
                })}
              </fieldset>
            </details>
          ))
        ) : (
          <div />
        )}

        <button
          className={getClassName("addButton")}
          onClick={() => {
            const existingValue = value || [];
            onChange([...existingValue, field.defaultItemProps || {}]);
          }}
        >
          + Add item
        </button>
      </div>
    </div>
  );
};
