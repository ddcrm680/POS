
import { Box, Text, Textarea, defineStyle } from "@chakra-ui/react"
import { Controller, Control } from "react-hook-form"
import { useState } from "react"
import { RequiredMark } from "./RequiredMark"

type FloatingTextareaProps = {
  name: string
  label: string
  control: Control<any>
  isView: boolean
  isRequired?: boolean
}

export function FloatingTextarea({
  name,
  label,
  control,
  isView,
  isRequired = false,
}: FloatingTextareaProps) {
  const [focused, setFocused] = useState(false)

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
              disabled={isView}
              pt="18px"
               pl="18px"
                 pr="18px"
              pb="8px"
              minH="80px"
              border="1px solid"
              borderColor={error ? "red.500" : "#e1e7ef"}
              _focus={{
                borderColor: error ? "red.500" : "blue.500",
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />

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
