import { Control, ControllerRenderProps, UseFormSetError } from "react-hook-form";
import { CustomerSchema, InsertCustomerSchema, JobCardOnlySchema, JobCardSchema, loginSchema, NewCustomerSchema, NewJobCardSchema, passwordSchema, posJobSchema, profileSchema, userSchema, VehicleSchema } from "./schema";
import z from "zod";
import { ReactNode } from "react";

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  
  selected?: boolean;
}

export interface KanbanCard {
  id: string;
  jobCardId: string;
  title: string;
  customerName: string;
  vehicleInfo: string;
  amount?: number;
  progress?: number;
  timeRemaining?: string;
  status: 'check-in' | 'inspect' | 'prep' | 'service' | 'qc' | 'billing' | 'pickup';
}

export interface DashboardMetrics {
  todayRevenue: number;
  servicesCompleted: number;
  customerSatisfaction: number;
  cashPosition: number;
  activeJobs: number;
}

export interface TaskPriority {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  dueDate?: Date;
  estimatedRevenueLoss?: number;
}

export interface InventoryAlert {
  id: string;
  itemName: string;
  currentStock: number;
  minStockLevel: number;
  status: 'critical' | 'low' | 'ok';
  category: string;
}

export interface FacilityMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
}

export type editUserReq = {
  id: string;
  info: {
    name: string;
    password?: string | null
    email: string;
    phone: string;
    role_id: number;
    address?: string | undefined;
  };
}
export type editServicePlanReq = {

  info: {
    id: string;
    vehicle_type: string;
    category_type: string;
    plan_name: string;
    invoice_name?: string;

    number_of_visits: string;
    price: number;

    sac?: string;
    gst?: number;

    warranty_period: string;
    warranty_in: "months" | "years";

    description?: string;
    raw_materials?: string[];
  };
}

// export type organizationFormType = {
//    company_name: string;
//     email: string;

//     invoice_prefix: string;
//     service_prefix: string;

//     gstin: string;
//     bank_name: string;

//     address: string;

//     status: number; 
// };

export interface CommonDeleteModalProps {
  isOpen: boolean;
  title?: string;
  width?: string
  showCloseIcon?: boolean
  maxWidth?: string
  description?: string;
  shouldNotCancelOnOverlayClick?: boolean
  confirmText?: string;
  loadingText?: string
  cancelText?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}
export type GroupedOption = {
  label: string
  options: Option[]
}
export type FloatingRHFSelectProps = {
  name: string
  label: string
  control: Control<any>
  isClear?: boolean
  options: Option[] | GroupedOption[]


  isMulti?: boolean
  isDisabled?: boolean
  isRequired?: boolean
  creatable?: boolean
  onValueChange?: (value: string | string[]) => void
}

export interface UserApiType {
  id: number, full_name?: string, name?: string, email: string, phone: string
  , role_id: number, is_active: number, created_at: string,
  address: string
}
export interface TerritoryMasterApiType {
  id: number;

  territory_id: string;

  assigned_franchise_id: number;

  country_id: string;

  state_ids: string;

  city_ids: string;

  district: string;

  pin_code: string;

  created_by: number | string;

  status: "active" | "inactive";

  del: number | boolean;

  created_at: string; // ISO date string

  updated_at: string; // ISO date string

  store_id: string;

  action: string; // HTML string

  DT_RowIndex: number;
}

export interface vehicleType {
  "id": number
  "name": string
  "vehicle_models": {
    "id": number,
    "name": string
  }[]
}
export interface vehicleCardItem {
  "company": string
  "model": {
    "id": number,
    "name": string
  }[]
}

export type PasswordForm = z.infer<typeof passwordSchema>;

export interface POSLayoutProps {
  children: ReactNode;
}

export interface nonAdminTabsItem {
  path: string;
  icon: React.ComponentType<any>;
  label: string;
  defaultChildId?: string
  badge?: number;

}
export interface TabItem {
  id: string
  path: string;
  icon: React.ComponentType<any>;
  label: string;
  defaultChildId?: string
  badge?: number;
  children?: {
    id: string;
    path: string;
    label: string;
  }[];
}
export interface CustomerAnalyticsOverview {
  totalCustomers: number;
  newCustomersThisMonth: number;
  activeCustomers: number;
  vipCustomers: number;
  averageLifetimeValue: number;
  customerRetentionRate: number;
  topCustomerSource: string;
  averageServiceInterval: number;
}

export interface CustomerStatsCardsProps {
  className?: string;
}

export type Props = {
  mode: "create" | "edit";
  roles: Array<{ id: number; name: string }>;
  initialValues?: Partial<UserFormType>;
  isLoading?: boolean;
  id: string
  onSubmit: (values: UserFormType) => void;
};
export type UserFormType = {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role_id: number;
  address?: string | undefined;
}
export type systemLogType = {
  action: string
  description: string
  ip_address: string
  browser: string
  platform: string
  device_type: string
  url: string
  client_url: string
  subjectType: string

  actor?: string
  subjectId: string
};

export type serviceFormType = {
  vehicle_type: string;
  category_type: string;
  plan_name: string;
  invoice_name: string;

  number_of_visits: string;
  price: number;

  sac?: string | null;
  gst: number;

  warranty_period: string;
  warranty_in: "months" | "years";

  description?: string | null;
  raw_materials?: string[];
};

export interface userFormProp {
  mode: "create" | "edit" | "view";
  roles: any[];
  id?: string;
  initialValues?: Partial<UserFormType>;
  isLoading?: boolean;
  onClose: () => void;

  // 👇 IMPORTANT
  onSubmit: (
    values: UserFormType,
    setError: UseFormSetError<UserFormType>
  ) => void;
}
export interface serviceMetaInfoType {
  categoryTypes: { label: string, value: string }[],
  numberOfVisits: { label: string, value: string }[],
  servicePlans: { label: string, value: string }[],
  vehicleTypes: { label: string, value: string }[],
  warrantyPeriods: { label: string, value: string }[]

}
export interface systemLogMetaInfoType {

  action: { label: string, value: string }[],
  browser
  : { label: string, value: string }[],
  device_type: { label: string, value: string }[],
  platform
  : { label: string, value: string }[],

}
export interface organizationMetaInfoType {
  country: { label: string, value: string }[],
  state: { label: string, value: string }[],
  city: { label: string, value: string }[],

}
export type InvoicePaymentFormValues = {
  invoice_total: number;
  already_received: number;
  due_amount: number;

  received_amount: number;
  net_amount: number;

  payment_mode: string;
  payment_date: string;

  tax_deducted: "no" | "yes";
  withholding_tax?: number;

  note?: string;
};

export interface InvoicePaymentFormProp {
  mode: "create" | "edit" | "view";
  roles: any[];
  organizationMetaInfo?: organizationMetaInfoType
  id?: string;

  initialValues?: Partial<InvoicePaymentFormValues>;
  isLoading?: boolean;
  onClose: () => void;

  // 👇 IMPORTANT
  onSubmit: (
    values: InvoicePaymentFormValues,
    setError: UseFormSetError<InvoicePaymentFormValues>
  ) => void;
}
export interface organizationFormProp {
  mode: "create" | "edit" | "view";
  roles: any[];
  organizationMetaInfo: organizationMetaInfoType
  id?: string;

  initialValues?: Partial<organizationFormType>;
  isLoading?: boolean;
  onClose: () => void;

  // 👇 IMPORTANT
  onSubmit: (
    values: organizationFormType,
    setError: UseFormSetError<organizationFormType>
  ) => void;
}
export interface systemLogProp {
  mode: "create" | "edit" | "view";
  roles: any[];
  id?: string;
  serviceMetaInfo: {
    categoryTypes: { label: string, value: string }[],
    numberOfVisits: { label: string, value: string }[],
    servicePlans: { label: string, value: string }[],
    vehicleTypes: { label: string, value: string }[],
    warrantyPeriods: { label: string, value: string }[]

  }
  initialValues?: Partial<systemLogType>;
  onClose: () => void;


}
export interface serviceFormProp {
  mode: "create" | "edit" | "view";
  roles: any[];
  id?: string;
  serviceMetaInfo: {
    categoryTypes: { label: string, value: string }[],
    numberOfVisits: { label: string, value: string }[],
    servicePlans: { label: string, value: string }[],
    vehicleTypes: { label: string, value: string }[],
    warrantyPeriods: { label: string, value: string }[]

  }
  initialValues?: Partial<serviceFormType>;
  isLoading?: boolean;
  onClose: () => void;

  // 👇 IMPORTANT
  onSubmit: (
    values: serviceFormType,
    setError: UseFormSetError<serviceFormType>
  ) => void;
}

export type UserForm = z.infer<ReturnType<typeof userSchema>>;
export type ProfileForm = z.infer<typeof profileSchema>;

export type POSJobData = z.infer<typeof posJobSchema>;

export type LoginFormValues = z.infer<typeof loginSchema>;

export type User = null | { id?: string; name?: string; email?: string;[k: string]: any };

export interface AuthContextValue {
  user: User | undefined; // undefined while loading
  isLoading: boolean;
  countries: { id: number, name: string, slug: string }[]
  roles: any[];
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<any>;
  Logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export type InsertCustomer = z.infer<typeof InsertCustomerSchema>;

export type Vehicle = z.infer<typeof VehicleSchema>;

export type JobCard = z.infer<typeof JobCardSchema>;

export type Customer = z.infer<typeof CustomerSchema>;

export type Option = {
  value: string;
  label: string;
};

export type RHFSelectProps = {
  field: ControllerRenderProps<any, any>;
  options: Option[];
  isMulti?: boolean;
  isDisabled?: boolean;
  placeholder?: string;
  creatable?: boolean;
};
export type organizationFormType = {
  company_name: string;
  company_name_in_bank: string;
  email: string;

  bank_name: string;
  account_no: string;
  account_type?: string;
  ifsc_code: string;
  branch_name?: string;
  bank_address: string;

  company_gstin: string;
  company_pan_no: string;
  aadhar_no?: string;

  invoice_prefix: string;
  service_prefix: string;

  country: string;
  state: string;
  city: string;
  district: string;
  pin_code: string;
  org_address: string;
  org_image: File | string;
};
export interface organizationFormProp {
  mode: "create" | "edit" | "view";
  roles: any[];
  organizationMetaInfo: organizationMetaInfoType
  id?: string;

  initialValues?: Partial<organizationFormType>;
  isLoading?: boolean;
  onClose: () => void;

  // 👇 IMPORTANT
  onSubmit: (
    values: organizationFormType,
    setError: UseFormSetError<organizationFormType>
  ) => void;
}
export interface storeFormProp {
  mode: "create" | "edit" | "view";
  roles: any[];
  id?: string;

  initialValues?: Partial<storeFormType>;
  isLoading?: boolean;
  onClose: () => void;

  // 👇 IMPORTANT
  onSubmit: (
    values: storeFormType,
    setError: UseFormSetError<storeFormType>
  ) => void;
}
// $rules = [

//             'name'  => 'required|string|max:100',

//             'email' => 'required|email',

//             'phone' => 'required|digits:10',

//             'organization_id' => 'required|exists:organizations,id',

//             'territory_id' => 'required|exists:territories,id',

//             'country' => 'required|integer',

//             'state'   => 'required|integer',

//             'city'    => 'required|integer',

//             'pincode' => 'required|string|max:10',


//             'registered_address' => 'required|string|max:255',

//             'shipping_address'   => 'required|string|max:255',

//             'gst_no' => 'nullable|string|size:15',

//             'pan_no' => 'nullable|string|size:10',

//             'opening_date'   => 'required|date',

//             'invoice_prefix' => 'required|string|max:10',

//             'notes'          => 'nullable|string|max:255',

//             'pan_card_file'      => 'required|file|mimes:jpg,jpeg,png,webp,pdf|max:2048',

//             'pan_card_file' => 'required|file|mimes:jpg,jpeg,png,webp,pdf|max:2048',

//             'gstin_file'        => 'required|file|mimes:jpg,jpeg,png,webp,pdf|max:2048',

//             'is_active' => 'nullable|boolean',

//         ];



export interface storeFormApi extends storeFormType {
  is_active: boolean
  id: string
  territory: {
    id: number
  }
}

export type storeFormType = {
  name: string;
  email: string;
  phone: string
  organization_id: string
  territory_id: string
  country: string;
  state: string;
  city: string;
  pincode: string;
  registered_address: string;
  shipping_address: string;
  gst_no: string;
  pan_no: string;
  opening_date: string
  invoice_prefix: string;
  notes?: string;
  pan_card_file: File | string;
  registration_file: File | string;
  gstin_file: File | string;
};

export type editOrganizationReq = {
  info: {
    id: number | string;

    company_name: string;
    company_name_in_bank: string;
    email: string;

    bank_name: string;
    account_no: string;
    account_type?: string;
    ifsc_code: string;
    branch_name?: string;
    bank_address: string;

    gstin: string;
    pan_no: string;
    aadhar_no?: string;

    invoice_prefix: string;
    service_prefix: string;

    country: string;
    state: string;
    city: string;
    district: string;
    pincode: string;

    company_address: string;
    document: File | string;
  };
};

/* -------------------- TYPES -------------------- */

export type TerritoryFormValues = {
  name: string;
  store_id?: string;
  notes?: string
  country_id: string;
  city_ids: string[]
  state_ids: string[];
  storeName?: string
};
export type TerritoryFormRequestValues = {
  name: string;
  store_id?: number | null | string;
  notes?: string
  country_id: number;
  city_ids: number[]
  state_ids: number[];
};
export type TerritoryFormApiValues = {
  name: string;
  store: {
    id: number,
    name: string
  }
  store_id?: string;
  notes?: string
  country: {
    id: number;
    name: string
  }
  city_ids: string[]
  state_ids: string[];
};
export type storeListType = {
  id: number;
  name: string
}
export type CopyButtonProps = {
  value?: string;
  size?: number;
  className?: string;
  successDuration?: number; // ms
  disabled?: boolean;
};
export
  type FloatingPasswordFieldProps = {
    name: string;
    label: string;
    control: Control<any>;
    isRequired?: boolean;
  };
export type UserLogoutModalState = {
  info: Record<string, any>; // or a proper interface if you know the shape
  open: boolean;
};
export type SidebarProps = {
  location: string;
  collapsed: boolean;
  setIsUserLogoutModalOpenInfo: React.Dispatch<
    React.SetStateAction<UserLogoutModalState>
  >
  onClose?: () => void;
  user?: any;
  roleName?: string;
  previewUrl?: string | null;

};
export type Notification = {
  id: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
};
export type JobCardFormValues = z.infer<typeof NewJobCardSchema>;

export type JobCardOnlyFormValues = z.infer<typeof JobCardOnlySchema>;
export type JobCardFormUnion = JobCardFormValues | JobCardOnlyFormValues;

export type CustomerFormValues = z.infer<typeof NewCustomerSchema>;
export type FloatingDateFieldProps = {
  name: string;
  label: string;
  isDisabled?: boolean;
  control: Control<any>;
  isRequired?: boolean;
  className?: string;
};
export interface option { value: string; label: string }
export type JobServiceOption = {
  id: number;
  service_name: string;
  price: string;
  description: string;
};

export type ServiceCard = {
  id: string;
  label: string;
  value: string;
  price: number;
  description: string;
};
