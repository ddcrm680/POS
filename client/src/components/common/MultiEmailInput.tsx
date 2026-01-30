"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  value: string[];
  onChange: (emails: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function MultiEmailInput({
  value,
  onChange,
  placeholder = "To: email address",
  disabled,
}: Props) {
  const [input, setInput] = useState("");

  const addEmail = () => {
    const email = input.trim().toLowerCase();
    if (!email) return;

    // allow adding even if invalid (shown as red)
    if (value.includes(email)) return;

    onChange([...value, email]);
    setInput("");
  };

  const removeEmail = (email: string) => {
    onChange(value.filter(v => v !== email));
  };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 min-h-[35x]",
        "rounded-md border px-3 py-1.5",
        "focus-within:ring-2 focus-within:ring-ring focus-within:border-ring",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* EMAIL CHIPS */}
      {value.slice(0, 2).map(email => {
        const valid = isValidEmail(email);

        return (
          <span
            key={email}
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-sm",
              valid
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "bg-red-50 text-red-700 border border-red-200"
            )}
          >
            {email}
            <button
              type="button"
              onClick={() => removeEmail(email)}
              className={cn(
                "rounded hover:bg-black/5",
                valid ? "text-black" : "text-black"
              )}
            >
              <X size={12} />
            </button>
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
          if (e.key === "Enter") {
            e.preventDefault();
            addEmail();
          }
          if (e.key === "Backspace" && !input && value.length) {
            removeEmail(value[value.length - 1]);
          }
        }}
        placeholder={value.length ? "" : placeholder}
         className="
    flex-1 min-w-[160px] h-[25px]
    bg-transparent text-sm
    outline-none border-none ring-0
    focus:outline-none focus:ring-0 focus:border-none
    placeholder:text-muted-foreground
  "
      />
    </div>
  );
}

/* helper */
const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
