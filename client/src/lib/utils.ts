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

   return list.find(item => item.id === Number(name))?.id ?? "";
}