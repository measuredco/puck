import { ReactElement } from "react";
import { DefaultComponentProps, UiState } from ".";

type FieldOption = {
  label: string;
  value: string | number | boolean;
};

type FieldOptions = Array<FieldOption> | ReadonlyArray<FieldOption>;

export type BaseField = {
  label?: string;
};

export type TextField = BaseField & {
  type: "text";
  placeholder?: string;
};
export type NumberField = BaseField & {
  type: "number";
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
};

export type TextareaField = BaseField & {
  type: "textarea";
  placeholder?: string;
};

export type SelectField = BaseField & {
  type: "select";
  options: FieldOptions;
};

export type RadioField = BaseField & {
  type: "radio";
  options: FieldOptions;
};

export type ArrayField<
  Props extends { [key: string]: any } = { [key: string]: any }
> = BaseField & {
  type: "array";
  arrayFields: {
    [SubPropName in keyof Props[0]]: Field<Props[0][SubPropName]>;
  };
  defaultItemProps?: Props[0];
  getItemSummary?: (item: Props[0], index?: number) => string;
  max?: number;
  min?: number;
};

export type ObjectField<
  Props extends { [key: string]: any } = { [key: string]: any }
> = BaseField & {
  type: "object";
  objectFields: Props extends any[]
    ? never
    : {
        [SubPropName in keyof Props]: Field<Props[SubPropName]>;
      };
};

// DEPRECATED
export type Adaptor<
  AdaptorParams = {},
  TableShape extends Record<string, any> = {},
  PropShape = TableShape
> = {
  name: string;
  fetchList: (adaptorParams?: AdaptorParams) => Promise<TableShape[] | null>;
  mapProp?: (value: TableShape) => PropShape;
};

// DEPRECATED
export type ExternalFieldWithAdaptor<
  Props extends { [key: string]: any } = { [key: string]: any }
> = BaseField & {
  type: "external";
  placeholder?: string;
  adaptor: Adaptor<any, any, Props>;
  adaptorParams?: object;
  getItemSummary: (item: Props, index?: number) => string;
};

export type ExternalField<
  Props extends { [key: string]: any } = { [key: string]: any }
> = BaseField & {
  type: "external";
  placeholder?: string;
  fetchList: (params: {
    query: string;
    filters: Record<string, any>;
  }) => Promise<any[] | null>;
  mapProp?: (value: any) => Props;
  mapRow?: (value: any) => Record<string, string | number | ReactElement>;
  getItemSummary?: (item: Props, index?: number) => string;
  showSearch?: boolean;
  renderFooter?: (props: { items: any[] }) => ReactElement;
  initialQuery?: string;
  filterFields?: Record<string, Field>;
  initialFilters?: Record<string, any>;
};

export type CustomField<Props extends any = {}> = BaseField & {
  type: "custom";
  render: (props: {
    field: CustomField<Props>;
    name: string;
    id: string;
    value: Props;
    onChange: (value: Props) => void;
    readOnly?: boolean;
  }) => ReactElement;
};

export type Field<Props extends any = any> =
  | TextField
  | NumberField
  | TextareaField
  | SelectField
  | RadioField
  | ArrayField<Props extends { [key: string]: any } ? Props : any>
  | ObjectField<Props extends { [key: string]: any } ? Props : any>
  | ExternalField<Props extends { [key: string]: any } ? Props : any>
  | ExternalFieldWithAdaptor<Props extends { [key: string]: any } ? Props : any>
  | CustomField<Props>;

export type Fields<
  ComponentProps extends DefaultComponentProps = DefaultComponentProps
> = {
  [PropName in keyof Omit<ComponentProps, "editMode">]: Field<
    ComponentProps[PropName]
  >;
};

export type FieldProps<F = Field<any>, ValueType = any> = {
  field: F;
  value: ValueType;
  id?: string;
  onChange: (value: ValueType, uiState?: Partial<UiState>) => void;
  readOnly?: boolean;
};
