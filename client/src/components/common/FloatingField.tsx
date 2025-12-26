"use client"

import {
  Box,
  Input,
  Text,
  defineStyle,
} from "@chakra-ui/react"
import { Controller, Control } from "react-hook-form"
import { useState } from "react"
import { RequiredMark } from "./RequiredMark"

type FloatingFieldProps = {
  name: string
  label: string
  control: Control<any>
  isView: boolean
  isRequired?: boolean
  isDisabled?: boolean
  type?: string
} & Omit<React.ComponentProps<typeof Input>, "name">

export function FloatingField({
  name,
  label,
  control,
  isView,
  isRequired = false,
  type = "text",
  ...inputProps
}: FloatingFieldProps) {
  const [focused, setFocused] = useState(false)
  const [inputType, setInputType] = useState(type)

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const { error } = fieldState
        if(name==='opening_date')
{}

        const shouldFloat =
          focused || (field.value && String(field.value).length > 0)

        return (
          <Box position="relative" w="full">
            <Input
              {...field}
              {...inputProps}
              type={inputType}
              h="44px"
              pt="18px"
                pr="18px"
              pl="18px"
              pb="8px"
              disabled={isView}
              border="1px solid"
              borderColor={error ? "red.500" : "#e1e7ef"}
              _focus={{ borderColor: error ? "red.500" : "blue.500" }}
              onFocus={(e) => {
                setFocused(true)
                if (type === "date") setInputType("date")
                inputProps.onFocus?.(e)
              }}
              onBlur={(e) => {
                setFocused(false)
                field.onBlur()
                if (type === "date" && !field.value) {
                  setInputType("text")
                }
                inputProps.onBlur?.(e)
              }}
            />

            {/* Floating label */}
            <Text
              css={floatingLabelStyle}
              data-float={shouldFloat || undefined}
              color={error ? "red.500" : "gray.500"}
            >
              {label}
              {isRequired && <RequiredMark show={!isView} />}
            </Text>

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

const floatingLabelStyle = defineStyle({
  position: "absolute",
  left: "12px",
  top: "12px",
  fontSize: "sm",
  background: "white",
  paddingInline: "4px",
  pointerEvents: "none",
  transition: "all 0.2s ease",
  zIndex: 1,

  "&[data-float]": {
    top: "-6px",
    fontSize: "xs",
  },
})
