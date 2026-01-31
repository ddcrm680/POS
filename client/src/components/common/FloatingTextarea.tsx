
import { Box, Text, Textarea, defineStyle } from "@chakra-ui/react"
import { Controller, Control } from "react-hook-form"
import { useState } from "react"
import { RequiredMark } from "./RequiredMark"

type FloatingTextareaProps = {
  name: string
  label: string
  control: Control<any>
  minH?: string
  isView?: boolean
  rows?: number
  isReadOnly?: boolean
  isRequired?: boolean
}

export function FloatingTextarea({
  name,
  label,
  control,
  isReadOnly = false,
  isView = false,
  rows = 1,
  minH = "45px",
  isRequired = false,
  ...inputProps
}: FloatingTextareaProps) {
  const [focused, setFocused] = useState(false)

  const disabled = isView          // 👈 VIEW = DISABLED
  const readOnly = isReadOnly      // 👈 READONLY = READONLY

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const { error } = fieldState

        const shouldFloat =
          focused || (field.value && String(field.value).length > 0)

        return (
          <Box position="relative" w="full">
            <Textarea
              {...field}
              {...inputProps}
              rows={rows}
              minH={minH}
              pt="10px"
              pl="12px"
              pr="18px"
              pb="8px"
              fontSize="12px"

              disabled={disabled}     // ✅ VIEW MODE
              readOnly={readOnly}     // ✅ READONLY MODE

              border="1px solid"
              borderColor={error ? "red.500" : "#e1e7ef"}
              _focus={{
                borderColor: error ? "red.500" : "blue.500",
              }}

              _disabled={{
                bg: "#fafafa",
                opacity: 0.7,
              }}

              _readOnly={{
                bg: "white",
                cursor: "default",
              }}

              onFocus={() => {
                if (!disabled) setFocused(true)
              }}
              onBlur={() => setFocused(false)}
            />

            {/* FLOATING LABEL */}
            <Text
              css={floatingLabelStyle}
              data-float={shouldFloat || undefined}
              bg={disabled ? "gray.50" : "white"}
              color={"gray.500"}
            >
              {label}
              {isRequired && <RequiredMark show={!disabled} />}
            </Text>

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

const floatingLabelStyle = defineStyle({
  position: "absolute",
  left: "10px",
  top: "11px",
  fontSize: "xs",
  background: "white",
  paddingInline: "4px",
  pointerEvents: "none",
  transition: "all 0.2s ease",
  zIndex: 1,
  color: "gray.500",

  "&[data-float]": {
    top: "-6px",
    fontSize: "10px",
  },
})