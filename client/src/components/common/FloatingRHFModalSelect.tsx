"use client"

import Select from "react-select"
import { Controller } from "react-hook-form"
import { Box, Text } from "@chakra-ui/react"
import { useState } from "react"
import { RequiredMark } from "./RequiredMark"

interface Option {
  label: string
  value: string
}

interface FloatingRHFModalSelectProps {
  name: string
  label: string
  control: any
  options: Option[]
  isRequired?: boolean
  isDisabled?: boolean
  isClearable?: boolean
}

export function FloatingRHFModalSelect({
  name,
  label,
  control,
  options,
  isRequired = false,
  isDisabled = false,
  isClearable = false,
}: FloatingRHFModalSelectProps) {
  const [focused, setFocused] = useState(false)

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const error = fieldState.error
        const selectedOption =
          options.find(o => o.value === field.value) || null

        const shouldFloat = focused || !!field.value

        return (
          <Box position="relative" w="full">
            {/* FLOATING LABEL */}
            <Text
              position="absolute"
              left="12px"
              top={shouldFloat ? "-6px" : "12px"}
              fontSize={shouldFloat ? "10px" : "12px"}
              color={error ? "red.500" : "gray.500"}
              bg="white"
              px="4px"
              zIndex={2}
              pointerEvents="none"
              transition="all 0.2s ease"
            >
              {label}
              {isRequired && <RequiredMark show />}
            </Text>

            <Select
              isDisabled={isDisabled}
              isClearable={isClearable}
              isSearchable
              options={options}
              value={selectedOption}
              placeholder=""
              menuPosition="absolute"
              onMenuOpen={() => setFocused(true)}
              onMenuClose={() => setFocused(false)}
              onChange={(opt: any) => {
                field.onChange(opt ? opt.value : "")
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
