import {
  ShoppingCart,
  Activity,
  CreditCard,
  Package,
  BarChart3,
  Users,
  Receipt,
  AlertTriangle,
  Calendar,
} from "lucide-react";

export const vehicleListInfo = {
  data: [
    {
      id: 1,
      company: "HYUNDAI",
      model: ["Creta", "i20", "Verna"],
    },
    {
      id: 2,
      company: "TATA",
      model: ["Nexon", "Harrier", "Safari"],
    },
    {
      id: 3,
      company: "MARUTI",
      model: ["Swift", "Baleno", "Brezza"],
    },
    {
      id: 4,
      company: "HONDA",
      model: ["City", "Amaze"],
    },
  ],
  meta: {
    current_page: 1,
    per_page: 2,
    last_page: 2,
    total: 4,
    from: 1,
    to: 10,
    has_next: true,
  },
};
export const servicePlanMockResponse = {
  data: [
    {
      id: 1,
      date_created: "2024-04-10",
      vehicle_type: "Sedan",
      invoice_name: "invoice",

      plan_name: "Bonnet Coating",
      category_type: "Bonnet Protection",
      number_of_visits: 1,
      sac: "9997",
      warranty_period: "1",
      warranty_in: "months",

      price: 2000,
      gst: 18,
      duration: "6 Month",
      description: "Ceramic coating of bonnet of the car",
      raw_materials: ["PERFECTION FLUID"],
      status: "0",
    },
    {
      id: 2,
      date_created: "2024-04-10",
      vehicle_type: "Sedan",
      invoice_name: "invoice",

      plan_name: "Bonnet Coating",
      category_type: "Bonnet Protection",
      number_of_visits: 1,
      sac: "9997",
      warranty_period: "1",
      warranty_in: "months",

      price: 2000,
      gst: 18,
      duration: "12 Month",
      description: "Complete ceramic coating for full car body",
      raw_materials: ["PERFECTION FLUID", "NANO SHIELD"],
      status: "1",
    },
    {
      id: 3,
      date_created: "2024-04-10",
      vehicle_type: "Sedan",
      invoice_name: "invoice",

      plan_name: "Bonnet Coating",
      category_type: "Bonnet Protection",
      number_of_visits: 1,
      sac: "9997",
      warranty_period: "1",
      warranty_in: "months",

      price: 2000,
      gst: 18,
      duration: "3 Month",
      description: "Deep interior cleaning and protection",
      raw_materials: ["INTERIOR FOAM", "LEATHER CONDITIONER"],
      status: "1",
    },
  ],
  meta: {
    current_page: 1,
    per_page: 10,
    last_page: 1,
    total: 3,
    from: 1,
    to: 3,
    has_next: false,
  },
};
export const vehicleType = [
  {
    name: "Sedan",
    id: "Sedan"
  },
  {
    name: "Hatchback",
    id: "Hatchback"
  },
  {
    name: "SUV",
    id: "SUV"
  },
]
export const planName = [
  {
    name: "Full Body Coating",
    id: "Full Body Coating"
  },
  {
    name: "Interior Detailing",
    id: "Interior Detailing"
  },
  {
    name: "Bonnet Coating",
    id: "Bonnet Coating"
  },
]
export const categoryType = [
  {
    name: "Interior Care",
    id: "Interior Care"
  },
  {
    name: "Body Protection",
    id: "Body Protection"
  },
  {
    name: "Bonnet Protection",
    id: "Bonnet Protection"
  },
]
export const warrantyPeriod = [
  {
    name: "1",
    id: "1"
  },
  {
    name: "2",
    id: "2"
  },
  {
    name: "3",
    id: "3"
  },
  {
    name: "4",
    id: "4"
  },
]
export const warrantyType = [
  {
    name: "Month",
    id: "months"
  },
  {
    name: "Year",
    id: "years"
  },
]
export const numberOfVisit = [
  {
    name: "1",
    id: "1"
  },
  {
    name: "2",
    id: "2"
  },
  {
    name: "3",
    id: "3"
  },
  {
    name: "4",
    id: "4"
  },
]
export const organizationMockData = {
  data: [
    {
      id: 1,
      created_at: "2024-03-20T10:15:00",

      /* ================= BASIC INFO ================= */
      company_name: "Coating Daddy Pvt. Ltd",
      company_name_in_bank: "Coating Daddy Private Limited",
      email: "sales@coatingdaddy.com",
      company_address:
        "B 14-15, Block B, Sector 1, Noida, Uttar Pradesh 201301",

      /* ================= BANK DETAILS ================= */
      bank_name: "IDBI Bank",
      account_no: "123456789012",
      account_type: "Current",
      ifsc_code: "IBKL0000123",
      branch_name: "Noida Sector 1",
      bank_address:
        "IDBI Bank, Sector 1, Noida, Uttar Pradesh 201301",

      /* ================= TAX DETAILS ================= */
      gstin: "07AAGCC8962J1Z6",
      pan_no: "AAGCC8962J",
      aadhar_no: "",

      /* ================= INVOICE ================= */
      invoice_prefix: "CD/PP",
      service_prefix: "CD/SS",

      /* ================= LOCATION ================= */
      country: "India",

      state: "Uttar Pradesh",
      city: "Noida",
      district: "Gautam Buddha Nagar",
      pincode: "201301",

      /* ================= FILE ================= */
      document: "",

      /* ================= STATUS ================= */
      status: 1,
    },

    {
      id: 2,
      created_at: "2024-03-06T14:40:00",

      company_name: "DETAILING DEVILS INDIA PRIVATE LIMITED",
      company_name_in_bank: "Detailing Devils India Pvt Ltd",
      email: "sales@detailingdevils.com",
      company_address:
        "D-50, Sector 2, Noida, Gautam Buddha Nagar, Uttar Pradesh 201301",

      bank_name: "Axis Bank Ltd.",
      account_no: "987654321098",
      account_type: "Current",
      ifsc_code: "UTIB0000456",
      branch_name: "Sector 18 Noida",
      bank_address:
        "Axis Bank, Sector 18, Noida, Uttar Pradesh 201301",

      gstin: "09AAGCD3480N1Z6",
      pan_no: "AAGCD3480N",
      aadhar_no: "",

      invoice_prefix: "DD/CCN",
      service_prefix: "DD/SSN",

      country: "India",
      state: "Uttar Pradesh",
      city: "Noida",
      district: "Gautam Buddha Nagar",
      pincode: "201301",

      document: "",
      status: 1,
    },

    {
      id: 3,
      created_at: "2024-03-06T09:25:00",

      company_name: "Detailing Devils India Pvt. Ltd.",
      company_name_in_bank: "Detailing Devils India Pvt Ltd",
      email: "sales@detailingdevils.com",
      company_address:
        "A-110, Sector 83, Phase 2, Noida, Gautam Buddha Nagar, Uttar Pradesh 201305",

      bank_name: "Axis Bank Ltd.",
      account_no: "112233445566",
      account_type: "Current",
      ifsc_code: "UTIB0000789",
      branch_name: "Sector 83 Noida",
      bank_address:
        "Axis Bank, Sector 83, Noida, Uttar Pradesh 201305",

      gstin: "09AAGCD3480N1Z6",
      pan_no: "AAGCD3480N",
      aadhar_no: "123412341234",

      invoice_prefix: "DD/CC",
      service_prefix: "DD/SS",

      country: "India",
      state: "Uttar Pradesh",
      city: "Noida",
      district: "Gautam Buddha Nagar",
      pincode: "201305",

      document: "",
      status: 1,
    },
  ],

  meta: {
    current_page: 1,
    per_page: 10,
    last_page: 1,
    total: 3,
    from: 1,
    to: 3,
    has_next: false,
  },
};

export const FRANCHISES = [
  { value: "north", label: "North Franchise" },
  { value: "south", label: "South Franchise" },
];

export const territoryMasterMockData = {
  data: [{
    "id": 86,
    "location_name": "DD NOIDA SECTOR 70",
    "assigned_franchise_id": 78,
    "country_id": "India",
    "state": ["Uttar Pradesh"],
    "city":[' Sec 16 Noida',' Sec37 Noida',] ,
    "created_at": "2024-05-14T12:17:51.000000Z",
  },
  {
       "id": 84,
    "location_name": "DD NOIDA SECTOR 70",
    "assigned_franchise_id": 78,
    "country_id": "India",
    "state": ["Uttar Pradesh"],
    "city":[' Sec 16 Noida',' Sec37 Noida',] ,
    "created_at": "2024-05-14T12:17:51.000000Z",
  },],

  meta: {
    current_page: 1,
    per_page: 10,
    last_page: 1,
    total: 3,
    from: 1,
    to: 3,
    has_next: false,
  },
}
export const countryOptions = [
  { value: "IN", label: "India" },
];

export const stateOptions = [
  { value: "UP", label: "Uttar Pradesh" },
  { value: "DL", label: "Delhi" },
  { value: "MH", label: "Maharashtra" },
];

export const cityOptions = [
  { value: "NOIDA", label: "Noida" },
  { value: "DELHI", label: "Delhi" },
  { value: "MUMBAI", label: "Mumbai" },
];

export const franchiseTableMockData = {
  data: [
    {
      id: 101,
      created_at: "2025-01-15T10:30:00Z",

      store_name: "Detailing Devils – Noida Sector 62",
      email: "rahul.verma@detailingdevils.com",
      phone: "+91-9876543210",
      location_name: "Noida Sector 62",

      country: "India",
      address:
        "B 14-15, Block B, Sector 1, Noida, Uttar Pradesh 201301",

      state: "Uttar Pradesh",
      city: "Noida",
      pincode: "201309",

      gst_number: "09AAGCD3480N1Z6",
      pan_number: "AAGCD3480N",

      opening_date: "2024-06-15",

      invoice_prefix: "DD-N62",
      agreement_file: "documents/agreement/franchise_agreement.pdf",

      status: 1,
      registration_file: "documents/company/registration_cert.pdf",
      cancelled_cheque: "documents/company/cancelled_cheque.webp",

    },

    {
      id: 102,
      created_at: "2025-02-03T12:10:00Z",

      store_name: "Detailing Devils – Gurugram DLF Phase 3",
      email: "amit.sharma@detailingdevils.com",
      phone: "+91-9811122233",
      location_name: "DLF Phase 3",

      country: "India",
      address:
        "B 14-15, Block B, Sector 1, Noida, Uttar Pradesh 201301",

      state: "Haryana",
      city: "Gurugram",
      pincode: "122002",

      gst_number: "06AAGCD5678R1Z2",
      pan_number: "AAGCS5678R",

      opening_date: "2024-08-01",

      invoice_prefix: "DD-GGM",

      status: 1,
      agreement_file: "documents/agreement/franchise_agreement.pdf",
      registration_file: "documents/company/registration_gurgaon.pdf",
      cancelled_cheque: "documents/company/cancelled_cheque.webp",


    },

    {
      id: 103,
      created_at: "2025-03-12T09:45:00Z",

      store_name: "Detailing Devils – Pune Baner",
      email: "sneha.k@detailingdevils.com",
      phone: "+91-9898989898",
      location_name: "Baner",

      country: "India",
      address:
        "B 14-15, Block B, Sector 1, Noida, Uttar Pradesh 201301",

      state: "Maharashtra",
      city: "Pune",
      pincode: "411045",

      gst_number: "27AAGCD1122M1Z9",
      pan_number: "AAGCK1122M",

      opening_date: "2024-11-20",

      invoice_prefix: "DD-PUNE",

      status: 0, // Inactive
      registration_file: "documents/company/registration_pune.pdf",
      cancelled_cheque: "documents/company/cancelled_cheque.webp",
      agreement_file: "documents/agreement/franchise_agreement.pdf",


    },
  ],

  meta: {
    current_page: 1,
    per_page: 10,
    last_page: 1,
    total: 3,
    from: 1,
    to: 3,
    has_next: false,
  },
};
/* ================= DUMMY DATA ================= */
export const metrics = {
  todayRevenue: 45280,
  servicesCompleted: 18,
  customerSatisfaction: 4.6,
};

export const counts = {
  activeJobs: 7,
  readyPickup: 3,
  billingPending: 2,
  criticalStock: 2,
  expiringSoon: 4,
};

export const tiles = [
  {
    id: "new-sale",
    title: "New Sale",
    icon: ShoppingCart,
    color: "bg-gradient-to-br from-emerald-500 to-emerald-700",
    description: "Start new service",
  },
  {
    id: "workflow",
    title: "Workflow Board",
    icon: Activity,
    color: "bg-gradient-to-br from-blue-500 to-blue-700",
    badge: counts.activeJobs,
    description: "Active jobs",
  },
  {
    id: "pickup",
    title: "Ready for Pickup",
    icon: CreditCard,
    color: "bg-gradient-to-br from-green-500 to-green-700",
    badge: counts.readyPickup,
    description: "Completed jobs",
  },
  {
    id: "billing",
    title: "Billing",
    icon: Receipt,
    color: "bg-gradient-to-br from-amber-500 to-amber-700",
    badge: counts.billingPending,
    description: "Pending payments",
  },
  {
    id: "inventory",
    title: "Inventory",
    icon: Package,
    color: "bg-gradient-to-br from-indigo-500 to-indigo-700",
    badge: counts.criticalStock,
    description: "Stock overview",
  },
  {
    id: "critical",
    title: "Critical Stock",
    icon: AlertTriangle,
    color: "bg-gradient-to-br from-red-500 to-red-700",
    badge: counts.criticalStock,
    description: "Immediate attention",
  },
  {
    id: "expiring",
    title: "Expiring Soon",
    icon: Calendar,
    color: "bg-gradient-to-br from-orange-500 to-orange-700",
    badge: counts.expiringSoon,
    description: "Within 30 days",
  },
  {
    id: "customers",
    title: "Customers",
    icon: Users,
    color: "bg-gradient-to-br from-cyan-500 to-cyan-700",
    description: "Search customers",
  },
  {
    id: "reports",
    title: "Reports",
    icon: BarChart3,
    color: "bg-gradient-to-br from-purple-500 to-purple-700",
    description: "View analytics",
  },
];

export const mockNotifications = [
  {
    id: "1",
    title: "New Job Created",
    message: "A new job card was created for Customer John Doe",
    is_read: false,
    created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 min ago
    type: "job",
  },
  {
    id: "2",
    title: "Payment Pending",
    message: "Invoice #INV-1023 is awaiting payment",
    is_read: false,
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 min ago
    type: "billing",
  },
  {
    id: "3",
    title: "Low Inventory Alert",
    message: "Brake cleaner stock is below minimum threshold",
    is_read: true,
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hrs ago
    type: "inventory",
  },
  {
    id: "4",
    title: "Service Completed",
    message: "Job #JB-883 is ready for pickup",
    is_read: true,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // yesterday
    type: "job",
  },
];
export const customerMockData = [
  {
    id: 1,
    created_at: "2025-04-15T18:08:00",
    created_by: "Detailing Devils",
    name: "test dd",
    mobile_no: "9643147619",
    vehicle_type: "Luxury Hatchback",
    interested_in: "others",
    source: "Other",
    address: "fewefef",
  },
  {
    id: 2,
    created_at: "2024-09-04T11:22:00",
    created_by: "Rajat Ahooja",
    name: "Devil Admin1 User 2",
    mobile_no: "8468941555",
    vehicle_type: "Hatchback",
    interested_in: "others",
    source: "Other",
    address: "fewefef",
  },
  {
    id: 3,
    created_at: "2024-06-19T10:45:00",
    created_by: "Rajat Ahooja",
    name: "Sachin Mishra",
    mobile_no: "8467854321",
    vehicle_type: "Luxury Hatchback",
    interested_in: "others",
    source: "Other",
    address: "D-50 Sector-2 Noida",
  },
  {
    id: 4,
    created_at: "2024-06-18T09:30:00",
    created_by: "Rajat Ahooja",
    name: "rajat ahooja",
    mobile_no: "9953523952",
    vehicle_type: "Hatchback",
    interested_in: "others",
    source: "Other",
    address: "265 INDRA VIHAR",
  },
  {
    id: 5,
    created_at: "2024-06-18T09:10:00",
    created_by: "Rajat Ahooja",
    name: "Amit Mishra",
    mobile_no: "9250543443",
    vehicle_type: "Luxury Sedan",
    interested_in: "others",
    source: "Other",
    address: "D-50 Sector-2 Noida",
  },
];
export const jobCardMockData = [
  {
    id: 1,
    created_at: "2026-01-07T10:25:00",
    created_by: "Rajat Ahooja",

    job_card_date: "2026-01-13",

    name: "Detailing Devils ss",
    mobile_no: "6647123413",

    vehicle_category: "Luxury Mini SUV",
    vehicle_type: "Mini SUV",
    brand: "HYUNDAI",
    car_model: "CRETA",

    service_plan:
      "Front Bumper Coating, Front Right Door Coating",

    registration_no: "WQDWE12",
    job_card_no: "#172509",

    status: "open",
    invoice_no: null,
  },

  {
    id: 2,
    created_at: "2026-01-07T12:10:00",
    created_by: "Detailing Devils",

    job_card_date: "2026-01-07",

    name: "Jatin Chopra",
    mobile_no: "+917290004718",

    vehicle_category: "Mini SUV",
    vehicle_type: "Mini SUV",
    brand: "HYUNDAI",
    car_model: "i20",

    service_plan: "Boot Coating",

    registration_no: "WQDWE12",
    job_card_no: "#346905",

    status: "open",
    invoice_no: null,
  },

  {
    id: 3,
    created_at: "2025-12-09T09:30:00",
    created_by: "Rajat Ahooja",

    job_card_date: "2025-12-09",

    name: "Jatin Chopra",
    mobile_no: "+917290004718",

    vehicle_category: "Luxury SUV",
    vehicle_type: "SUV",
    brand: "HYUNDAI",
    car_model: "i20",

    service_plan:
      "Boot Coating, Bonnet Coating, Rear Bumper Coating",

    registration_no: "WQDWE12",
    job_card_no: "#309703",

    status: "open",
    invoice_no: "CO/25-26/1",
  },

  {
    id: 4,
    created_at: "2025-04-15T15:40:00",
    created_by: "Detailing Devils",

    job_card_date: "2025-04-15",

    name: "Test DD",
    mobile_no: "9643147619",

    vehicle_category: "Luxury Hatchback",
    vehicle_type: "Hatchback",
    brand: "BMW",
    car_model: "X2",

    service_plan: "Rear Left Door Coating",

    registration_no: "ABCDG45688",
    job_card_no: "#328671",

    status: "open",
    invoice_no: "CO/25-26/2",
  },

  {
    id: 5,
    created_at: "2024-10-28T11:00:00",
    created_by: "Rajat Ahooja",

    job_card_date: "2024-10-28",

    name: "Nripesh Mishra",
    mobile_no: "8468941555",

    vehicle_category: "Bike",
    vehicle_type: "Bike",
    brand: "HYUNDAI",
    car_model: "VERNA",

    service_plan: "Armor Absolute",

    registration_no: "DL-8468944",
    job_card_no: "#285904",

    status: "open",
    invoice_no: null,
  },

  {
    id: 6,
    created_at: "2024-09-04T16:20:00",
    created_by: "Rajat Ahooja",

    job_card_date: "2024-09-04",

    name: "Devil Admin1 User 2",
    mobile_no: "8468941555",

    vehicle_category: "Hatchback",
    vehicle_type: "Hatchback",
    brand: "HYUNDAI",
    car_model: "VERNA",

    service_plan: "Front Bumper Coating",

    registration_no: "ABCDG456887777",
    job_card_no: "#114216",

    status: "cancel",
    invoice_no: null,
  },

  {
    id: 7,
    created_at: "2024-07-10T14:00:00",
    created_by: "Rajat Ahooja",

    job_card_date: "2024-07-15",

    name: "Mishra Nripesh",
    mobile_no: "8468941554",

    vehicle_category: "Hatchback",
    vehicle_type: "Hatchback",
    brand: "HYUNDAI",
    car_model: "VERNA",

    service_plan: "Boot Coating",

    registration_no: "ABCDG456887777",
    job_card_no: "#244656",

    status: "open",
    invoice_no: "CO/24-25/9",
  },
];
export const invoiceMockData = [
  {
    id: 1,
    created_at: "2025-04-15T16:29:00",
    created_by: "Detailing Devils",
    consumer: "test dd",
    invoice_no: "CO/25-26/2",

    amount: 2006,
    grand_total: 2006,
    paid_amount: 0,
    balance_due: 2006,
    total_due: 2006,

    received_amount: 0,
    net_amount: 0,

    payment_mode: "",
    payment_date: "",
    tax_deducted: "no",
    withholding_tax: 0,

    payment_status: "Pending",
    note: "",
  },
  {
    id: 2,
    created_at: "2025-12-09T15:24:00",
    created_by: "Rajat Ahooja",
    consumer: "Jatin Chopra",
    invoice_no: "CO/25-26/1",

    amount: 11275,
    grand_total: 11275,
    paid_amount: 0,
    balance_due: 11275,
    total_due: 11275,

    received_amount: 0,
    net_amount: 0,

    payment_mode: "",
    payment_date: "",
    tax_deducted: "no",
    withholding_tax: 0,

    payment_status: "Pending",
    note: "",
  },
  {
    id: 3,
    created_at: "2024-07-10T16:03:00",
    created_by: "Rajat Ahooja",
    consumer: "Mishra Nripesh",
    invoice_no: "CO/24-25/9",

    amount: 1770,
    grand_total: 1770,
    paid_amount: 0,
    balance_due: 1770,
    total_due: 1770,

    received_amount: 0,
    net_amount: 0,

    payment_mode: "",
    payment_date: "",
    tax_deducted: "no",
    withholding_tax: 0,

    payment_status: "Pending",
    note: "",
  },
  {
    id: 4,
    created_at: "2024-06-18T17:35:00",
    created_by: "Rajat Ahooja",
    consumer: "AB C",
    invoice_no: "CO/24-25/8",

    amount: 32450,
    grand_total: 32450,
    paid_amount: 32450,
    balance_due: 0,
    total_due: 0,

    received_amount: 0,
    net_amount: 32450,

    payment_mode: "bank",
    payment_date: "2024-06-18",
    tax_deducted: "no",
    withholding_tax: 0,

    payment_status: "Paid",
    note: "Full payment received",
  },
  {
    id: 5,
    created_at: "2024-06-18T18:29:00",
    created_by: "Rajat Ahooja",
    consumer: "Mishra Nripesh",
    invoice_no: "CO/24-25/7",

    amount: 118000,
    grand_total: 118000,
    paid_amount: 0,
    balance_due: 118000,
    total_due: 118000,

    received_amount: 0,
    net_amount: 0,

    payment_mode: "",
    payment_date: "",
    tax_deducted: "no",
    withholding_tax: 0,

    payment_status: "Pending",
    note: "",
  },
  {
    id: 6,
    created_at: "2024-06-19T13:48:00",
    created_by: "Rajat Ahooja",
    consumer: "Sachin Mishra",
    invoice_no: "CO/24-25/6",

    amount: 112100,
    grand_total: 112100,
    paid_amount: 0,
    balance_due: 112100,
    total_due: 112100,

    received_amount: 0,
    net_amount: 0,

    payment_mode: "",
    payment_date: "",
    tax_deducted: "no",
    withholding_tax: 0,

    payment_status: "Cancel",
    note: "Invoice cancelled",
  },
  {
    id: 7,
    created_at: "2024-06-18T19:17:00",
    created_by: "Rajat Ahooja",
    consumer: "rajat ahooja",
    invoice_no: "CO/24-25/5",

    amount: 1770,
    grand_total: 1770,
    paid_amount: 1770,
    balance_due: 0,
    total_due: 0,

    received_amount: 0,
    net_amount: 1770,

    payment_mode: "cash",
    payment_date: "2024-06-18",
    tax_deducted: "no",
    withholding_tax: 0,

    payment_status: "Paid",
    note: "Cash received",
  },
  {
    id: 8,
    created_at: "2024-06-18T18:52:00",
    created_by: "Rajat Ahooja",
    consumer: "Amit Mishra",
    invoice_no: "CO/24-25/4",

    amount: 127440,
    grand_total: 127440,
    paid_amount: 127440,
    balance_due: 0,
    total_due: 0,

    received_amount: 0,
    net_amount: 127440,

    payment_mode: "upi",
    payment_date: "2024-06-18",
    tax_deducted: "yes",
    withholding_tax: 0,

    payment_status: "Paid",
    note: "UPI payment",
  },
  {
    id: 9,
    created_at: "2024-06-18T17:47:00",
    created_by: "Rajat Ahooja",
    consumer: "AB C",
    invoice_no: "CO/24-25/3",

    amount: 17700,
    grand_total: 17700,
    paid_amount: 17700,
    balance_due: 0,
    total_due: 0,

    received_amount: 0,
    net_amount: 17700,

    payment_mode: "bank",
    payment_date: "2024-06-18",
    tax_deducted: "no",
    withholding_tax: 0,

    payment_status: "Paid",
    note: "Settled",
  },
  {
    id: 10,
    created_at: "2024-06-14T16:12:00",
    created_by: "Rajat Ahooja",
    consumer: "Jatin Chopra",
    invoice_no: "CO/24-25/2",

    amount: 2950,
    grand_total: 2950,
    paid_amount: 1100,
    balance_due: 1850,
    total_due: 1850,

    received_amount: 0,
    net_amount: 1100,

    payment_mode: "cash",
    payment_date: "2024-06-14",
    tax_deducted: "no",
    withholding_tax: 0,

    payment_status: "Partially-Paid",
    note: "Advance received",
  },
];
export const invoicePlanMockData = [
  {
    id: 1,
    plan_name: "Front Right Door Coating",
    sac: "9997",
    visits: 1,
    price: 3000,
    discount_percent: 0,
    discount_amount: 0,
    sub_amount: 3000,
    igst_percent: 18,
    igst_amount: 540,
    total_amount: 3540,
  },
  {
    id: 2,
    plan_name: "Front Bumper Coating",
    sac: "9997",
    visits: 1,
    price: 3000,
    discount_percent: 32,
    discount_amount: 960,
    sub_amount: 2040,
    igst_percent: 18,
    igst_amount: 367.2,
    total_amount: 2407.2,
  },
];



export const invoiceViewMock = {
  invoice_no: "CO/25-26/2",
  status: "Open",
  customer: {
    bill_to: "Detailing Devils ss",
    name: "Detailing Devils ss",
    phone: "6647123413",
    email: "admin@pos.com",
    address: "124r35",
    adhar: "",
    panNo: "",
    gst: ""
  },
  vehicle: {
    type: "Luxury Mini SUV",
    make: "HYUNDAI",
    model: "CRETA",
    reg_no: "wqdqwe12",
    make_year: "2025",
    color: "Red",
    chassisNo: "",
    remark: ""

  },
  jobcard: {
    jobcard_date: "13-01-2026",
    edited_date: "07-01-2026 11:01 AM",
  },
  plans: [
    { id: 1, name: "Front Right Door Coating", amount: 3540 },
    { id: 2, name: "Front Bumper Coating", amount: 2407 },
  ],
  images: [
    { id: 1, label: "Vehicle Front", url: "https://placehold.co/300x200" },
    { id: 2, label: "Vehicle Rear", url: "https://placehold.co/300x200" },
  ],
};
export const availablePlansMock = [
  {
    id: 101,
    plan_name: "Wheel Nano Armor",
    sac: "9997",
    visits: 1,
    price: 3000,
    discount_percent: 0,
    discount_amount: 0,
    sub_amount: 3000,
    igst_percent: 18,
    igst_amount: 540,
    total_amount: 3540,
  },
  {
    id: 102,
    plan_name: "Full Body Coating",
    sac: "9997",
    visits: 1,
    price: 15000,
    discount_percent: 0,
    discount_amount: 0,
    sub_amount: 15000,
    igst_percent: 18,
    igst_amount: 2700,
    total_amount: 17700,
  },
];
export const mockProducts = [
  {
    id: 1,
    createdAt: "2025-01-10T10:15:00Z",
    visibility: 1,

    image: "https://picsum.photos/seed/brush/60/60",
    brand: "detailing-devils",
    category: "detailing-accessories",
    product: "Brush",
    hsn: "34021110",
    gst: 18,
    qty: 0,
    uom: "2 ML",
    salePrice: 32,
    purchasePrice: 222,
    type: "product",
    store: "all-franchise",
    description:"",
    tag: "regular",
    status: 1,

    onSell: 0,
    available: 0,
    totalQty: 0,
  },

  {
    id: 2,
    createdAt: "2025-01-12T14:40:00Z",
    visibility: 1,

    image: "https://picsum.photos/seed/armor/60/60",
    brand: "detailing-devils",
    category: "armor-kits",
    product: "Armor Composite",
    hsn: "34021110",
    gst: 18,
    description:"",
    qty: 50,
    uom: "100 ML",
    salePrice: 10000,
    purchasePrice: 5000,
    type: "composite",
    store: "all-franchise",
    tag: "regular",
    status: 1,

    onSell: 50,
    available: 4,
    totalQty: 50,
  },

  {
    id: 3,
    createdAt: "2025-01-15T09:25:00Z",
    visibility: 1,

    description:"test",
    image: "https://picsum.photos/seed/cleaner/60/60",
    brand: "detailing-devils",
    category: "cleaners",
    product: "Composite New 2",
    hsn: "CDOPP",
    gst: 28,
    qty: 25,
    uom: "1 Pkt",
    salePrice: 7689,
    purchasePrice: 43243,
    type: "composite",
    store: "all-franchise",
    tag: "new",
    status: 1,

    onSell: 25,
    available: 25,
    totalQty: 50,
  },

  {
    id: 4,
    createdAt: "2025-01-18T18:10:00Z",
    visibility: 1,

    description:"test",
    image: "https://picsum.photos/seed/brush2/60/60",
    brand: "detailing-devils",
    category: "brushes",
    product: "Composite Product 98",
    hsn: "CDOPP",
    gst: 26,
    qty: 40,
    uom: "34 Kg",
    salePrice: 4354353,
    purchasePrice: 545435,
    type: "product",
    store: "all-franchise",
    tag: "regular",
    status: 1,

    onSell: 3,
    available: 40,
    totalQty: 43,
  },
];


export const categoryOptions = [
  { label: "Armor Kits", value: "armor-kits" },
  { label: "Brushes", value: "brushes" },
  { label: "Cleaners", value: "cleaners" },
  { label: "Detailing Accessories", value: "detailing-accessories" },
];

export const brandOptions = [
  { label: "Coating Daddy", value: "coating-daddy" },
  { label: "Detailing Devils", value: "detailing-devils" },
];

export const storeOptions = [
  { label: "All Franchise", value: "all-franchise" },
  { label: "Red Carpet", value: "red-carpet" },
  { label: "Exclusive", value: "exclusive" },
];

export const productTagOptions = [
  { label: "New", value: "new" },
  { label: "Regular", value: "regular" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Best Seller", value: "best-seller" },
];

export const productTypeOptions = [
  { label: "Product", value: "product" },
  { label: "Composite", value: "composite" },
];

export const measurementTypeOptions = [
  { label: "Ltr", value: "ltr" },
  { label: "ML", value: "ml" },
  { label: "Kg", value: "kg" },
  { label: "Gm", value: "gm" },
];
// src/lib/mockData.ts
export const filterMetaInfo = {
  brand: [
    { label: "Detailing Devils", value: "Detailing Devils" },
    { label: "Coating Daddy", value: "Coating Daddy" },
  ],

  category: [
    { label: "Detailing Accessories", value: "Detailing Accessories" },
    { label: "Armor Kits", value: "Armor Kits" },
    { label: "Cleaners", value: "Cleaners" },
    { label: "Brushes", value: "Brushes" },
  ],

  type: [
    { label: "Product", value: "Product" },
    { label: "Composite", value: "Composite" },
  ],

  store: [
    { label: "Red Carpet", value: "RED-CARPET" },
  ],

  tag: [
    { label: "Regular", value: "regular" },
    { label: "Best Seller", value: "best-seller" },
    { label: "New", value: "new" },
    { label: "Upcoming", value: "upcoming" },
  ],

  status: [
    { label: "Active", value: 1 },
    { label: "Inactive", value: 0 },
  ],

  visibility: [
    { label: "Active", value: 1 },
    { label: "Inactive", value: 0 },
  ],
};
// src/lib/mockData.ts
export const productOverviewMock = {
  id: 101,

  category: {
    id: 5,
    name: "Cleaners",
  },

  brand: {
    id: 2,
    name: "Detailing Devils",
  },

  product: {
    name: "ALL PURPOSE CLEANER",
    image: "https://picsum.photos/seed/cleaner/120/120",
  },

  /* NEW FIELDS */
  hsn: "34021110",
  gst: 18, // %
  type: "product", // product | composite
  measurement: "1 Ltr",
  salePrice: 7689,
  purchasePrice: 43243,
  store: "all-franchise",
  tag: "regular",

  stock_summary: {
    in_stock: 199833927,
    on_sale: 0,
    total_in_stock: 199833927,
    total_sold: 1,
  },
};


export const transferProductsMockData = [
  {
    id: 1,
    created_at: "2026-01-24T10:30:00Z",
    created_by: "Detailing Devils",
    franchise: "DD Haldwani",
    store_id:6,
    phone: "7006885861",
    transfer_id: "#4",
    transferred_qty: 1,
    total_amount: 0,
  },
  {
    id: 2,
    created_at: "2024-10-01T12:15:00Z",
    created_by: "Detailing Devils",
    franchise: "DD Haldwani",
    phone: "9555695695",
    store_id:6,
    transfer_id: "#3",
    transferred_qty: 5,
    total_amount: 0,
  },
  {
    id: 3,
    created_at: "2024-09-28T09:45:00Z",
    created_by: "Detailing Devils",
    franchise: "DD Haldwani",
    phone: "9634647878",
    transfer_id: "#2",
    store_id:6,
    transferred_qty: 1,
    total_amount: 0,
  },
  {
    id: 4,
    created_at: "2024-09-28T09:20:00Z",
    created_by: "Detailing Devils",
    franchise: "DD Haldwani",
    phone: "7290004718",
    transfer_id: "#1",
    store_id:6,
    transferred_qty: 1,
    total_amount: 0,
  },
];
// mockTransferStockResponse.ts
export const mockTransferStockResponse = {
  id: 12,
  store: {
    id: "5",
    name: "DD Haldwani",
    phone: "9643147619",
    email: "dd-haldwani@gmail.com",
    state: { id: "7", name: "Delhi" },
    address: "SHOP NO- 1 2 3 & 4, SAI REGENCY, NH-33, BALIGUMA, P.S. MGM",
    shipping_address: "Test address",
  },

  organization: {
    id: "2",
    name: "Detailing Devils",
  },

  transfer_date: "2026-01-28",

  items: [
    {
      product_id: "4",
      product: "Composite Product 98",
      image: "https://picsum.photos/seed/brush2/60/60",
      uom: "34 Kg",
      available: 40,
      qty: 1,
      salePrice: 4354353,
    },
  ],
};
export const productItemLogMock = {
  total: 49,
  per_page: 10,
  current_page: 1,

  data: [
    {
      id: 1,
     
    created_at: "2024-09-28T09:45:00Z",
      updated_by: "Detailing Devils",
      uom: "1 Ltr",
      last_qty: 1099833927,
      updated_qty: -900000000,
      action: "stock_down",
      total_qty: 199833927,
      remark: "",
    },
    {
      id: 2,
     
    created_at: "2024-09-28T09:45:00Z",
      updated_by: "Detailing Devils",
      uom: "1 Ltr",
      last_qty: 1999833927,
      updated_qty: -900000000,
      action: "stock_down",
      total_qty: 1099833927,
      remark: "",
    },
    {
      id: 3,
     
    created_at: "2024-09-28T09:45:00Z",
      updated_by: "Detailing Devils",
      uom: "1 Ltr",
      last_qty: 2699833927,
      updated_qty: -700000000,
      action: "stock_down",
      total_qty: 1999833927,
      remark: "",
    },
    {
      id: 4,
     
    created_at: "2024-09-28T09:45:00Z",
      updated_by: "Detailing Devils",
      uom: "1 Ltr",
      last_qty: 10000,
      updated_qty: 3435678643,
      action: "stock_up",
      total_qty: 34356796543,
      remark: "Initial stock correction",
    },
  ],
};
