
import { Box, Input, Text, defineStyle } from "@chakra-ui/react"
import { Controller, Control } from "react-hook-form"
import { RequiredMark } from "./RequiredMark"

type FloatingFileProps = {
  name: string
  label: string
  control: Control<any>
  isView: boolean
  isRequired?: boolean
  preview?: string | null
  onFileSelect?: (file: File | null) => void
}

export function FloatingFile({
  name,
  label,
  control,
  isView,
  isRequired = false,
  preview,
  onFileSelect,
}: FloatingFileProps) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const { error } = fieldState
        const shouldFloat = !!preview || !!field.value

        return (
          <Box position="relative" w="full">
            <Input
              type="file"
              disabled={isView}
              pt="18px"
              border="1px solid"
              borderColor={error ? "red.500" : "#e1e7ef"}
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null
                field.onChange(file)
                onFileSelect?.(file)
              }}
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