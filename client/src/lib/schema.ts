import { z } from "zod";
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
export const servicePlanSchema = (mode: "create" | "edit" | "view") =>
  z.object({
    plan_name:
      z
        .coerce
        .string({
          invalid_type_error: "Plan name is required",
        })
        .refine(
          (val) => val !== '' ,
          { message: "Please select a plan name" }
        ),
          vehicle_type:
      z
        .coerce
        .string({
          invalid_type_error: "Vehicle type is required",
        })
        .refine(
          (val) => val !== '' ,
          { message: "Please select a vehicle type" }
        ),
name:
      z
        .coerce
        .string({
          invalid_type_error: "Plan name is required",
        })
        ,
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
