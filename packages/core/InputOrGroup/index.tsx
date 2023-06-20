import getClassNameFactory from "../lib/get-class-name-factory";
import { Field } from "../types/Config";
import { ExternalInput } from "../ExternalInput";

import styles from "./styles.module.css";
import { replace } from "../lib";
import { Button } from "../Button";
import { Copy, Trash } from "react-feather";

const getClassName = getClassNameFactory("Input", styles);

export const InputOrGroup = ({
  name,
  field,
  value,
  label,
  onChange,
  readOnly,
}: {
  name: string;
  field: Field<any>;
  value: any;
  label?: string;
  onChange: (value: any) => void;
  readOnly?: boolean;
}) => {
  if (field.type === "group") {
    if (!field.groupFields) {
      return null;
    }

    return (
      <div className={getClassName()}>
        <b className={getClassName("label")}>{label || name}</b>
        <div className={getClassName("item")}>
          {Array.isArray(value) ? (
            value.map((item, i) => (
              <details key={`${name}_${i}`} className={getClassName("group")}>
                <summary>
                  {field.getItemSummary
                    ? field.getItemSummary(item, i)
                    : `Item #${i}`}

                  <button
                    className={getClassName("action")}
                    onClick={() => {
                      const existingValue = value || [];

                      existingValue.splice(i, 1);
                      onChange(existingValue);
                    }}
                  >
                    <Trash />
                  </button>
                </summary>
                <fieldset>
                  {Object.keys(field.groupFields!).map((fieldName) => {
                    const subField = field.groupFields![fieldName];

                    return (
                      <InputOrGroup
                        key={`${name}_${i}_${fieldName}`}
                        name={`${name}_${i}_${fieldName}`}
                        label={fieldName}
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
            Add item
          </button>
        </div>
      </div>
    );
  }

  if (field.type === "external") {
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
  }

  if (field.type === "select") {
    if (!field.options) {
      return null;
    }

    return (
      <label className={getClassName()}>
        <div className={getClassName("label")}>{label || name}</div>
        <select onChange={(e) => onChange(e.currentTarget.value)} value={value}>
          {field.options.map((option) => (
            <option
              key={option.label + option.value}
              label={option.label}
              value={option.value}
            />
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className={getClassName({ readOnly })}>
      <div className={getClassName("label")}>{label || name}</div>
      <input
        autoComplete="off"
        type={field.type}
        name={name}
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        readOnly={readOnly}
      />
    </label>
  );
};
