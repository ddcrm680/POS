import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function formatDate(dateString: string) {
  if (!dateString) return "-";

  const date = new Date(dateString);

  const datePart = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return `${datePart}`;
}
export function formatTime(dateString: string) {
  if (!dateString) return "-";

  const date = new Date(dateString);

  const timePart = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${timePart}`;
}
export const findIdByName = (list: any[], name?: string) =>{
console.log(list,name,'listlistlist');

   return list.find(item => item.id === Number(name))?.id ?? "";
}
export const findIdsByNames = (list: any[], names: string[]) => {
  return list
    .filter(item => names.includes(item.name))
    .map(item => String(item.id));
};

export function formatAndTruncate(
  value: string[],
  maxLen: number = 15
): {
  displayText: string;
  fullText: string;
  isTruncated: boolean;
} {
  if (!value) {
    return {
      displayText: "",
      fullText: "",
      isTruncated: false,
    };
  }
  

  const fullText = value
    .map((item) =>
      item.trim().charAt(0).toUpperCase() + item.trim().slice(1)
    )
    .join(", ");

  const isTruncated = fullText.length > maxLen;

  return {
    fullText,
    isTruncated,
    displayText: isTruncated
      ? fullText.slice(0, maxLen) + "…"
      : fullText,
  };
}
