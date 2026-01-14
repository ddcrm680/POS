import {
  Box,
  Input,
  Text,
  defineStyle,
} from "@chakra-ui/react";
import { Controller, Control } from "react-hook-form";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { RequiredMark } from "@/components/common/RequiredMark";
import { FloatingPasswordFieldProps } from "@/lib/types";
export function FloatingPasswordField({
  name,
  label,
  control,
  isRequired = false,
}: FloatingPasswordFieldProps) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const { error } = fieldState;

        const shouldFloat =
          focused || (field.value && String(field.value).length > 0);

        return (
          <Box w="full">
            <Box position="relative">
              <Input
                {...field}
                type={show ? "text" : "password"}
                h="44px"
                pt="18px"
                pr="42px"
                pl="18px"
                pb="8px"
                border="1px solid"
                borderColor={error ? "red.500" : "#e1e7ef"}
                _focus={{ borderColor: error ? "red.500" : "blue.500" }}
                onFocus={() => setFocused(true)}
                onBlur={(e) => {
                  setFocused(false);
                  field.onBlur();
                }}
              />

              {/* 👁 Eye toggle – now stable */}
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                tabIndex={-1}
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>

              {/* Floating label */}
              <Text
                css={floatingLabelStyle}
                data-float={shouldFloat || undefined}
                color={error ? "red.500" : "gray.500"}
              >
                {label}
                {isRequired && <RequiredMark show />}
              </Text>
            </Box>

            {/* ❌ Error text is OUTSIDE the positioning context */}
            {error && (
              <Text mt="1" fontSize="xs" color="red.500">
                {error.message}
              </Text>
            )}
          </Box>
        );
      }}
    />
  );
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
});
