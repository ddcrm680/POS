"use client";

import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { ControllerRenderProps } from "react-hook-form";

export type Option = {
  value: string;
  label: string;
};

type RHFSelectProps = {
  field: ControllerRenderProps<any, any>;
  options: Option[];
  isMulti?: boolean;
  isDisabled?: boolean;
  placeholder?: string;
  creatable?: boolean;
};

export default function RHFSelect({
  field,
  options,
  isMulti = false,
  isDisabled = false,
  placeholder = "Select...",
  creatable = true,
}: RHFSelectProps) {
  const Component = creatable ? CreatableSelect : Select;

  const value = isMulti
    ? Array.isArray(field.value)
      ? field.value.map((v: string) => ({
          value: v,
          label: options.find(o => o.value === v)?.label || v,
        }))
      : []
    : field.value
      ? {
          value: field.value,
          label: options.find(o => o.value === field.value)?.label || field.value,
        }
      : null;

  return (
    <Component
      isMulti={isMulti}
      isDisabled={isDisabled}
      options={options}
      placeholder={placeholder}
      value={value}
      onChange={(selected: any) => {
        if (isMulti) {
          field.onChange(selected ? selected.map((o: Option) => o.value) : []);
        } else {
          field.onChange(selected ? selected.value : "");
        }
      }}
    />
  );
}
