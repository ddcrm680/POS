"use client"

import Select from "react-select"
import CreatableSelect from "react-select/creatable"
import { Controller, Control } from "react-hook-form"
import { Box, Text } from "@chakra-ui/react"
import { useState } from "react"
import { Option } from "@/lib/types"
import { RequiredMark } from "./RequiredMark"

type FloatingRHFSelectProps = {
  name: string
  label: string
  control: Control<any>
  options: Option[]
  isMulti?: boolean
  isDisabled?: boolean
  isRequired?: boolean
  creatable?: boolean
  onValueChange?: (value: string | string[]) => void
}

export function FloatingRHFSelect({
  name,
  label,
  control,
  options,
  isMulti = false,
  isDisabled = false,
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
          <Box position="relative" h={'44px'} w="full">
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
              options={options}
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
                control: (base, state) => ({
                  ...base,
                  minHeight: "44px",
                  paddingTop: "10px",
                  borderColor: error
                    ? "#e53e3e"
                    : state.isFocused
                      ? "#3182ce"
                      : "#e1e7ef",
                  boxShadow: "none",
                }),

                menuPortal: (base) => ({
                  ...base,
                  zIndex: 9999, // 🔥 ABOVE ALL FLOATING LABELS
                }),

                menu: (base) => ({
                  ...base,
                  zIndex: 9999,
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
