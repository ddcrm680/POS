"use client";

import { Box, Input, Text, defineStyle } from "@chakra-ui/react";
import { Controller, Control } from "react-hook-form";
import { useState } from "react";
import { RequiredMark } from "./RequiredMark";

type FloatingFieldProps = {
  name: string;
  label: string;
  control: Control<any>;
  isView?: boolean;
    maxAmount?: string
  isRequired?: boolean;
  isDisabled?: boolean;
  type?: string;

  /** 👇 Custom field renderer (MultiEmailInput, Select, etc.) */
  render?: (args: {
    field: any;
    disabled: boolean;
    error?: string;
  }) => React.ReactNode;
} & Omit<React.ComponentProps<typeof Input>, "name">;

export function FloatingField({
  name,
  label,
  control,
  isDisabled = false,
  
  maxAmount,
  isView,
  isRequired = false,
  type = "text",
  render,
  ...inputProps
}: FloatingFieldProps) {
  const [focused, setFocused] = useState(false);
  const [inputType, setInputType] = useState(type);

  const disabled = isView || isDisabled
  const isMobileField = name === "search_mobile" || name === "phone" || name === "billing_phone" || name == "company_contact_no";
  return (
    <Controller

      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const error = fieldState.error?.message;

        const hasValue = Array.isArray(field.value)
          ? field.value.length > 0
          : !!field.value;

        const shouldFloat = focused || hasValue;

        return (
          <Box position="relative" w="full">
            {/* ================= FIELD ================= */}
            {render ? (
              render({ field, disabled, error })
            ) : (
              <Input
                {...field}
                {...inputProps}
                type={inputType}
                h="38px"
                fontSize="13px"
  lineHeight="1.4"
                disabled={disabled}
                pt="14px"
                pb="6px"
                pl="10px"
                pr="10px"
                border="1px solid"
                borderColor={error ? "red.500" : "#e1e7ef"}
  _focus={{ borderColor: error ? "red.500" : "blue.500" }}
                _disabled={{
                  bg: "gray.50",
                  opacity: 0.7,
                }}

              /* 🔒 MOBILE NUMBER RULE */
              inputMode={isMobileField ? "numeric" : inputProps.inputMode}
              pattern={isMobileField ? "[0-9]*" : inputProps.pattern}
              maxLength={isMobileField ? 10 : inputProps.maxLength}

              onChange={(e) => {
                let value = e.target.value;

                // ❌ prevent leading spaces
                value = value.replace(/^\s+/, "");

                if (isMobileField) {
                  value = value.replace(/\D/g, ""); // numbers only
                  value = value.replace(/^0+/, ""); // no leading zero
                  value = value.slice(0, 10);       // max 10 digits
                }
                // 💰 RECEIVED AMOUNT RULES
                if (name === "received_amount") {
                  // Allow digits + dot only
                  value = value.replace(/[^0-9.]/g, "");

                  // Prevent multiple dots
                  const parts = value.split(".");
                  if (parts.length > 2) return;

                  // Limit decimals to 2 digits
                  if (parts[1]?.length > 2) {
                    value = `${parts[0]}.${parts[1].slice(0, 2)}`;
                  }

                  // Prevent leading zeros like 000, 00.50
                  if (/^0{2,}/.test(value)) {
                    value = value.replace(/^0+/, "0");
                  }

                  // Convert to number safely
                  const numericValue = Number(value);

                  // Clamp to due amount
                  if (
                    maxAmount !== undefined &&
                    !Number.isNaN(numericValue) &&
                    numericValue > Number(maxAmount)
                  ) {
                    value = String(maxAmount);
                  }

                  field.onChange(value);
                  return;
                }
                field.onChange(value);
              }}

              onFocus={(e) => {
                if (disabled) return;
                setFocused(true);
                if (type === "date") setInputType("date");
                inputProps.onFocus?.(e);
              }}

              onBlur={(e) => {
                  setFocused(false);
                  field.onBlur();
                if (type === "date" && !field.value) {
                  setInputType("text");
                }
                inputProps.onBlur?.(e);
                }}
              />
            )}

            {/* ================= FLOATING LABEL ================= */}
            <Text
              css={floatingLabelStyle}
              data-float={shouldFloat || undefined}
              bg={disabled ? "#fafafa" : "white"}
              color={"gray.500"}
            >
              {label}
              {isRequired && <RequiredMark show={!disabled} />}
            </Text>

            {/* ================= ERROR ================= */}
            {error && (
              <Text mt="1" fontSize="xs" color="red.500">
                {error}
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
});
