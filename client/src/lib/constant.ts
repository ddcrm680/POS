import { nonAdminTabsItem, ServiceItem, TabItem } from "./types";
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
  BarChart3,
  Wallet,
  Briefcase,
  Truck,
  Info,
  ShoppingCart
} from "lucide-react";
import { withFullLabel } from "./utils";

export const Constant = {
  REACT_APP_BASE_URL: 'https://pos.detailingdevils.com',
  REACT_APP_API_TIMEOUT: 30000,
  CRYPTO_QUERY_SECRET: "dfdfhregrwtqr32r2r#!@$@r23",
  REACT_APP_PUSHER_KEY: "99a4e310f0775a0c4dea",
  REACT_APP_PUSHER_CLUSTER: "ap2",
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
export const WARRANTY_OPTIONS = [
  { label: "1 Year", value: 1 },
  { label: "3 Years", value: 3 },
  { label: "5 Years", value: 5 },
  { label: "6 Years", value: 6 },
  { label: "7 Years", value: 7 },
  { label: "No Warranty", value: 0 },
];
export const srsConditionList = [
  { value: "brand-new", label: "Brand New" },
  { value: "good-condition", label: "Good Condition" },
  { value: "fair-condition", label: "Fair Condition" },
  { value: "poor-condition", label: "Poor Condition" },
];

export const mailMessageTemplate=`Dear {{consumer_name}},<br><br>

We hope you are doing well.<br><br>

Please find attached the <b>Job Card (No. {{job_card_number}})</b> for the services carried out on <b>{{service_date}}</b>.<br><br>

This job card contains the details of the work performed on your vehicle. If you have any questions or require any clarification regarding the services mentioned, please feel free to contact us.<br><br>

<b>Important Note:</b><br>
Please ensure that you collect your invoice and get your warranty registered online from the studio where you availed the service. Detailing Devils does not provide any warranty and will not be responsible or liable for warranty claims if the warranty is not registered online.<br><br>

You can check your warranty status using the link below:<br>
<a href="https://mycrm.detailingdevils.com/check-warranty" target="_blank">
https://mycrm.detailingdevils.com/check-warranty
</a>
<br><br>

Kind regards,<br><br>

<b>{{store_name}}</b><br>
Phone: +91 {{store_phone}}<br>
Website: www.detailingdevils.com
`
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
export const nonAdminTabs: TabItem[] = withFullLabel([
  { id: "home", path: "/home", icon: Home, label: "Dashboard" },
  { id: "manager", path: "/manager", icon: Settings, label: "Manager" },
  { id: "appointments", path: "/appointments", icon: Calendar, label: "Appointments" },
  { id: "facility-management", path: "/facility-management", icon: Building, label: "Facility" },
  { id: "employee-management", path: "/employee-management", icon: UserCheck, label: "Team" },

  {
    id: "Products",
    path: "/products",
    icon: Package,
    fullLabel: "Products Management",
    label: "Products Mgmt",

  },
  { id: "customers", path: "/customers", icon: Users, label: "Customers" },
  { id: "job-cards", path: "/job-cards", icon: ClipboardList, label: "Job Card" },

  { id: "invoices", path: "/invoices", icon: FileText, label: "Invoices" },

  { id: "payments", path: "/payments", icon: Wallet, label: "Payments" },
  { id: "inventory", path: "/inventory", icon: Package, label: "Inventory", badge: 2 },
]);
export const bottomTabs: TabItem[] = withFullLabel([
  { id: "dashboard", path: "/home", icon: Home, label: "Dashboard" },

  {
    id: "stores",
    path: "/stores",
    icon: Store,
    defaultChildId: "store",
    fullLabel: "Store Management",
    label: "Store Mgmt",
    children: [
      { id: "store", path: "/stores", label: "Store List" },
      { id: "facility", path: "/facility-management", label: "Facility" },
    ],
  },
  {
    id: "Products",
    path: "/products",
    icon: Package,
    fullLabel: "Products Management",
    label: "Products Mgmt",

  },
  {
    id: "master",
    path: "/master",
    icon: Layers,
    label: "Master",
  },

  { id: "customers", path: "/customers", icon: Users, label: "Customers" },
  { id: "jobs", path: "/job-cards", icon: ClipboardList, label: "Job Card" },

  { id: "invoices", path: "/invoices", icon: FileText, label: "Invoices" },

  { id: "payments", path: "/payments", icon: Wallet, label: "Payments" },
  { id: "appointments", path: "/appointments", icon: Calendar, label: "Appointments" },

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
]);
export const defaultBottomTabs: TabItem[] = withFullLabel([
  { id: "dashboard", path: "/home", icon: Home, label: "Dashboard" },

]);

export const quickActions = [
  { id: "new-job", label: "New Job Card", emoji: "📋", color: "bg-primary hover:bg-primary/90" },
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
export const productsTabList = [
  { id: "products-listing", label: "Products Listing", emoji: Package, color: "bg-blue-600 hover:bg-blue-700" },
  { id: "transfer-stock", label: "Transfer Stock", emoji: Truck, color: "bg-blue-600 hover:bg-blue-700" },

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
export const jobCardStatusList = [
  { label: 'All', value: '' },
  { label: "Open", value: 'open' },
  { label: "Cancel", value: 'cancel' },
  { label: "Partially Paid", value: 'partially-paid' },
]

export const TABS = [
  { key: "overview", label: "Overview", icon: User },
  { key: "jobcards", label: "Job Cards", icon: Briefcase },
  { key: "invoices", label: "Invoices", icon: FileText },
  { key: "payments", label: "Payments", icon: CreditCard },
];
export const ProductViewTab = [
  {
    key: "overview",
    label: "Overview",
    icon: Info, // ℹ️ product details
  },
  {
    key: "item-log",
    label: "Item Log",
    icon: ClipboardList, // 📋 history / logs
  },
  {
    key: "online-sold",
    label: "Online Sold",
    icon: ShoppingCart, // 🛒 sales
  },
  {
    key: "transfer-to-franchise",
    label: "Transfer To Franchise",
    icon: Truck, // 🚚 stock transfer
  },
];
export const hideColumnListInProduct = {
  transferStock: {
    list: [
      {
        label: "Created On",
        name: "created_at"
      },
      {
        label: "Store",
        name: "franchise"
      },
      {
        name: "transfer_id",
        label: "Transfer ID",
      },
      {
        name: "transferred_qty",
        label: "Transferred Qty",
      },
    ],
    actionShowedList: ['view']
  }
}
export const hideColumnListInCustomer = {
  jobcard: {
    list: [
      {
        label: "Created On",
        name: "created_at"
      },
      {
        label: "JC No.",
        name: "job_card_number"
      },

      {
        label: "Service Date",
        name: "jobcard_date"
      },
      {
        label: "Type",
        name: "vehicle_type",
        type: "customer-custom",

      },

      {
        label: "Reg No./Chasis",
        name: "reg_no",
        type: "customer-custom",
      },
      {
        label: "Status",
        name: "status"
      },


    ],
    actionShowedList: ['print', 'edit', 'delete', 'print', 'download']
  },
  invoice: {
    list: [
      {
        label: "Created Date",
        name: "created_at",
      },
      {
        label: "Invoice No.",
        name: "invoice_number"
      },
      {
        name: "grand_total",
        label: "Amount",
      },
      {
        name: "total_due",
        label: " Due",
      },
      {
        name: "status",
        label: "Status"
      }
    ],
    actionShowedList: ['print', 'edit', 'delete', 'print', 'download']
  },
  payment: {
    list: [
      {
        label: "Created Date",
        name: "created_at",
      },
      {
        label: "Payment Date",
        name: "payment_date"
      },
      {
        name: "invoice_number",
        label: "Invoice No.",
      },
      {
        name: "status",
        label: "Status"
      }
    ],
    actionShowedList: []
  },
}

export const appointmentMockData = [
  {
    id: 1,
    created_at: "2026-02-01T10:15:00",

    title: "Ceramic Coating",

    consumer: {
      id: 101,
      name: "Rahul Sharma",
      phone: "9876543210",
    },

    store: {
      id: 1,
      name: "Andheri Studio",
    },

    appointment_type: "service",

    scheduled_at: "2026-02-02T10:30:00",
    estimated_duration: 150,

    status: "pending",
    priority: "normal",

    vehicle: {
      company: "Honda",
      model: "City",
      reg_no: "MH12AB1234",
    },

    estimated_value: 12000,
  },

  {
    id: 2,
    created_at: "2026-02-01T11:40:00",

    title: "Paint Inspection",

    consumer: {
      id: 102,
      name: "Amit Verma",
      phone: "9988776655",
    },

    store: {
      id: 1,
      name: "Andheri Studio",
    },

    appointment_type: "inspection",

    scheduled_at: "2026-02-02T11:00:00",
    estimated_duration: 60,

    status: "confirmed",
    priority: "urgent",

    vehicle: {
      company: "Hyundai",
      model: "Creta",
      reg_no: "MH14XY8899",
    },

    estimated_value: 2500,
  },

  {
    id: 3,
    created_at: "2026-02-01T12:05:00",

    title: "Full Body Wash",

    consumer: {
      id: 103,
      name: "Neha Kapoor",
      phone: "9123456789",
    },

    store: {
      id: 2,
      name: "Bandra Studio",
    },

    appointment_type: "service",

    scheduled_at: "2026-02-02T12:30:00",
    estimated_duration: 45,

    status: "confirmed",
    priority: "critical",

    vehicle: {
      company: "BMW",
      model: "X5",
      reg_no: "MH01BM4321",
    },

    estimated_value: 5000,
  },
];

