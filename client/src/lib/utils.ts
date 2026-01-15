import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { FloatingRHFSelectProps, GroupedOption, GstType, Option, SidebarProps, TabItem } from "./types";

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
export const findIdByName = (list: any[], name?: string) => {

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
export function isChildActive(path: string, location: string, id: string, sidebarContext?: string | null,) {

  return ((location === path || location.startsWith(path + "/") || location.includes(path)) && sidebarContext == id);
}

export function isParentActive(
  tab: any,
  location: string,
  sidebarContext?: string | null
) {
  // 1️⃣ Context wins (explicit navigation intent)

  if (sidebarContext && sidebarContext === tab.id) {
    return true;
  }

  // 2️⃣ Parent path match
  if (location.startsWith(tab.path) && sidebarContext !== 'stores') {
    return true;
  }

  // 3️⃣ Any child active
  if (tab.children && sidebarContext !== 'stores') {
    return tab.children.some((c: any) =>
      location.startsWith(c.path)
    );
  }

  return false;
}
export function getActiveChild(tab: any, location: string, id: string, sidebarContext?: string | null) {
  return tab.children?.find((c: any) =>
    isChildActive(c.path, location, id, sidebarContext)
  );
}
export const formatDate2 = (date: string | Date) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

export function mapInvoiceApiToPrefilledViewModel(api: any) {
  const job = api.job_card;
  const consumer = api.job_card.consumer;
  const billing_prefill = api.billing_prefill || {};
  return {
    customer: {
      bill_to: consumer.type === 'individual' ? billing_prefill.individual.name : billing_prefill.company.name,
      name: billing_prefill.individual.name,
      phone: billing_prefill.individual.phone,
      email: billing_prefill.individual.email,
      address: billing_prefill.individual.address,
      gst: billing_prefill.company.gstin ?? "",
      type: consumer.type || 'individual',
      billingAddress: consumer.type === 'individual' ? billing_prefill.individual.address : billing_prefill.company.address,
    },

    vehicle: {
      type: job.vehicle_type,
      make: (job?.vmake?.name), // replace with lookup if available
      model: (job?.vmodel?.name),  // replace with lookup if available
      reg_no: job.reg_no,
      make_year: String(job.year),
      color: job.color,
      chassisNo: job.chasis_no,
      remark: job.remarks ?? "",
    },

    jobcard: {
      jobcard_date: formatDate2(job.jobcard_date),
      edited_date: new Date(job.updated_at).toLocaleString(),
    },

    plans: api.opted_services,
    billing_prefill: billing_prefill.individual,
    billing_prefillCompany: billing_prefill.company,
    store: job.store,
  };
}
export function calculateInvoiceRow(
  plan: any,
  gstType: "igst" | "cgst_sgst" = "igst"
) {
  const qty = Number(plan.qty || 1);
  const price = Number(plan.price || 0);
  const gstPercent = Number(plan.gst || 0);

  const baseSubTotal = qty * price;

  const rawPercent = plan.discount_percent ?? "";
  const rawAmount = plan.discount_amount ?? "";
  
  let percentNum = rawPercent || 0;
  let amountNum = (rawAmount || 0);

  if (plan._discountSource === "percent") {

    amountNum = ((baseSubTotal * percentNum) / 100) > plan.price ? plan.price : ((baseSubTotal * percentNum) / 100).toFixed(2)

  } else if

    (plan._discountSource === "amount") {
    if (Number(amountNum) > plan.price) {
      amountNum = plan.price
    }
    percentNum = baseSubTotal
      ? ((amountNum / baseSubTotal) * 100) > 100 ? 100 : ((amountNum / baseSubTotal) * 100).toFixed(4)
      : 0;
  }

  const discountedSubTotal = baseSubTotal - amountNum;

  // GST
  let cgst = 0, sgst = 0, igst = 0;
  let cgstPercent = 0, sgstPercent = 0, igstPercent = 0;

  if (gstType === "cgst_sgst") {
    cgstPercent = gstPercent / 2;
    sgstPercent = gstPercent / 2;
    cgst = (discountedSubTotal * cgstPercent) / 100;
    sgst = (discountedSubTotal * sgstPercent) / 100;
  } else {
    igstPercent = gstPercent;
    igst = (discountedSubTotal * igstPercent) / 100;
  }

  const total = discountedSubTotal + cgst + sgst + igst;

  return {
    ...plan,

    qty,

    discount_percent: percentNum,
    discount_amount: amountNum,

    sub_amount: +discountedSubTotal.toFixed(2),

    cgst_percent: +cgstPercent.toFixed(2),
    sgst_percent: +sgstPercent.toFixed(2),
    igst_percent: +igstPercent.toFixed(2),

    cgst_amount: +cgst.toFixed(2),
    sgst_amount: +sgst.toFixed(2),
    igst_amount: +igst.toFixed(2),

    total_amount: +total.toFixed(2),
  };
}


export function normalizeInvoiceToCreateResponse(api: any) {
  if (!api) return api;

  // 🔹 If already create-prefill response → return as-is
  if (api.job_card && api.opted_services && api.billing_prefill) {
    return api;
  }

  // 🔹 INVOICE VIEW → CREATE PREFILL FORMAT
  return {
    job_card: {
      ...api.job_card,
      consumer: api.consumer,
      store: api.store ?? api.job_card?.store ?? null,
      vmake: { id: api.job_card?.vehicle_company_id ?? null, },
      vmodel: {
        id: api.job_card?.vehicle_make_id ?? null,
      },
    },

    opted_services: (api.items || []).map((item: any) => ({
      id: item.reference_id,
      category_type: null,
      category: null,
      vehicle_type: api.job_card?.vehicle_type ?? null,

      plan_name: item.item_name,
      invoice_name: item.item_name,

      number_of_visits: Number(item.qty ?? 1),
      price: item.unit_price,
      gst:
        item.igst_percent
      ,
      discount_percent: item?.discount_percent,
      discount_amount: item?.discount_amount,
      is_tax_inclusive: false,
      sac: item.sac,
      description: item.description,
      warranty_period: null,
      warranty_in: null,
      raw_materials: [],
      status: true,
    })),

    availableServices: [],

    billing_prefill: {
      individual: {
        name: api.billing_name,
        phone: api.billing_phone ?? null,
        email: api.billing_email,//
        address: api?.billing_address,//
        state_id: api.billing_state_id ?? null,
      },
      company: {
        name: api.billing_name,
        phone: api.billing_phone ?? null,
        email: api.billing_email,//
        address: api?.billing_address,//
        state_id: api.billing_state_id ?? null,
        gstin: api.billing_gstin ?? null,
      },
    },
  };
}
export function normalizeInvoiceToEditResponse(api: any) {
  if (!api) return api;


  const job = api.job_card

  // 🔹 INVOICE VIEW → CREATE PREFILL FORMAT
  return {
    customer: {
      bill_to: api.job_card.consumer.name,
      name: api.job_card.consumer.name,
      phone: api.job_card.consumer.phone,
      email: api.job_card.consumer.email,
      address: api.job_card.consumer.address,
      gst: api.job_card.consumer.gst,
      type: api.invoice_data.billing_type,
    },

    vehicle: {
      type: job.vehicle_type,
      make: (job?.vmake?.name), // replace with lookup if available
      model: (job?.vmodel?.name),  // replace with lookup if available
      reg_no: job.reg_no,
      make_year: String(job.year),
      color: job.color,
      chassisNo: job.chasis_no,
      remark: job.remarks ?? "",
    },

    jobcard: {
      jobcard_date: formatDate2(job.jobcard_date),
      edited_date: new Date(job.updated_at).toLocaleString(),
    },

    plans: api.opted_services,
    billing_prefill: {
      name: api?.invoice_data?.billing_name,
      phone: api?.invoice_data?.billing_phone ?? null,
      email: api?.invoice_data?.billing_email,//
      address: api?.invoice_data?.billing_address,//
      state_id: api?.invoice_data?.billing_state_id ?? null,
    },
    billing_prefillCompany: {
      name: api?.invoice_data?.billing_name,
      phone: api?.invoice_data?.billing_phone ?? null,
      email: api?.invoice_data?.billing_email,//
      address: api?.invoice_data?.billing_address,//
      state_id: api?.invoice_data?.billing_state_id ?? null,
      gstin: api?.invoice_data?.billing_gstin ?? null,
    },
    store: job.store,


  };
}