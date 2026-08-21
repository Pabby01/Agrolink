import {
  Role,
  OrderStatus,
  ShipmentStatus,
  TrustLevel,
  VerificationStatus,
  DisputeStatus,
  ListingAvailability,
} from "./enums";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  location?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface TrustProfile {
  userId: string;
  score: number;
  rating: number;
  completedTransactions: number;
  fulfilmentRate: number;
  level: TrustLevel;
  verification: VerificationStatus;
  trends: { period: string; score: number }[];
}

export interface FarmerProfile {
  userId: string;
  farmName: string;
  farmSize: string;
  primaryCrops: string[];
  location: string;
  verified: boolean;
}

export interface BuyerProfile {
  userId: string;
  businessName: string;
  businessType: string;
  location: string;
  verified: boolean;
}

export interface TransporterProfile {
  userId: string;
  companyName: string;
  vehicleType: string;
  capacity: string;
  coverageArea: string;
  verified: boolean;
}

export interface Listing {
  id: string;
  farmerId: string;
  farmerName: string;
  crop: string;
  category: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  location: string;
  availability: ListingAvailability;
  imageUrl: string;
  description: string;
  createdAt: string;
}

export interface OrderItem {
  listingId: string;
  crop: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  buyerName: string;
  farmerId: string;
  farmerName: string;
  items: OrderItem[];
  produceSubtotal: number;
  logisticsEstimate: number;
  agrolinkFee: number;
  total: number;
  status: OrderStatus;
  shipmentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Shipment {
  id: string;
  orderId: string;
  orderNumber: string;
  transporterId?: string;
  transporterName?: string;
  farmerId: string;
  farmerName: string;
  buyerId: string;
  buyerName: string;
  pickupLocation: string;
  dropoffLocation: string;
  crop: string;
  quantity: number;
  unit: string;
  status: ShipmentStatus;
  proofOfDelivery?: ProofOfDelivery;
  createdAt: string;
  updatedAt: string;
}

export interface ProofOfDelivery {
  expectedQuantity: number;
  receivedQuantity: number;
  unit: string;
  photoUrl?: string;
  confirmationMethod: string;
  confirmedAt: string;
  hasDiscrepancy: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
}

export interface Dispute {
  id: string;
  orderId: string;
  orderNumber: string;
  raisedBy: string;
  reason: string;
  description: string;
  status: DisputeStatus;
  createdAt: string;
}

export interface CropDiagnosis {
  id: string;
  crop: string;
  condition: string;
  confidence: number;
  severity: "low" | "moderate" | "high" | "severe";
  likelyCauses: string[];
  recommendedActions: string[];
  imageUrl?: string;
  createdAt: string;
}

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  language: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  event: string;
  actor: string;
  target: string;
  description: string;
  createdAt: string;
}

export interface AdminOverview {
  totalFarmers: number;
  totalBuyers: number;
  totalTransporters: number;
  activeOrders: number;
  activeShipments: number;
  openDisputes: number;
  averageTrust: number;
}

export interface RiskSignal {
  id: string;
  type: string;
  severity: "low" | "moderate" | "high";
  entity: string;
  description: string;
  createdAt: string;
}
