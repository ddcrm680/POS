"use client"

import Select from "react-select"
import CreatableSelect from "react-select/creatable"
import { Controller, Control } from "react-hook-form"
import { Box, Text } from "@chakra-ui/react"
import { useState } from "react"
import { FloatingRHFSelectProps, Option } from "@/lib/types"
import { RequiredMark } from "./RequiredMark"
import { flattenOptions } from "@/lib/utils"

export function FloatingRHFSelect({
  name,
  label,
  control,
  options,
  isMulti = false,
  isDisabled = false,
  isClear = false,
  isRequired = false,
  creatable = false,
  onValueChange
}: FloatingRHFSelectProps) {
  const Component = creatable ? CreatableSelect : Select
  const [focused, setFocused] = useState(false)

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const error = fieldState.error

        const hasValue = isMulti
          ? Array.isArray(field.value) && field.value.length > 0
          : !!field.value

        const shouldFloat = focused || hasValue

        const flatOptions = flattenOptions(options)

        const value = isMulti
          ? Array.isArray(field.value)
            ? field.value.map((v: string) => ({
              value: v,
              label: flatOptions.find(o => o.value === v)?.label || v,
            }))
            : []
          : field.value
            ? {
              value: field.value,
              label:
                flatOptions.find(o => o.value === field.value)?.label ||
                field.value,
            }
            : null

        return (
          <Box position="relative" w="full">
            {/* FLOATING LABEL */}
            <Text
              position="absolute"
              left="12px"
              top={shouldFloat ? "-6px" : "12px"}
              fontSize={shouldFloat ? "xs" : "sm"}
              color={error ? "red.500" : "gray.500"}
              bg={isDisabled ? "transparent" : "white"}
              px="4px"
              zIndex={2}
              pointerEvents="none"
              transition="all 0.2s ease"
            >
              {label}
              {isRequired && <RequiredMark show />}
            </Text>

            <Component
              isMulti={isMulti}
              isDisabled={isDisabled}
              isSearchable
              isClearable={isClear}
              options={options}
              getOptionValue={(o: any) => o.value}
              getOptionLabel={(o: any) => o.label}
              formatGroupLabel={(group) => (
                <div className="flex justify-between">
                  <span>{group.label}</span>
                  <span className="text-xs text-gray-400">
                    {group.options.length}
                  </span>
                </div>
              )}
              value={value}
              placeholder=""
              menuPortalTarget={typeof document !== "undefined" ? document.body : null}
              menuPosition="fixed"
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onChange={(selected: any) => {
                if (isMulti) {
                  const values = selected ? selected.map((o: Option) => o.value) : []
                  field.onChange(values)
                  onValueChange?.(values)
                } else {
                  const value = selected ? selected.value : ""
                  field.onChange(value)
                  onValueChange?.(value)
                }
              }}
              styles={{
                groupHeading: base => ({
                  ...base,
                  fontWeight: 600,
                  fontSize: "11px",
                  color: "#2d3748",
                  padding: "4px 8px",
                }),

                control: (base, state) => ({
                  ...base,
                  minHeight: "38px",
                  height: "38px",
                  paddingTop: "4px",
                  fontSize: "13px",
                  borderColor: error
                    ? "#e53e3e"
                    : state.isFocused
                      ? "#3182ce"
                      : "#e1e7ef",
                  boxShadow: "none",
                }),

                valueContainer: base => ({
                  ...base,
                  padding: "0 8px",
                }),

                input: base => ({
                  ...base,
                  margin: 0,
                  padding: 0,
                  fontSize: "13px",
                }),

                singleValue: base => ({
                  ...base,
                  fontSize: "13px",
                }),

                multiValue: base => ({
                  ...base,
                  fontSize: "12px",
                  height: "22px",
                }),

                multiValueLabel: base => ({
                  ...base,
                  fontSize: "12px",
                  padding: "0 4px",
                }),

                multiValueRemove: base => ({
                  ...base,
                  padding: "0 4px",
                }),

                option: (base, state) => ({
                  ...base,
                  fontSize: "13px",
                  padding: "6px 10px",
                  backgroundColor: state.isFocused ? "#edf2f7" : "white",
                  color: "#1a202c",
                }),

                menuPortal: base => ({
                  ...base,
                  zIndex: 999999,
                }),

                menu: base => ({
                  ...base,
                  zIndex: 999999,
                }),

                placeholder: () => ({
                  display: "none",
                }),
              }}
            />


            {/* ERROR */}
            {error && (
              <Text mt="1" fontSize="xs" color="red.500">
                {error.message}
              </Text>
            )}
          </Box>
        )
      }}
    />
  )
}
