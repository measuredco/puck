import { ReactElement } from "react";
import { AppState, DefaultComponentProps, UiState } from "./Config";

type FieldOption = {
  label: string;
  value: string | number | boolean;
};

type FieldOptions = Array<FieldOption> | ReadonlyArray<FieldOption>;

type ValidateFn<ValueType, FieldType> = (
  value: ValueType,
  field: FieldType,
  appState: AppState
) => FieldStatus | undefined;

export type BaseField = {
  label?: string;
};

export type TextField = BaseField & {
  type: "text";
  // TODO change with inferred types
  validate?: ValidateFn<string, TextField>;
};

export type NumberField = BaseField & {
  type: "number";
  min?: number;
  max?: number;
  validate?: ValidateFn<number, NumberField>;
};

export type TextareaField = BaseField & {
  type: "textarea";
  validate?: ValidateFn<string, TextareaField>;
};

export type SelectField = BaseField & {
  type: "select";
  options: FieldOptions;
  validate?: ValidateFn<string | number | boolean, SelectField>;
};

export type RadioField = BaseField & {
  type: "radio";
  options: FieldOptions;
  validate?: ValidateFn<string | number | boolean, RadioField>;
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
  validate?: ValidateFn<Props[0], ArrayField<Props>>;
};

export type ObjectField<
  Props extends { [key: string]: any } = { [key: string]: any }
> = BaseField & {
  type: "object";
  objectFields: {
    [SubPropName in keyof Props]: Field<Props[SubPropName]>;
  };
  validate?: ValidateFn<Props, ObjectField<Props>>;
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
  validate?: ValidateFn<Props, ExternalFieldWithAdaptor<Props>>;
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
  mapRow?: (value: any) => Record<string, string | number>;
  getItemSummary?: (item: Props, index?: number) => string;
  showSearch?: boolean;
  initialQuery?: string;
  filterFields?: Record<string, Field>;
  initialFilters?: Record<string, any>;
  validate?: ValidateFn<Props, ExternalField<Props>>;
};

export type CustomField<Props extends any = {}> = BaseField & {
  type: "custom";
  render: (props: {
    field: CustomField<Props>;
    name?: string;
    id: string;
    value: Props;
    onChange: (value: Props) => void;
    readOnly?: boolean;
  }) => ReactElement;
  validate?: ValidateFn<Props, CustomField>;
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
  [PropName in keyof Omit<
    Required<ComponentProps>,
    "children" | "editMode"
  >]: Field<ComponentProps[PropName]>;
};

export type FieldStatus = {
  type: "default" | "error" | "warning" | "success";
  message?: string;
};

export type FieldProps<ValueType = any, F = Field<any>> = {
  field: F;
  value: ValueType;
  id?: string;
  onChange: (value: ValueType, uiState?: Partial<UiState>) => void;
  readOnly?: boolean;
  status?: FieldStatus;
};
