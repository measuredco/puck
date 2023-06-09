import getClassNameFactory from "../lib/get-class-name-factory";
import { Field } from "../types/Config";
import { ExternalInput } from "../ExternalInput";

import styles from "./styles.module.css";
import { replace } from "../lib";
import { Button } from "../Button";

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
    if (!field.itemFields) {
      return null;
    }

    return (
      <div className={getClassName()}>
        <b className={getClassName("label")}>{label || name}</b>
        {Array.isArray(value) ? (
          value.map((item, i) => (
            <fieldset className={getClassName("group")} key={`${name}_${i}`}>
              {Object.keys(field.itemFields!).map((fieldName) => {
                const subField = field.itemFields![fieldName];

                return (
                  <InputOrGroup
                    key={`${name}_${i}_${fieldName}`}
                    name={`${name}_${i}_${fieldName}`}
                    label={fieldName}
                    field={subField}
                    value={item[fieldName]}
                    onChange={(val) =>
                      onChange(replace(value, i, { ...item, [fieldName]: val }))
                    }
                  />
                );
              })}
              <div style={{ marginBottom: 16 }} />
              <Button
                onClick={() => {
                  const existingValue = value || [];

                  existingValue.splice(i, 1);
                  onChange(existingValue);
                }}
                fullWidth
                variant="secondary"
              >
                Remove item
              </Button>
            </fieldset>
          ))
        ) : (
          <div />
        )}

        <div style={{ marginBottom: 8 }} />

        <Button
          onClick={() => {
            const existingValue = value || [];
            onChange([...existingValue, {}]);
          }}
          fullWidth
          variant="secondary"
        >
          Add item
        </Button>
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
