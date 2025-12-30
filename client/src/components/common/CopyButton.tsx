import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { CopyButtonProps } from "@/lib/types";



export function CopyButton({
  value,
  size = 16,
  className,
  successDuration = 1500,
  disabled = false,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value || disabled) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);

      setTimeout(() => setCopied(false), successDuration);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={ disabled}
      title={copied ? "Copied" : "Copy"}
      className={cn(
        "p-1 rounded cursor-pointer transition-colors",
        "hover:bg-muted focus:outline-none",
        ( disabled) && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {copied ? (
        <Check size={size} className="text-green-600" />
      ) : (
        <Copy size={size} />
      )}
    </button>
  );
}