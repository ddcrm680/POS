import { Control, Controller, useWatch } from "react-hook-form";
import Datepicker, { DateValueType } from "react-tailwindcss-datepicker";
import { useEffect, useState } from "react";
import { FloatingDateFieldProps } from "@/lib/types";

export function FloatingDateField({
  name,
  label,
  control,
  isDisabled = false,
  isRequired = false,
  className = "",
}: FloatingDateFieldProps) {
  const fieldValue = useWatch({ control, name });

  const [dateValue, setDateValue] = useState<DateValueType>({
    startDate: null,
    endDate: null,
  });

  // ✅ SAFE: hook is now at component level
  useEffect(() => {
    if (fieldValue) {
      setDateValue({
        startDate: new Date(fieldValue),
        endDate: null,
      });
    } else {
      setDateValue({ startDate: null, endDate: null });
    }
  }, [fieldValue]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState ,formState }) => {
        const hasValue = !!dateValue?.startDate;
  const disabled = isDisabled || formState.disabled;
      
        return (
          <div className={`relative group ${className}`}>
            {/* FLOATING LABEL */}
            <label
              className={`
                absolute left-3 px-1 bg-white text-[0.75rem]
                transition-all duration-200 pointer-events-none
                z-20
                ${
                  hasValue
                    ? "-top-2 text-[#71717a]"
                    : "top-3 text-muted-foreground"
                }
                group-focus-within:-top-2
                group-focus-within:text-[#71717a]
              `}
            >
              {label}
              {isRequired && <span className="text-red-500"> *</span>}
            </label>

            <Datepicker
              asSingle
              useRange={false}
              value={dateValue}
               disabled={disabled}
              onChange={(val) => {
                setDateValue(val as DateValueType);

                field.onChange(
                  val?.startDate
                    ? new Date(val.startDate)
                        .toISOString()
                        .split("T")[0]
                    : ""
                );
              }}
              placeholder=" "
              showShortcuts={false}
              popoverDirection="down"
              containerClassName="relative z-10"
             inputClassName={`
                w-full border rounded-md
                pt-4 pb-2 px-3 text-sm
                focus:ring-1 focus:ring-red-500
                ${disabled ? "bg-gray-50 cursor-not-allowed" : ""}
                ${fieldState.error ? "border-red-500" : ""}
              `}
            />

            {fieldState.error && (
              <p className="mt-1 text-xs text-red-500">
                {fieldState.error.message}
              </p>
            )}
          </div>
        );
      }}
    />
  );
}