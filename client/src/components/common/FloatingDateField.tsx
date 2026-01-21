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

  // ✅ Sync parent → datepicker (EDIT / VIEW MODE)
  useEffect(() => {
    if (!fieldValue) {
      setDateValue({ startDate: null, endDate: null });
      return;
    }

    const parsed = new Date(fieldValue);

    // 🔒 Guard against invalid dates
    if (isNaN(parsed.getTime())) {
      setDateValue({ startDate: null, endDate: null });
      return;
    }

    // ✅ IMPORTANT: set BOTH startDate & endDate
    setDateValue({
      startDate: parsed,
      endDate: parsed,
    });
  }, [fieldValue]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState, formState }) => {
        const hasValue = !!dateValue?.startDate;
        const disabled = isDisabled || formState.disabled;

        return (
          <div className={`relative group ${className}`}>
            {/* FLOATING LABEL */}
          <label
  className={`
    absolute left-[10px] px-1 bg-white
    transition-all duration-200 pointer-events-none z-20
    ${hasValue ? "-top-2 text-[10px]" : "top-[11px] text-xs"}
    group-focus-within:-top-2
    group-focus-within:text-[10px]
    ${fieldState.error ? "text-red-500" : "text-muted-foreground"}
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
    const selected = val?.startDate ? new Date(val.startDate) : null;

    setDateValue({
      startDate: selected,
      endDate: selected,
    });

    field.onChange(
      selected ? selected.toISOString().split("T")[0] : ""
    );
  }}
  placeholder=" "
  showShortcuts={false}
  popoverDirection="down"
  containerClassName="relative z-10"
  inputClassName={`
    w-full h-[38px]
    border rounded-md
    pt-[14px] pb-[6px] px-[10px]
    text-[13px] leading-tight
    focus:outline-none
    ${disabled ? "bg-gray-50 cursor-not-allowed opacity-70" : ""}
    ${fieldState.error ? "border-red-500" : "border-[#e1e7ef]"}
    focus:border-blue-500
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
