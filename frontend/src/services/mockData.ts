import {
  Role,
  TrustLevel,
  VerificationStatus,
  ListingAvailability,
} from "../types/enums";
import type {
  User,
  TrustProfile,
  FarmerProfile,
  BuyerProfile,
  TransporterProfile,
  Listing,
  Order,
  Shipment,
  Notification,
  Dispute,
  AuditLog,
  RiskSignal,
} from "../types";

const now = new Date().toISOString();

export const demoUsers: User[] = [
  {
    id: "u-farmer-1",
    name: "Aisha Ibrahim",
    email: "aisha@agrolink.com",
    role: Role.Farmer,
    phone: "+234 803 555 0101",
    location: "Kano, Nigeria",
    createdAt: now,
  },
  {
    id: "u-buyer-1",
    name: "Chidi Okafor",
    email: "chidi@freshmart.com",
    role: Role.Buyer,
    phone: "+234 803 555 0202",
    location: "Lagos, Nigeria",
    createdAt: now,
  },
  {
    id: "u-transporter-1",
    name: "Emeka Nwosu",
    email: "emeka@swifthaul.com",
    role: Role.Transporter,
    phone: "+234 803 555 0303",
    location: "Abuja, Nigeria",
    createdAt: now,
  },
  {
    id: "u-admin-1",
    name: "Admin User",
    email: "admin@agrolink.com",
    role: Role.Admin,
    location: "Abuja, Nigeria",
    createdAt: now,
  },
];

export const farmerProfiles: FarmerProfile[] = [
  {
    userId: "u-farmer-1",
    farmName: "Aisha Farms",
    farmSize: "12 hectares",
    primaryCrops: ["Tomatoes", "Maize", "Pepper"],
    location: "Kano, Nigeria",
    verified: true,
  },
];

export const buyerProfiles: BuyerProfile[] = [
  {
    userId: "u-buyer-1",
    businessName: "FreshMart Foods",
    businessType: "Supermarket chain",
    location: "Lagos, Nigeria",
    verified: true,
  },
];

export const transporterProfiles: TransporterProfile[] = [
  {
    userId: "u-transporter-1",
    companyName: "SwiftHaul Logistics",
    vehicleType: "Refrigerated truck",
    capacity: "5 tonnes",
    coverageArea: "Northern & Southern Nigeria",
    verified: true,
  },
];

export const trustProfiles: TrustProfile[] = [
  {
    userId: "u-farmer-1",
    score: 92,
    rating: 4.8,
    completedTransactions: 48,
    fulfilmentRate: 97,
    level: TrustLevel.High,
    verification: VerificationStatus.Verified,
    trends: [
      { period: "Jan", score: 85 },
      { period: "Feb", score: 87 },
      { period: "Mar", score: 89 },
      { period: "Apr", score: 90 },
      { period: "May", score: 91 },
      { period: "Jun", score: 92 },
    ],
  },
  {
    userId: "u-buyer-1",
    score: 88,
    rating: 4.6,
    completedTransactions: 35,
    fulfilmentRate: 94,
    level: TrustLevel.High,
    verification: VerificationStatus.Verified,
    trends: [
      { period: "Jan", score: 80 },
      { period: "Feb", score: 82 },
      { period: "Mar", score: 84 },
      { period: "Apr", score: 85 },
      { period: "May", score: 87 },
      { period: "Jun", score: 88 },
    ],
  },
  {
    userId: "u-transporter-1",
    score: 95,
    rating: 4.9,
    completedTransactions: 72,
    fulfilmentRate: 99,
    level: TrustLevel.Elite,
    verification: VerificationStatus.Verified,
    trends: [
      { period: "Jan", score: 90 },
      { period: "Feb", score: 91 },
      { period: "Mar", score: 92 },
      { period: "Apr", score: 93 },
      { period: "May", score: 94 },
      { period: "Jun", score: 95 },
    ],
  },
];

export const demoListings: Listing[] = [
  {
    id: "listing-1",
    farmerId: "u-farmer-1",
    farmerName: "Aisha Farms",
    crop: "Fresh Tomatoes",
    category: "Vegetables",
    quantity: 100,
    unit: "crates",
    pricePerUnit: 4500,
    location: "Kano, Nigeria",
    availability: ListingAvailability.InStock,
    imageUrl: "",
    description: "Freshly harvested Roma tomatoes, grade A quality. Picked this morning.",
    createdAt: now,
  },
  {
    id: "listing-2",
    farmerId: "u-farmer-1",
    farmerName: "Aisha Farms",
    crop: "Yellow Maize",
    category: "Grains",
    quantity: 200,
    unit: "bags",
    pricePerUnit: 28000,
    location: "Kano, Nigeria",
    availability: ListingAvailability.InStock,
    imageUrl: "",
    description: "Dried yellow maize, properly cleaned and bagged. Ready for transport.",
    createdAt: now,
  },
  {
    id: "listing-3",
    farmerId: "u-farmer-1",
    farmerName: "Aisha Farms",
    crop: "Scotch Bonnet Pepper",
    category: "Vegetables",
    quantity: 50,
    unit: "crates",
    pricePerUnit: 12000,
    location: "Kano, Nigeria",
    availability: ListingAvailability.Limited,
    imageUrl: "",
    description: "Premium scotch bonnet peppers. High heat, vibrant colour.",
    createdAt: now,
  },
];

export const demoOrders: Order[] = [];

export const demoShipments: Shipment[] = [];

export const demoNotifications: Notification[] = [
  {
    id: "n-1",
    userId: "u-farmer-1",
    title: "New order received",
    message: "FreshMart Foods placed an order for your Fresh Tomatoes.",
    type: "success",
    read: false,
    createdAt: now,
  },
  {
    id: "n-2",
    userId: "u-buyer-1",
    title: "Shipment in transit",
    message: "Your order is on the way from Kano to Lagos.",
    type: "info",
    read: false,
    createdAt: now,
  },
  {
    id: "n-3",
    userId: "u-transporter-1",
    title: "New delivery job available",
    message: "A delivery job matching your route is available.",
    type: "info",
    read: false,
    createdAt: now,
  },
];

export const demoDisputes: Dispute[] = [];

export const demoAuditLogs: AuditLog[] = [
  {
    id: "a-1",
    event: "order_created",
    actor: "FreshMart Foods",
    target: "ORD-001",
    description: "Order created for 100 crates of Fresh Tomatoes",
    createdAt: now,
  },
  {
    id: "a-2",
    event: "shipment_accepted",
    actor: "SwiftHaul Logistics",
    target: "SHP-001",
    description: "Transporter accepted delivery job",
    createdAt: now,
  },
  {
    id: "a-3",
    event: "trust_updated",
    actor: "System",
    target: "Aisha Farms",
    description: "Trust score increased to 92 after completed delivery",
    createdAt: now,
  },
];

export const demoRiskSignals: RiskSignal[] = [
  {
    id: "r-1",
    type: "Delivery discrepancy",
    severity: "moderate",
    entity: "Order ORD-002",
    description: "2 crates short on delivery confirmation",
    createdAt: now,
  },
  {
    id: "r-2",
    type: "Repeated cancellations",
    severity: "high",
    entity: "Buyer: Lagos Grocers",
    description: "3 cancellations in the past 7 days",
    createdAt: now,
  },
];
