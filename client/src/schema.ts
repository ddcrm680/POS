import { z } from "zod";
export type Customer = z.infer<typeof CustomerSchema>;
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
  socialMediaProfiles:  z.record(z.string(), z.boolean()).optional().nullable(),
  marketingTags: z.array(z.string()).optional().nullable(),
  
  // Behavioral Analytics & AI Fields
  visitFrequency: z.string().max(20).optional().nullable(),
  averageServiceInterval: z.number().int().optional().nullable(),
  seasonalPattern: z.record(z.any(),z.any()).optional().nullable(),
  servicePreferences: z.record(z.any(),z.any()).optional().nullable(),
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
  aiInsights: z.record(z.any(),z.any()).optional().nullable(),
  personalityProfile: z.record(z.any(),z.any()).optional().nullable(),
  predictiveMetrics: z.record(z.any(),z.any()).optional().nullable(),
  automationRules: z.record(z.any(),z.any()).optional().nullable(),
  sentimentAnalysis: z.record(z.any(),z.any()).optional().nullable(),
  
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});