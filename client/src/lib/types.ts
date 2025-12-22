import { ControllerRenderProps, UseFormSetError } from "react-hook-form";
import { CustomerSchema, InsertCustomerSchema, JobCardSchema, loginSchema, passwordSchema, posJobSchema, profileSchema, userSchema, VehicleSchema } from "./schema";
import z from "zod";
import { ReactNode } from "react";

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
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
  maxWidth?: string
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface UserApiType {
  id: number, full_name?: string, name?: string, email: string, phone: string
  , role_id: number, is_active: number, created_at: string

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

export interface TabItem {
  path: string;
  icon: React.ComponentType<any>;
  label: string;
  badge?: number;
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
export interface organizationMetaInfoType {
  country: { label: string, value: string }[],
  state: { label: string, value: string }[],
  city: { label: string, value: string }[],

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
export type storeFormType = {
  store_name: string;
  email: string;

  notes: string;
  location_name: string
  phone: string
  gstin: string;
  pan_no: string;

  invoice_prefix: string;

  country: string;
  state: string;
  city: string;
  pincode: string;
  address: string;
  registration_file: File | string;
  cancelled_cheque: File | string;
  agreement_file: File | string;
  opening_date:string
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