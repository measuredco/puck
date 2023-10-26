import { FieldLabelInternal, type InputProps } from "../..";
import { ExternalInput } from "../../../ExternalInput";
import { Link } from "react-feather";

export const ExternalField = ({
  field,
  onChange,
  value,
  name,
  label,
}: InputProps) => {
  if (field.type !== "external" || !field.adaptor) {
    return null;
  }

  return (
    <FieldLabelInternal
      label={label || name}
      icon={<Link size={16} />}
      el="div"
    >
      <ExternalInput field={field} onChange={onChange} value={value} />
    </FieldLabelInternal>
  );
};
