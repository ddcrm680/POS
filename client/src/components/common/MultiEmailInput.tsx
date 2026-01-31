"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { isValidEmail } from "@/lib/helper";

type Props = {
  value: string[];
  onChange: (emails: string[]) => void;
  placeholder?: string;
    error?: string;  
  disabled?: boolean;
}
export function MultiEmailInput({
  value,
  onChange,
  placeholder = "",
  disabled=false,
  error,
}: Props) {
  const [input, setInput] = useState("");

  const addEmail = () => {
    if (disabled) return;

    const email = input.trim().toLowerCase();
    if (!email) return;
    if (value.includes(email)) return;

    onChange([...value, email]);
    setInput("");
  };

  const removeEmail = (email: string) => {
    if (disabled) return;
    onChange(value.filter(v => v !== email));
  };

  const hasChips = value.length > 0;

  return (
    <div
      className={cn(
        "items-center",
        "flex flex-wrap items-center gap-2 min-h-[38px]",
        "rounded-md border px-3 py-2",
        !disabled &&
          "focus-within:ring-2 focus-within:ring-ring focus-within:border-ring",
        disabled
          ? "bg-[#fafafa] opacity-70 "
          : "bg-white",
        error ? "border-red-500" : "border-[#e1e7ef]"   // ✅ KEY LINE
      )}
    >
      {/* LEFT SPACER */}
      {!hasChips && <span className="inline-block w-6 shrink-0" />}

      {/* EMAIL CHIPS */}
      {value.slice(0, 2).map(email => {
        const valid = isValidEmail(email);

        return (
          <span
            key={email}
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-sm border",
              valid
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-red-50 text-red-700 border-red-200",
              disabled && "pointer-events-none"
            )}
          >
            {email}

            {!disabled && (
              <button
                type="button"
                onClick={() => removeEmail(email)}
                className="rounded hover:bg-black/5"
              >
                <X size={12} />
              </button>
            )}
          </span>
        );
      })}

      {/* +N MORE */}
      {value.length > 2 && (
        <span className="text-sm text-muted-foreground px-1">
          +{value.length - 2}
        </span>
      )}

      {/* INPUT */}
      <input
        value={input}
        disabled={disabled}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (disabled) return;

          if (e.key === "Enter") {
            e.preventDefault();
            addEmail();
          }
          if (e.key === "Backspace" && !input && value.length) {
            removeEmail(value[value.length - 1]);
          }
        }}
        placeholder={hasChips ? "" : placeholder}
        className={cn(
          "flex-1 min-w-[160px] h-[25px] text-sm bg-transparent",
          "outline-none border-none ring-0",
          "focus:outline-none focus:ring-0 focus:border-none",
          "placeholder:text-muted-foreground",
        )}
      />
    </div>
  );
}



