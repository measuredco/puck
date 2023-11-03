import { useEffect, useState } from "react";
import { FieldLabelInternal, type InputProps } from "../..";
import {
  ExternalField as ExternalFieldType,
  ExternalFieldWithAdaptor,
} from "../../../../types/Config";
import { ExternalInput } from "../../../ExternalInput";
import { Link } from "react-feather";

export const ExternalField = ({
  field,
  onChange,
  value,
  name,
  label,
}: InputProps) => {
  // DEPRECATED
  const validField = field as ExternalFieldType;
  const deprecatedField = field as ExternalFieldWithAdaptor;

  useEffect(() => {
    if (deprecatedField.adaptor) {
      console.error(
        "Warning: The `adaptor` API is deprecated. Please use updated APIs on the `external` field instead. This will be a breaking change in a future release."
      );
    }
  }, []);

  if (field.type !== "external") {
    return null;
  }

  return (
    <FieldLabelInternal
      label={label || name}
      icon={<Link size={16} />}
      el="div"
    >
      <ExternalInput
        name={name}
        field={{
          ...validField,
          // DEPRECATED

          placeholder: deprecatedField.adaptor?.name
            ? `Select from ${deprecatedField.adaptor.name}`
            : validField.placeholder,
          mapProp: deprecatedField.adaptor?.mapProp || validField.mapProp,
          fetchList: deprecatedField.adaptor?.fetchList
            ? async () =>
                await deprecatedField.adaptor.fetchList(
                  deprecatedField.adaptorParams
                )
            : validField.fetchList,
        }}
        onChange={onChange}
        value={value}
      />
    </FieldLabelInternal>
  );
};
