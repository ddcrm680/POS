import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { FloatingRHFSelectProps, GroupedOption, Option, SidebarProps, TabItem } from "./types";

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
export function isObject(val: any) {
  return val !== null && typeof val === "object" && !Array.isArray(val);
}

export function isEqualDeep(a: any, b: any): boolean {
  // same reference or same primitive
  if (a === b) return true;

  // array comparison
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, i) => isEqualDeep(item, b[i]));
  }

  // object comparison
  if (isObject(a) && isObject(b)) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every(
      key => isEqualDeep(a[key], b[key])
    );
  }

  return false;
}

export function getDiff(before: any = {}, after: any = {}) {
  const keys = new Set([
    ...Object.keys(before || {}),
    ...Object.keys(after || {}),
  ]);

  return Array.from(keys).map((key) => {
    const beforeVal = before?.[key];
    const afterVal = after?.[key];

    const changed = !isEqualDeep(beforeVal, afterVal);

    return {
      key,
      before: beforeVal,
      after: afterVal,
      changed,
    };
  });
}
export function buildGroupedCityOptions(
  cities: any[],
  states: any[]
) {
  const stateMap = new Map(
    states.map(s => [String(s.id), s.name])
  );

  const grouped: Record<string, any[]> = {};

  cities.forEach(city => {
    const stateId = String(city.state_id);
    const stateName = stateMap.get(stateId) || "Other";

    if (!grouped[stateName]) {
      grouped[stateName] = [];
    }

    grouped[stateName].push({
      value: String(city.id),
      label: city.name,
    });
  });

  return Object.entries(grouped).map(([label, options]) => ({
    label,
    options,
  }));
}
export function flattenOptions(
  options: Option[] | GroupedOption[]
): Option[] {
  if (!options || options.length === 0) return []

  // grouped options
  if ("options" in options[0]) {
    return (options as GroupedOption[]).flatMap(g => g.options)
  }

  // flat options
  return options as Option[]
}
export const isImageFile = (file: File | string) => {
  if (file instanceof File) {
    return file.type.startsWith("image/");
  }
  return /\.(jpg|jpeg|png|webp)$/i.test(file);
};

export const isPdfFile = (file?: File, url?: string) => {
  if (file) {
    return file.type === "application/pdf";
  }
  if (url) {
    return /\.pdf$/i.test(url);
  }
  return false;
};

export const isPdfUrl = (url: string) => /\.pdf$/i.test(url);
export const getFileNameFromUrl = (url?: string) => {
  if (!url) return "";
  return url.split("/").pop() ?? "";
};
export function generateStrongPassword(length = 12) {
  if (length < 8) length = 8;

  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const digits = "23456789";
  const special = "@#$!";

  const all = upper + lower + digits + special;

  // guarantee minimum requirements
  let password =
    upper[Math.floor(Math.random() * upper.length)] +
    lower[Math.floor(Math.random() * lower.length)] +
    digits[Math.floor(Math.random() * digits.length)] +
    special[Math.floor(Math.random() * special.length)];

  // fill remaining characters
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  // shuffle password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}
export function getFileNameFromLabel(
  label: string,
  filePath?: string | null
) {
  if (!filePath) return label;

  // get extension from actual file
  const extMatch = filePath.match(/\.[^/.]+$/);
  const ext = extMatch ? extMatch[0] : "";

  return `${label}${ext}`;
}
export function normalizeStatus(status: any) {
  if (status === 1 || status === "1" || status === "active" || status) return "active";
  return "inactive";
}
export function stripDiffMeta(meta: any) {
  if (!meta || typeof meta !== "object") return null;

  const { before, after, ...rest } = meta;
  return Object.keys(rest).length ? rest : null;
}
export function isChildActive(path: string, location: string) {
  return location === path || location.startsWith(path + "/");
}

export function isParentActive(tab: any, location: string) {
  if (location.startsWith(tab.path)) return true;
  return tab.children?.some((c: any) => isChildActive(c.path, location));
}

export function getActiveChild(tab: any, location: string) {
  return tab.children?.find((c: any) =>
    isChildActive(c.path, location)
  );
}