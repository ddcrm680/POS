import { z } from "zod";
import { serviceFormType, serviceMetaInfoType } from "./types";
export const CustomerSchema = z.object({
  id: z.string().uuid().default(() => crypto.randomUUID()),
  phoneNumber: z.string().max(15),
  fullName: z.string().max(100),
  email: z.string().max(100).email().optional().nullable(),
  whatsappConsent: z.boolean().default(false),
  vipStatus: z.boolean().default(false),
  lifetimeValue: z.string().default("0.00"),

  // Customer Segmentation & Demographics
  customerSegment: z.string().max(50).default("Regular"),
  customerSource: z.string().max(50).optional().nullable(),
  referredBy: z.string().max(100).optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().max(50).optional().nullable(),
  state: z.string().max(50).optional().nullable(),
  gstNumber: z.string().max(100).optional().nullable(),
  pincode: z.string().max(10).optional().nullable(),
  vehicleCount: z.number().int().default(0),
  preferredServiceDay: z.string().max(20).optional().nullable(),
  preferredServiceTime: z.string().max(20).optional().nullable(),

  // Communication & Marketing
  communicationPreferences: z.record(z.string(), z.boolean()).optional().nullable(),
  marketingConsent: z.boolean().default(false),
  lastContactDate: z.date().optional().nullable(),
  communicationHistory: z.array(z.any()).optional().nullable(),
  preferredLanguage: z.string().max(20).default("English"),
  socialMediaProfiles: z.record(z.string(), z.boolean()).optional().nullable(),
  marketingTags: z.array(z.string()).optional().nullable(),

  // Behavioral Analytics & AI Fields
  visitFrequency: z.string().max(20).optional().nullable(),
  averageServiceInterval: z.number().int().optional().nullable(),
  seasonalPattern: z.record(z.any(), z.any()).optional().nullable(),
  servicePreferences: z.record(z.any(), z.any()).optional().nullable(),
  priceSegment: z.string().max(20).default("Mid-range"),
  customerLifecycleStage: z.string().max(20).default("New"),
  churnRisk: z.string().default("0.0000"),
  nextServicePrediction: z.string().optional().nullable(),
  recommendedServices: z.array(z.any()).optional().nullable(),
  behaviorTags: z.array(z.string()).optional().nullable(),

  // Loyalty & Retention
  loyaltyPoints: z.number().int().default(0),
  loyaltyTier: z.string().max(20).default("Bronze"),
  totalServicesCount: z.number().int().default(0),
  customerSince: z.string().optional().nullable(),
  lastServiceDate: z.string().optional().nullable(),
  averageSpending: z.string().default("0.00"),
  totalSpent: z.string().default("0.00"),
  discountsAvailed: z.array(z.any()).optional().nullable(),
  specialOfferEligible: z.boolean().default(true),

  // Feedback & Quality
  averageRating: z.string().optional().nullable(),
  lastRating: z.string().optional().nullable(),
  feedbackHistory: z.array(z.any()).optional().nullable(),
  complaintsCount: z.number().int().default(0),
  complimentsCount: z.number().int().default(0),
  netPromoterScore: z.string().optional().nullable(),
  reviewsOnline: z.array(z.any()).optional().nullable(),

  // Business Intelligence
  customerValue: z.string().max(20).default("Medium"),
  retentionStatus: z.string().max(20).default("Retained"),
  acquisitionCost: z.string().default("0.00"),
  profitabilityScore: z.string().default("0.00"),
  crossSellOpportunities: z.array(z.any()).optional().nullable(),
  engagementLevel: z.string().max(20).default("Medium"),

  // AI-Ready Fields
  aiInsights: z.record(z.any(), z.any()).optional().nullable(),
  personalityProfile: z.record(z.any(), z.any()).optional().nullable(),
  predictiveMetrics: z.record(z.any(), z.any()).optional().nullable(),
  automationRules: z.record(z.any(), z.any()).optional().nullable(),
  sentimentAnalysis: z.record(z.any(), z.any()).optional().nullable(),

  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});


// Insert Schemas (for forms/API validation - omitting auto-generated fields)
export const InsertCustomerSchema = CustomerSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});


// Job Card Schema
export const JobCardSchema = z.object({
  id: z.string().max(20),
  customerId: z.string().uuid(),
  vehicleId: z.string().uuid(),
  jobCardNumber: z.number().int(),
  status: z.string().optional().nullable(),

  // Enterprise Service Information
  serviceType: z.string().max(50).optional().nullable(),
  serviceCategory: z.string().max(20).default("Basic"),
  priority: z.string().max(20).default("Normal"),
  serviceAdvisor: z.string().max(100).optional().nullable(),
  estimatedCompletionTime: z.string().optional().nullable(),
  actualCompletionTime: z.number().int().optional().nullable(),

  // Workflow and status
  serviceStatus: z.string().max(20).default("check-in"),
  paymentStatus: z.string().max(20).default("pending"),

  // Operations tracking
  keyTag: z.string().max(20).optional().nullable(),
  parkingLocation: z.string().max(50).optional().nullable(),
  promisedReadyAt: z.date().optional().nullable(),
  bayId: z.string().max(20).optional().nullable(),
  intakePhotos: z.array(z.string()).optional().nullable(),
  beforePhotos: z.array(z.string()).optional().nullable(),
  afterPhotos: z.array(z.string()).optional().nullable(),
  materialsAllocated: z.array(z.any()).optional().nullable(),

  // Enterprise Vehicle Information
  odometerReading: z.string().optional().nullable(),
  odometerPhotos: z.array(z.string()).optional().nullable(),
  vehicleCondition: z.string().optional().nullable(),
  existingDamage: z.array(z.any()).optional().nullable(),

  // Enterprise Customer Communication
  customerCommunicationPrefs: z.record(z.string(), z.boolean()).optional().nullable(),

  communicationLog: z.array(z.any()).optional().nullable(),
  specialInstructions: z.string().optional().nullable(),
  customerRequests: z.string().optional().nullable(),

  // SOP Checklist System
  sopChecklists: z.array(z.any()).optional().nullable(),
  sopProgress: z.string().default("0.00"),
  sopTemplateId: z.string().max(50).optional().nullable(),
  sopRequiredPhotos: z.number().int().default(0),
  sopCompletedPhotos: z.number().int().default(0),

  // Financial
  totalAmount: z.string().default("0.00"),
  finalAmount: z.string().default("0.00"),
  services: z.array(z.any()).optional().nullable(),
  addOnServices: z.array(z.any()).optional().nullable(),
  discountPercent: z.string().default("0.00"),
  discountAmount: z.string().default("0.00"),
  discountReason: z.string().max(100).optional().nullable(),
  cgst: z.string().default("0.00"),
  sgst: z.string().default("0.00"),
  materialCost: z.string().default("0.00"),
  laborCost: z.string().default("0.00"),

  // Enterprise Warranty & Quality
  warrantyPeriod: z.string().optional().nullable(),
  warrantyTerms: z.string().optional().nullable(),
  qualityRating: z.string().optional().nullable(),
  qualityNotes: z.string().optional().nullable(),
  customerSatisfactionRating: z.string().optional().nullable(),

  // Enterprise Tracking
  techniciansAssigned: z.array(z.object({
    id: z.string().optional(),
    name: z.string().optional().nullable(),
    role: z.string().optional().nullable(),
  })).optional().nullable(),
  timeTracking: z.array(z.any()).optional().nullable(),
  serviceHistoryReference: z.string().max(50).optional().nullable(),

  notes: z.string().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});


// Vehicle Schema
export const VehicleSchema = z.object({
  id: z.string().uuid().default(() => crypto.randomUUID()),
  customerId: z.string().uuid(),
  registrationNumber: z.string().max(20),
  make: z.string().max(50),
  model: z.string().max(50),
  currentOdometer: z.number().int().optional().nullable(),
  vehicleType: z.string().max(50),
  year: z.number().int(),
  color: z.string().max(30).default(""),
  fuelType: z.string().max(20).default("Petrol"),
  createdAt: z.date().default(() => new Date()),
});

export const InsertVehicleSchema = VehicleSchema.omit({
  id: true,
  createdAt: true,
});
// Zod schema (same as you had)
export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),

  password: z.string().min(8, "Password must be at least 8 characters").max(32, "Password must be at most 32 characters")

});


export const posJobSchema = z.object({
  // Customer fields
  customerName: z.string().min(1, "Customer name is required"),
  customerPhone: z.string().min(10, "Valid phone number required"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  // customerType: z.string().min(1, "Customer type is required"),

  // Vehicle fields
  vehicleMake: z.string().min(1, "Vehicle make is required"),
  vehicleModel: z.string().min(1, "Vehicle model is required"),
  vehicleColor: z.string().min(1, "Vehicle color is required"),
  registrationNumber: z.string().min(1, "Registration number is required"),

  // Job details
  selectedServices: z.array(z.string()).min(1, "At least one service must be selected"),
  discountPercent: z.string().optional(),
  notes: z.string().optional(),
  promisedReadyAt: z.string().min(1, "Promised ready time is required"),
});


export const profileSchema = z.object({
  fullName: z.string()
    .nonempty("Full Name is required")        // triggers when empty: ""
    .min(3, "Full Name must be at least 3 characters").
    max(50, "Full Name must be at most 50 characters")
  ,
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  phoneNumber: z
    .string()
    .nonempty("Phone number is required")
    .min(10, "Phone number must be of 10 characters")
    .regex(/^\d{10}$/, "Enter a valid 10-digit phone number"),
  // keep avatar optional — we send as multipart if present
});
export const userSchema = (mode: "create" | "edit" | "view") =>
  z.object({
    name: z
      .string()
      .trim()
      .min(3, "Full name must be at least 3 characters")
      .max(50, "Full name must not exceed 50 characters"),

    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),

    phone: z
      .string()
      .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),

    password:
      mode === "create"
        ? z
          .string()
          .min(8, "Password must be at least 8 characters")
          .max(32, "Password must not exceed 32 characters")
          .superRefine(passwordStrength)
        : z
          .string()
          .optional()
          .refine(
            (val) => {
              return !val || val.length >= 8
            },
            "Password must be at least 8 characters"
          )
          .refine(
            (val) => !val || val.length <= 32,
            "Password must not exceed 32 characters"
          )
          .superRefine((val, ctx) => {
            if (val) passwordStrength(val, ctx);
          }),

    role_id: z
      .coerce
      .number({
        invalid_type_error: "Role is required",
      })
      .refine(
        (val) => val !== 0 && val !== -1,
        { message: "Please select a role" }
      ),

    address: z
      .string()
      .trim()
      .min(10, "Address must be at least 10 characters")
      .max(300, "Address must not exceed 300 characters")
      .optional()
      .or(z.literal("")),

  });

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(8, "Current password must be at least 8 characters").max(32, "Current password must be at most 32 characters")
      .superRefine((val, ctx) => {
        const regex = {
          lowercase: /[a-z]/,
          uppercase: /[A-Z]/,
          number: /[0-9]/,
          special: /[^A-Za-z0-9]/,
        };

        if (
          !regex.lowercase.test(val) ||
          !regex.uppercase.test(val) ||
          !regex.number.test(val) ||
          !regex.special.test(val)
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "Current password must include uppercase, lowercase, number, and special character",
          });
        }
      }),
    newPassword: z.string().min(8, "New password must be at least 8 characters").max(32, "New password must be at most 32 characters")
      .superRefine((val, ctx) => {
        const regex = {
          lowercase: /[a-z]/,
          uppercase: /[A-Z]/,
          number: /[0-9]/,
          special: /[^A-Za-z0-9]/,
        };

        if (
          !regex.lowercase.test(val) ||
          !regex.uppercase.test(val) ||
          !regex.number.test(val) ||
          !regex.special.test(val)
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "New password must include uppercase, lowercase, number, and special character",
          });
        }
      }),
    confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters").max(32, "Confirm password must be at most 32 characters")
      .superRefine((val, ctx) => {
        const regex = {
          lowercase: /[a-z]/,
          uppercase: /[A-Z]/,
          number: /[0-9]/,
          special: /[^A-Za-z0-9]/,
        };

        if (
          !regex.lowercase.test(val) ||
          !regex.uppercase.test(val) ||
          !regex.number.test(val) ||
          !regex.special.test(val)
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "Confirm password must include uppercase, lowercase, number, and special character",
          });
        }
      }),
  })
  .superRefine((vals, ctx) => {
    if (vals.newPassword !== vals.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });


export const passwordStrength = (val: string, ctx: z.RefinementCtx) => {
  const regex = {
    lowercase: /[a-z]/,
    uppercase: /[A-Z]/,
    number: /[0-9]/,
    special: /[^A-Za-z0-9]/,
  };

  if (
    !regex.lowercase.test(val) ||
    !regex.uppercase.test(val) ||
    !regex.number.test(val) ||
    !regex.special.test(val)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "Password must include uppercase, lowercase, number, and special character",
    });
  }
};
export const servicePlanSchema = (serviceMetaInfo: serviceMetaInfoType) =>
  z.object({
    vehicle_type: z.string().min(1, "Please select vehicle type")
      .refine((val) => {
        // predefined value → always valid
        if (serviceMetaInfo.vehicleTypes.find(item => item.value === val)) {
          return true;
        }

        // custom value → length between 3 and 150
        return val.length >= 3 && val.length <= 150;
      }, {
        message: "Custom vehicle type must be between 3 and 150 characters",
      }),

    category_type: z.string().min(1, "Please select category type")
      .refine((val) => {
        // predefined value → always valid
        if (serviceMetaInfo.categoryTypes.find(item => item.value === val)) {
          return true;
        }

        // custom value → length between 3 and 150
        return val.length >= 3 && val.length <= 150;
      }, {
        message: "Custom category type must be between 3 and 150 characters",
      }),

    plan_name: z
      .string()
      .min(1, "Please select plan name")
      .refine((val) => {
        // predefined value → always valid
        if (serviceMetaInfo.servicePlans.find(item => item.value === val)) {
          return true;
        }

        // custom value → length between 3 and 150
        return val.length >= 3 && val.length <= 150;
      }, {
        message: "Custom plan name must be between 3 and 150 characters",
      }),
    invoice_name: z
      .string()
      .trim()
      .min(3, "Invoice name must be at least 3 characters")
      .max(150, "Invoice name must not exceed 150 characters")
      .regex(/^[a-zA-Z0-9\s]+$/, "Only letters and numbers allowed"),


    number_of_visits: z.string().min(1, "Please select number of visit"),

    price: z
      .coerce
      .number()
      .min(0, "Price cannot be negative"),

    sac: z
      .string()
      .max(20, "Sac must not exceed 20 characters")
      .nullable()
      .optional()
      .transform((v) => v ?? undefined),

    description: z
      .string().max(200, "Description must not exceed 200 characters").nullable()
      .optional()
      .transform((v) => v ?? undefined),

    gst: z
      .coerce
      .number()
      .min(0, "GST cannot be negative")
      .max(100, "GST cannot exceed 100")
    // .optional(),
    ,
    warranty_period: z.string().min(1, "Please select warranty period"),

    warranty_in: z.enum(["months", "years"], {
      required_error: "Warranty type is required",
    }),



    raw_materials: z
      .array(
        z
          .string()
          .trim()
          .max(100, "Raw material must not exceed 100 characters")
      )
      .optional(),

  });

export const organizationSchema = z.object({
  company_name: z
    .string()
    .trim()
    .min(5, "Company name must be at least 5 characters")
    .max(100, "Company name must not exceed 100 characters"),

  company_name_in_bank: z
    .string()
    .trim()
    .min(5, "Company name in bank must be at least 5 characters")
    .max(100, "Company name in bank must not exceed 100 characters"),

  email: z
    .string()
    .min(1, "Email is required")
    .trim()
    .email("Please enter a valid email address"),

  bank_name: z
    .string()
    .min(1, "Bank name is required")
    .trim()
    .min(3, "Bank name must be at least 3 characters")
    .max(100, "Bank name must not exceed 100 characters"),

  account_no: z
    .string()
    .min(1, "Account number is required")
    .regex(/^\d{9,18}$/, "Account number must be between 9 and 18 digits"),

  account_type: z
    .string()
    .trim()
    .max(100, "Account type must not exceed 100 characters")
    .optional()
    .or(z.literal("")),

  ifsc_code: z
    .string()
    .min(1, "IFSC code is required")
    .regex(
      /^[A-Z]{4}0[A-Z0-9]{6}$/,
      "Invalid IFSC code format (e.g. SBIN0001234)"
    ),

  branch_name: z
    .string()
    .trim()
    .max(100, "Branch name must not exceed 100 characters")
    .optional()
    .or(z.literal("")),

  bank_address: z
    .string()
    .trim()
    .min(10, "Bank address must be at least 10 characters")
    .max(200, "Bank address must not exceed 200 characters"),

  company_gstin: z
    .string()
    .min(1, "Company GSTIN is required")
    .regex(
      /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$/,
      "Invalid GSTIN format"
    ),

  company_pan_no: z
    .string()
    .min(1, "PAN number is required")
    .regex(
      /^[A-Z]{5}\d{4}[A-Z]$/,
      "Invalid PAN number format (e.g. ABCDE1234F)"
    ),

  aadhar_no: z
    .string()
    .regex(
      /^\d{12}$/,
      "Aadhaar number must be exactly 12 digits"
    )
    .optional()
    .or(z.literal("")),

  invoice_prefix: z
    .string()
    .trim()
    .min(1, "Invoice prefix must be at least 1 characters")
    .max(10, "Invoice prefix must not exceed 10 characters")
  ,

  service_prefix: z
    .string()
    .trim()
    .min(1, "Service prefix must be at least 1 characters")
    .max(10, "Service prefix must not exceed 10 characters")
  ,

  country: z.string().min(1, "Please select country"),
  state: z.string().min(1, "Please select state"),
  city: z.string().min(1, "Please select city"),
  district: z.string().min(2, "District must be at least 2 characters")
    .max(100, "District must not exceed 100 characters"),
  pin_code: z
    .string()
    .min(1, "Pincode is required")
    .regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),

  org_address: z
    .string()
    .trim()
    .min(10, "Company address must be at least 10 characters")
    .max(200, "Company address must not exceed 200 characters"),

  org_image: z.union(
    [
      z
        .instanceof(File)
        .refine(
          file =>
            file.size <= 1 * 1024 * 1024 &&
            ["image/jpg", "image/jpeg", "image/png", "image/webp"].includes(file.type),
          {
            message: "File must be JPG, JPEG, PNG or WEBP and size must be 1MB or less",
          }
        )
      ,
      z.string().min(1, "Organization logo is required"),
    ],
    {
      required_error: "Organization logo is required",
    }
  ),
});
const fileOrPath = z.union([
  z
    .instanceof(File)
    .refine(
      f =>
        ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"].includes(
          f.type
        ),
      { message: "Only JPG, JPEG, PNG, WEBP or PDF allowed" }
    )
    .refine(f => f.size <= 2 * 1024 * 1024, {
      message: "File must be 2MB or less",
    })
    ,
  z.string(),
]);
export const StoreSchema = z.object({
  name: z
    .string()
    .trim()
    .min(5, "Store name must be at least 5 characters")
    .max(100, "Store name must not exceed 100 characters"),

  email: z
    .string()
    .min(1, "Email is required")
    .trim()
    .email("Please enter a valid email address"),
  organization_id: z.string().min(1, "Please select organization"),
  notes: z
    .string()
    .trim()
    .optional()
    .refine(
      val => !val || (val.length >= 10 && val.length <= 255),
      {
        message: "Notes must be between 10 and 255 characters",
      }
    ),


  gst_no: z
    .string()
    .min(1, "GSTIN is required")
    .regex(
      /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$/,
      "Invalid GSTIN format"
    ),

  pan_no: z
    .string()
    .min(1, "PAN number is required")
    .regex(
      /^[A-Z]{5}\d{4}[A-Z]$/,
      "Invalid PAN number format (e.g. ABCDE1234F)"
    ),


  invoice_prefix: z
    .string()
    .trim()
    .min(1, "Invoice prefix must be at least 1 characters")
    .max(10, "Invoice prefix must not exceed 10 characters")
    .regex(
      /^[A-Z0-9]+$/,
      "Invoice prefix must contain only uppercase letters and numbers"
    ),
  country: z.string().min(1, "Please select country"),
  state: z.string().min(1, "Please select state"),
  city: z.string().min(1, "Please select city"),
  pincode: z
    .string()
    .min(1, "Pincode is required")
    .max(10,"Pincode must not exceed 10 digits")
    .regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),

  registered_address: z
    .string()
    .trim()
    .min(10, "Address must be at least 10 characters")
    .max(255, "Address must not exceed 255 characters"),
  shipping_address: z
    .string()
    .trim()
    .min(10, "Address must be at least 10 characters")
    .max(255, "Address must not exceed 255 characters"),
  territory_id: z.string().min(1, "Please select territory"),
  phone: z.string().max(15),
  gstin_file: fileOrPath
    .refine(val => val !== undefined && val !== "", {
      message: "GST file is required",
    }),

  pan_card_file: fileOrPath
    .refine(val => val !== undefined && val !== "", {
      message: "PAN card file is required",
    }),

  registration_file: fileOrPath
    .refine(val => val !== undefined && val !== "", {
      message: "Registration file is required",
    }),
  opening_date: z
    .string()
    .min(1, "Opening date is required"),

});
export const TerritoryMasterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(5, "Territory name must be at least 5 characters")
    .max(100, "Territory name must not exceed 100 characters"),
  store_id: z.string().optional(),
  notes: z
    .string()
    .trim()
    .optional()
    .refine(
      val => !val || (val.length >= 10 && val.length <= 255),
      {
        message: "Notes must be between 10 and 255 characters",
      }
    ),
  country_id: z.string().min(1, "Please select country"),
  state_ids:
    z
      .array(
        z.string().min(1, "Please select state"),
      ),
  city_ids: z
    .array(
      z.string().min(1, "Please select city"),
    ),

});

