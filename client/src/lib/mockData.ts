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
