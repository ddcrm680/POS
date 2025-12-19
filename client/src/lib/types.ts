import { ControllerRenderProps, UseFormSetError } from "react-hook-form";
import { CustomerSchema, InsertCustomerSchema, JobCardSchema, loginSchema, passwordSchema, posJobSchema, profileSchema, userSchema, VehicleSchema } from "./schema";
import z from "zod";
import { ReactNode } from "react";

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?:string;
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
  
  info: {id: string;
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
  raw_materials: string[];
  };
}


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
export interface vehicleType{
    "id": number
    "name": string
    "vehicle_models":{
            "id": number,
            "name": string
        }[]
}
export interface vehicleCardItem{
    "company": string
    "model":{
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

  sac?: string;
  gst: number;

  warranty_period: string;
  warranty_in: "months" | "years";

  description?: string;
  raw_materials: string[];
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
export interface serviceMetaInfoType{
    categoryTypes: {label:string,value:string}[],
    numberOfVisits:  {label:string,value:string}[],
    servicePlans:  {label:string,value:string}[],
    vehicleTypes:  {label:string,value:string}[],
    warrantyPeriods:  {label:string,value:string}[]

  }
export interface serviceFormProp {
  mode: "create" | "edit" | "view";
  roles: any[];
  id?: string;
  serviceMetaInfo:{
    categoryTypes: {label:string,value:string}[],
    numberOfVisits:  {label:string,value:string}[],
    servicePlans:  {label:string,value:string}[],
    vehicleTypes:  {label:string,value:string}[],
    warrantyPeriods:  {label:string,value:string}[]

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
  creatable:boolean
  isMulti?: boolean;
  isDisabled?: boolean;
  placeholder?: string;
};
