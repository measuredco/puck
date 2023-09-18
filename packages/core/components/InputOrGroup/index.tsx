import getClassNameFactory from "../../lib/get-class-name-factory";
import { Field } from "../../types/Config";
import { ExternalInput } from "../ExternalInput";

import styles from "./styles.module.css";
import { replace } from "../../lib";
import {
  Trash,
  Type,
  List,
  ChevronDown,
  CheckCircle,
  Hash,
} from "react-feather";
import { IconButton } from "../IconButton";
import { ReactNode } from "react";

const getClassName = getClassNameFactory("Input", styles);

export const FieldLabel = ({
  children,
  icon,
  label,
}: {
  children?: ReactNode;
  icon?: ReactNode;
  label: string;
}) => {
  return (
    <label>
      <div className={getClassName("label")}>
        {icon && <div className={getClassName("labelIcon")}></div>}
        {label}
      </div>
      {children}
    </label>
  );
};

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
  if (field.type === "array") {
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
              <details
                key={`${name}_${i}`}
                className={getClassName("arrayItem")}
              >
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
        <div className={getClassName("label")}>
          <div className={getClassName("labelIcon")}>
            <ChevronDown size={16} />
          </div>
          {label || name}
        </div>
        <select
          className={getClassName("input")}
          onChange={(e) => {
            if (
              e.currentTarget.value === "true" ||
              e.currentTarget.value === "false"
            ) {
              onChange(Boolean(e.currentTarget.value));
              return;
            }

            onChange(e.currentTarget.value);
          }}
          value={value}
        >
          {field.options.map((option) => (
            <option
              key={option.label + option.value}
              label={option.label}
              value={option.value as string | number}
            />
          ))}
        </select>
      </label>
    );
  }

  if (field.type === "textarea") {
    return (
      <label className={getClassName({ readOnly })}>
        <div className={getClassName("label")}>
          <div className={getClassName("labelIcon")}>
            <Type size={16} />
          </div>
          {label || name}
        </div>
        <textarea
          className={getClassName("input")}
          autoComplete="off"
          name={name}
          value={typeof value === "undefined" ? "" : value}
          onChange={(e) => onChange(e.currentTarget.value)}
          readOnly={readOnly}
          rows={5}
        />
      </label>
    );
  }

  if (field.type === "radio") {
    if (!field.options) {
      return null;
    }

    return (
      <div className={getClassName()}>
        <div className={getClassName("radioGroup")}>
          <div className={getClassName("label")}>
            <div className={getClassName("labelIcon")}>
              <CheckCircle size={16} />
            </div>
            {field.label || name}
          </div>

          <div className={getClassName("radioGroupItems")}>
            {field.options.map((option) => (
              <label
                key={option.label + option.value}
                className={getClassName("radio")}
              >
                <input
                  type="radio"
                  className={getClassName("radioInput")}
                  value={option.value as string | number}
                  name={name}
                  onChange={(e) => {
                    if (
                      e.currentTarget.value === "true" ||
                      e.currentTarget.value === "false"
                    ) {
                      onChange(JSON.parse(e.currentTarget.value));
                      return;
                    }

                    onChange(e.currentTarget.value);
                  }}
                  readOnly={readOnly}
                  defaultChecked={value === option.value}
                />
                <div className={getClassName("radioInner")}>
                  {option.label || option.value}
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (field.type === "custom") {
    if (!field.render) {
      return null;
    }

    return (
      <div className={getClassName()}>
        {field.render({
          field,
          name,
          value,
          onChange,
          readOnly,
        })}
      </div>
    );
  }

  return (
    <label className={getClassName({ readOnly })}>
      <div className={getClassName("label")}>
        <div className={getClassName("labelIcon")}>
          {field.type === "text" && <Type size={16} />}
          {field.type === "number" && <Hash size={16} />}
        </div>
        {label || name}
      </div>
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
    </label>
  );
};
