import { ServiceItem, TabItem } from "./types";
import {
  Home,
  Calculator,
  ClipboardList,
  Users,
  Package,
  CreditCard,
  Menu,
  Bell,
  Settings,
  LogOut,
  User,
  Clock,
  Calendar,
  Building,
  UserCheck,
  Layers,
  Car,
  Wrench,
  Store,
  Activity,
  FileText,
  MapPinned,
  Key,
  BarChart3
} from "lucide-react";

export const Constant = {
  REACT_APP_BASE_URL: 'https://pos.detailingdevils.com',
  REACT_APP_API_TIMEOUT: 30000,
  superAdmin: "super-admin",
  REACT_APP_API_RETRY_COUNT: 2,
  login: {
    logoUrl: "https://mycrm.detailingdevils.com/assets/images/logo.png",
    loginSuccessMessage: "Login successful! Welcome back.",
    loginFailureMessage: "Login failed. Unable to login.",
  },
  master: {
    servicePlan: {
      planName: "Plan Name",
      selectPlanName: "Select plan name",
      vehicleType: "Vehicle Type",
      selectVehicleType: "Select vehicle type",
      selectWarrantyPeriod: "Select warranty period",
      noOfVisit: "Select number of visit",
      mentionRawMaterial: "Mention raw material"

    },
    orgnaization: {
      emailPlaceholder: "Enter official email address",
      bankNamePlaceholder: "Enter bank name",
      companyNameInBank: "Enter company name in bank",
      accountNoPlaceholder: "Enter account No.",
      accountTypePlaceholder: "Enter account type",
      ifscCodePlaceholder: "Enter IFSC code",
      branchNamePlaceholder: "Enter branch name",
      bankAddressPlaceholder: "Enter bank address",
      companyAddressPlaceholder: "Enter company address",
      companyGSTIN: "Enter company GSTIN",
      companyPANPlaceholder: "Enter company PAN number",
      aadharPlaceholder: "Enter Aadhaar number (optional)",

      /* ================= INVOICE ================= */
      invoicePrefixPlaceholder: "Eg: DD/INV",
      servicePrefixPlaceholder: "Eg: DD/SRV",

      /* ================= LOCATION ================= */
      countryPlaceholder: "Country",
      statePlaceholder: "Select state",
      cityPlaceholder: "Select city",
      districtPlaceholder: "Enter district",
      pincodePlaceholder: "Enter pincode",

      /* ================= FILE ================= */
      documentPlaceholder: "Upload document"
    },
    store: {
      addressPlaceholder: "Enter address",
      notesPlaceholder: "Enter notes",
      GSTIN: "Enter GSTIN",
      PANPlaceholder: "Enter PAN number",
      phonePlaceholder: "Enter phone",
      locationNamePlaceholder: "Enter location name",
    }
  },
}

export const RoleList = {
  'super-admin': "Super Admin",
  STORE_MANAGER: 'Store Manager',

}

// Vehicle makes and models
export const vehicleMakes = ['Honda', 'Toyota', 'Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Ford', 'BMW', 'Mercedes-Benz', 'Audi'];
export const vehicleModels = {
  'Honda': ['City', 'Civic', 'Accord', 'CR-V', 'Amaze'],
  'Toyota': ['Innova', 'Fortuner', 'Camry', 'Corolla', 'Etios'],
  'Maruti Suzuki': ['Swift', 'Baleno', 'Dzire', 'Vitara Brezza', 'Alto'],
  'Hyundai': ['i20', 'Creta', 'Verna', 'Santro', 'Tucson'],
  'Tata': ['Nexon', 'Harrier', 'Safari', 'Altroz', 'Tiago'],
  'Mahindra': ['XUV500', 'Scorpio', 'Bolero', 'Thar', 'KUV100'],
  'Ford': ['EcoSport', 'Endeavour', 'Figo', 'Aspire', 'Mustang'],
  'BMW': ['3 Series', '5 Series', 'X3', 'X5', 'Z4'],
  'Mercedes-Benz': ['C-Class', 'E-Class', 'GLC', 'GLE', 'A-Class'],
  'Audi': ['A4', 'A6', 'Q3', 'Q5', 'Q7']
};
// Available services for POS
export const availableServices: ServiceItem[] = [
  { id: '1', name: 'Basic Exterior Wash', price: 500, description: 'Exterior wash and dry', category: 'Basic' },
  { id: '2', name: 'Premium Interior Detailing', price: 1200, description: 'Complete interior cleaning and protection', category: 'Premium' },
  { id: '3', name: 'Ceramic Coating Kit', price: 4500, description: '6-month ceramic protection', category: 'Protection' },
  { id: '4', name: 'Paint Correction Service', price: 3000, description: 'Remove scratches and swirl marks', category: 'Correction' },
  { id: '5', name: 'Full Car PPF Installation', price: 18000, description: 'Complete paint protection film', category: 'Protection' },
  { id: '6', name: 'Engine Bay Cleaning', price: 800, description: 'Professional engine compartment cleaning', category: 'Detailing' }
];
export function isStoreManagementRoute(location: string) {
  return STORE_MANAGEMENT_ROUTES.some(
    (path) =>
      location === path || location.startsWith(path + "?")
  );
}
export const STORE_MANAGEMENT_ROUTES = [
  "/store",
  "/store-details",
  "/master/stores",
  "/master/stores/manage",
];  
export const bottomTabs: TabItem[] = [
  { id: "dashboard", path: "/home", icon: Home, label: "Dashboard" },

    {
      id: "stores",
      path: "/stores",
      icon: Store,
      defaultChildId: "store",
      label: "Store Management",
      children: [
        { id: "store", path: "/stores", label: "Store List" },
        { id: "facility", path: "/facility-management", label: "Facility" },
      ],
    },
  {
    id: "master",
    path: "/master",
    icon: Layers,
    label: "Master",
 
  },
  { id: "appointments", path: "/appointments", icon: Calendar, label: "Appointments" },
  { id: "jobs", path: "/job-cards", icon: ClipboardList, label: "Jobs" },
  { id: "customers", path: "/customers", icon: Users, label: "Customers" },
  { id: "payments", path: "/payments", icon: CreditCard, label: "Payments" },
  { id: "inventory", path: "/inventory", icon: Package, label: "Inventory" },

  {
    id: "manager",
    path: "/manager",
    icon: Settings,
    
      defaultChildId: "manager",
    label: "Staff Management",
    children: [
        { id: "manager", path: "/manager", label: "Manager" },
      { id: "team", path: "/employee-management", label: "Team" },
    ],
  },
];
export const defaultBottomTabs: TabItem[] = [
  { id: "dashboard", path: "/home", icon: Home, label: "Dashboard" },

];

export const quickActions = [
  { id: "new-job", label: "New Job", emoji: "📋", color: "bg-primary hover:bg-primary/90" },
  { id: "customer-lookup", label: "Find Customer", emoji: "👤", color: "bg-blue-600 hover:bg-blue-700" },
  { id: "inventory-check", label: "Stock Check", emoji: "📦", color: "bg-orange-600 hover:bg-orange-700" },
];
export const masterTabList = [
  { id: "store", label: "Store", emoji: Store, color: "bg-blue-600 hover:bg-blue-700" },
  { id: "servicePlan", label: "Service Plan", emoji: Wrench, color: "bg-blue-600 hover:bg-blue-700" },

  { id: "users", label: "Users", emoji: Users, color: "bg-blue-600 hover:bg-blue-700" },
  { id: "organization", label: "Organization", emoji: Building, color: "bg-blue-600 hover:bg-blue-700" },
  { id: "territoryMaster", label: "Territory Master", emoji: MapPinned, color: "bg-blue-600 hover:bg-blue-700" },

  { id: "vehicleMaster", label: "Vehicle Master", emoji: Car, color: "bg-blue-600 hover:bg-blue-700" },
  { id: "systemLog", label: "System Log", emoji: FileText, color: "bg-blue-600 hover:bg-blue-700" },

];
export const profileMenu = [
  {
    value: "overview",
    dataTestId: "tab-overview",
    label: "Overview",
    emoji: BarChart3
  },
  {
    value: "password",
    dataTestId: "tab-vehicles",
    label: "Password",
    emoji: Key
  }
];

export const storeFormKeys = {
  file: [
    {
      label: 'PAN card file',
      key: 'pan_card_file'
    },
    {
      label: 'Registration file',
      key: 'registration_file'
    },
    {
      label: 'GST file',
      key: 'gstin_file'
    },

  ],
  billingTaxFieldList: [{ label: "Invoice prefix", fieldName: "invoice_prefix" },
  { label: "GSTIN", fieldName: "gst_no" },
  { label: "PAN number", fieldName: "pan_no" }
  ]
}