export const Role = {
  Farmer: "farmer",
  Buyer: "buyer",
  Transporter: "transporter",
  Admin: "admin",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const OrderStatus = {
  Pending: "pending",
  Confirmed: "confirmed",
  InTransit: "in_transit",
  Delivered: "delivered",
  Completed: "completed",
  Cancelled: "cancelled",
  Disputed: "disputed",
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const ShipmentStatus = {
  Available: "available",
  Accepted: "accepted",
  PickedUp: "picked_up",
  InTransit: "in_transit",
  Delivered: "delivered",
} as const;
export type ShipmentStatus = (typeof ShipmentStatus)[keyof typeof ShipmentStatus];

export const TrustLevel = {
  Building: "building",
  Established: "established",
  High: "high",
  Elite: "elite",
} as const;
export type TrustLevel = (typeof TrustLevel)[keyof typeof TrustLevel];

export const VerificationStatus = {
  Unverified: "unverified",
  Pending: "pending",
  Verified: "verified",
} as const;
export type VerificationStatus = (typeof VerificationStatus)[keyof typeof VerificationStatus];

export const DisputeStatus = {
  Open: "open",
  UnderReview: "under_review",
  Resolved: "resolved",
  Rejected: "rejected",
} as const;
export type DisputeStatus = (typeof DisputeStatus)[keyof typeof DisputeStatus];

export const ListingAvailability = {
  InStock: "in_stock",
  Limited: "limited",
  SoldOut: "sold_out",
} as const;
export type ListingAvailability = (typeof ListingAvailability)[keyof typeof ListingAvailability];
