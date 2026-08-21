import { uuid } from "../lib/uuid";
import {
  OrderStatus,
  ShipmentStatus,
  DisputeStatus,
  ListingAvailability,
  Role,
  TrustLevel,
  VerificationStatus,
} from "../types/enums";
import type {
  User,
  TrustProfile,
  Listing,
  Order,
  Shipment,
  Notification,
  Dispute,
  AuditLog,
  RiskSignal,
  ProofOfDelivery,
  AdminOverview,
} from "../types";
import {
  demoUsers,
  trustProfiles,
  demoListings,
  demoOrders,
  demoShipments,
  demoNotifications,
  demoDisputes,
  demoAuditLogs,
  demoRiskSignals,
} from "./mockData";

// Simulate network latency
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

class MockStore {
  users: User[] = clone(demoUsers);
  trust: TrustProfile[] = clone(trustProfiles);
  listings: Listing[] = clone(demoListings);
  orders: Order[] = clone(demoOrders);
  shipments: Shipment[] = clone(demoShipments);
  notifications: Notification[] = clone(demoNotifications);
  disputes: Dispute[] = clone(demoDisputes);
  auditLogs: AuditLog[] = clone(demoAuditLogs);
  riskSignals: RiskSignal[] = clone(demoRiskSignals);
  currentSession: User | null = null;

  // ── AUTH ──────────────────────────────────────────
  async login(email: string): Promise<User> {
    await delay(300);
    const user = this.users.find((u) => u.email === email);
    if (!user) throw new Error("Invalid credentials");
    this.currentSession = user;
    return clone(user);
  }

  async loginAsRole(role: Role): Promise<User> {
    await delay(200);
    const user = this.users.find((u) => u.role === role);
    if (!user) throw new Error("No user for role");
    this.currentSession = user;
    return clone(user);
  }

  async register(data: Partial<User> & { role: Role }): Promise<User> {
    await delay(400);
    const user: User = {
      id: `u-${uuid()}`,
      name: data.name || "New User",
      email: data.email || `user${Date.now()}@agrolink.com`,
      role: data.role,
      phone: data.phone,
      location: data.location,
      createdAt: new Date().toISOString(),
    };
    this.users.push(user);
    this.trust.push({
      userId: user.id,
      score: 50,
      rating: 0,
      completedTransactions: 0,
      fulfilmentRate: 100,
      level: TrustLevelFromScore(50),
      verification: VerificationStatus.Pending,
      trends: [],
    } as TrustProfile);
    this.currentSession = user;
    return clone(user);
  }

  // ── TRUST ─────────────────────────────────────────
  async getTrust(userId: string): Promise<TrustProfile> {
    await delay(200);
    const t = this.trust.find((t) => t.userId === userId);
    if (!t) {
      return {
        userId,
        score: 50,
        rating: 0,
        completedTransactions: 0,
        fulfilmentRate: 100,
        level: TrustLevelFromScore(50),
        verification: VerificationStatus.Unverified,
        trends: [],
      };
    }
    return clone(t);
  }

  // ── LISTINGS ──────────────────────────────────────
  async getListings(): Promise<Listing[]> {
    await delay(300);
    return clone(this.listings);
  }

  async getListing(id: string): Promise<Listing> {
    await delay(200);
    const l = this.listings.find((l) => l.id === id);
    if (!l) throw new Error("Listing not found");
    return clone(l);
  }

  async createListing(data: Partial<Listing>): Promise<Listing> {
    await delay(400);
    const listing: Listing = {
      id: `listing-${uuid()}`,
      farmerId: data.farmerId || "u-farmer-1",
      farmerName: data.farmerName || "Aisha Farms",
      crop: data.crop || "",
      category: data.category || "Other",
      quantity: data.quantity || 0,
      unit: data.unit || "crates",
      pricePerUnit: data.pricePerUnit || 0,
      location: data.location || "",
      availability: data.availability || ListingAvailability.InStock,
      imageUrl: data.imageUrl || "",
      description: data.description || "",
      createdAt: new Date().toISOString(),
    };
    this.listings.push(listing);
    this.logAudit("listing_created", listing.farmerName, listing.id, `Created listing for ${listing.crop}`);
    return clone(listing);
  }

  // ── ORDERS ────────────────────────────────────────
  async getOrders(): Promise<Order[]> {
    await delay(300);
    return clone(this.orders);
  }

  async getOrder(id: string): Promise<Order> {
    await delay(200);
    const o = this.orders.find((o) => o.id === id);
    if (!o) throw new Error("Order not found");
    return clone(o);
  }

  async createOrder(data: {
    buyerId: string;
    buyerName: string;
    listingId: string;
    quantity: number;
  }): Promise<Order> {
    await delay(500);
    const listing = this.listings.find((l) => l.id === data.listingId);
    if (!listing) throw new Error("Listing not found");

    const produceSubtotal = listing.pricePerUnit * data.quantity;
    const logisticsEstimate = Math.round(produceSubtotal * 0.12);
    const agrolinkFee = Math.round(produceSubtotal * 0.03);
    const total = produceSubtotal + logisticsEstimate + agrolinkFee;

    const order: Order = {
      id: `order-${uuid()}`,
      orderNumber: `ORD-${String(this.orders.length + 1).padStart(4, "0")}`,
      buyerId: data.buyerId,
      buyerName: data.buyerName,
      farmerId: listing.farmerId,
      farmerName: listing.farmerName,
      items: [
        {
          listingId: listing.id,
          crop: listing.crop,
          quantity: data.quantity,
          unit: listing.unit,
          pricePerUnit: listing.pricePerUnit,
        },
      ],
      produceSubtotal,
      logisticsEstimate,
      agrolinkFee,
      total,
      status: OrderStatus.Pending,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.orders.push(order);

    // Auto-create a shipment/job
    const shipment: Shipment = {
      id: `ship-${uuid()}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      farmerId: listing.farmerId,
      farmerName: listing.farmerName,
      buyerId: data.buyerId,
      buyerName: data.buyerName,
      pickupLocation: listing.location,
      dropoffLocation: "Lagos, Nigeria",
      crop: listing.crop,
      quantity: data.quantity,
      unit: listing.unit,
      status: ShipmentStatus.Available,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.shipments.push(shipment);
    order.shipmentId = shipment.id;

    this.logAudit("order_created", data.buyerName, order.orderNumber, `Order created for ${data.quantity} ${listing.unit} of ${listing.crop}`);
    this.addNotification(listing.farmerId, "New order received", `${data.buyerName} placed an order for your ${listing.crop}.`, "success");
    this.addNotification("u-transporter-1", "New delivery job available", `A delivery job from ${listing.location} to Lagos is available.`, "info");

    return clone(order);
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    await delay(300);
    const o = this.orders.find((o) => o.id === id);
    if (!o) throw new Error("Order not found");
    o.status = status;
    o.updatedAt = new Date().toISOString();
    this.logAudit("order_status_updated", "System", o.orderNumber, `Order status changed to ${status}`);
    return clone(o);
  }

  async confirmDelivery(orderId: string, _pod: Partial<ProofOfDelivery>): Promise<Order> {
    await delay(400);
    const o = this.orders.find((o) => o.id === orderId);
    if (!o) throw new Error("Order not found");
    o.status = OrderStatus.Completed;
    o.updatedAt = new Date().toISOString();

    // Update trust scores
    this.adjustTrust(o.farmerId, 1);
    this.adjustTrust(o.buyerId, 1);

    this.logAudit("delivery_confirmed", o.buyerName, o.orderNumber, "Delivery confirmed by buyer");
    return clone(o);
  }

  // ── SHIPMENTS ─────────────────────────────────────
  async getShipments(): Promise<Shipment[]> {
    await delay(300);
    return clone(this.shipments);
  }

  async createShipment(data: Partial<Shipment>): Promise<Shipment> {
    await delay(400);
    const ship: Shipment = {
      id: `ship-${uuid()}`,
      orderId: data.orderId || "",
      orderNumber: data.orderNumber || "",
      farmerId: data.farmerId || "",
      farmerName: data.farmerName || "",
      buyerId: data.buyerId || "",
      buyerName: data.buyerName || "",
      pickupLocation: data.pickupLocation || "",
      dropoffLocation: data.dropoffLocation || "",
      crop: data.crop || "",
      quantity: data.quantity || 0,
      unit: data.unit || "crates",
      status: ShipmentStatus.Available,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.shipments.push(ship);
    return clone(ship);
  }

  async updateShipmentStatus(id: string, status: ShipmentStatus): Promise<Shipment> {
    await delay(300);
    const s = this.shipments.find((s) => s.id === id);
    if (!s) throw new Error("Shipment not found");
    s.status = status;
    s.updatedAt = new Date().toISOString();
    this.logAudit("shipment_status_updated", s.transporterName || "Transporter", s.id, `Shipment status changed to ${status}`);
    return clone(s);
  }

  async acceptShipment(id: string, transporterId: string, transporterName: string): Promise<Shipment> {
    await delay(300);
    const s = this.shipments.find((s) => s.id === id);
    if (!s) throw new Error("Shipment not found");
    s.transporterId = transporterId;
    s.transporterName = transporterName;
    s.status = ShipmentStatus.Accepted;
    s.updatedAt = new Date().toISOString();
    this.logAudit("shipment_accepted", transporterName, s.id, "Transporter accepted delivery job");
    this.addNotification(s.buyerId, "Transporter assigned", `${transporterName} has accepted your delivery.`, "success");
    return clone(s);
  }

  async pickupShipment(id: string): Promise<Shipment> {
    await delay(300);
    const s = this.shipments.find((s) => s.id === id);
    if (!s) throw new Error("Shipment not found");
    s.status = ShipmentStatus.PickedUp;
    s.updatedAt = new Date().toISOString();
    this.logAudit("shipment_picked_up", s.transporterName || "Transporter", s.id, "Shipment picked up from farm");
    this.addNotification(s.buyerId, "Pickup confirmed", `Your order has been picked up from ${s.pickupLocation}.`, "info");
    return clone(s);
  }

  async deliverShipment(id: string, pod: Partial<ProofOfDelivery>): Promise<Shipment> {
    await delay(400);
    const s = this.shipments.find((s) => s.id === id);
    if (!s) throw new Error("Shipment not found");
    s.status = ShipmentStatus.Delivered;
    s.updatedAt = new Date().toISOString();
    const expected = s.quantity;
    const received = pod.receivedQuantity ?? expected;
    s.proofOfDelivery = {
      expectedQuantity: expected,
      receivedQuantity: received,
      unit: s.unit,
      photoUrl: pod.photoUrl,
      confirmationMethod: pod.confirmationMethod || "Photo verification",
      confirmedAt: new Date().toISOString(),
      hasDiscrepancy: received !== expected,
    };
    this.logAudit("shipment_delivered", s.transporterName || "Transporter", s.id, `Shipment delivered${received !== expected ? " with discrepancy" : ""}`);
    this.addNotification(s.buyerId, "Delivery arrived", `Your shipment has been delivered. Please confirm receipt.`, "success");

    // Update order status
    const order = this.orders.find((o) => o.id === s.orderId);
    if (order) {
      order.status = OrderStatus.Delivered;
      order.updatedAt = new Date().toISOString();
    }

    return clone(s);
  }

  // ── DISPUTES ──────────────────────────────────────
  async createDispute(orderId: string, reason: string, description: string, raisedBy: string): Promise<Dispute> {
    await delay(400);
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) throw new Error("Order not found");
    const dispute: Dispute = {
      id: `dispute-${uuid()}`,
      orderId,
      orderNumber: order.orderNumber,
      raisedBy,
      reason,
      description,
      status: DisputeStatus.Open,
      createdAt: new Date().toISOString(),
    };
    this.disputes.push(dispute);
    order.status = OrderStatus.Disputed;
    order.updatedAt = new Date().toISOString();
    this.logAudit("dispute_opened", raisedBy, order.orderNumber, `Dispute opened: ${reason}`);
    return clone(dispute);
  }

  async getDisputes(): Promise<Dispute[]> {
    await delay(300);
    return clone(this.disputes);
  }

  // ── NOTIFICATIONS ─────────────────────────────────
  async getNotifications(userId: string): Promise<Notification[]> {
    await delay(200);
    return clone(this.notifications.filter((n) => n.userId === userId));
  }

  // ── ADMIN ─────────────────────────────────────────
  async getAdminOverview(): Promise<AdminOverview> {
    await delay(300);
    const trustScores = this.trust.map((t) => t.score);
    const avg = trustScores.length > 0
      ? Math.round(trustScores.reduce((a, b) => a + b, 0) / trustScores.length)
      : 0;
    return {
      totalFarmers: this.users.filter((u) => u.role === Role.Farmer).length,
      totalBuyers: this.users.filter((u) => u.role === Role.Buyer).length,
      totalTransporters: this.users.filter((u) => u.role === Role.Transporter).length,
      activeOrders: this.orders.filter((o) =>
        o.status !== OrderStatus.Completed && o.status !== OrderStatus.Cancelled
      ).length,
      activeShipments: this.shipments.filter((s) =>
        s.status !== ShipmentStatus.Delivered
      ).length,
      openDisputes: this.disputes.filter((d) =>
        d.status === DisputeStatus.Open || d.status === DisputeStatus.UnderReview
      ).length,
      averageTrust: avg,
    };
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    await delay(300);
    return clone(this.auditLogs);
  }

  async getRiskSignals(): Promise<RiskSignal[]> {
    await delay(300);
    return clone(this.riskSignals);
  }

  // ── HELPERS ───────────────────────────────────────
  private logAudit(event: string, actor: string, target: string, description: string) {
    this.auditLogs.unshift({
      id: `a-${uuid()}`,
      event,
      actor,
      target,
      description,
      createdAt: new Date().toISOString(),
    });
  }

  private addNotification(userId: string, title: string, message: string, type: Notification["type"]) {
    this.notifications.unshift({
      id: `n-${uuid()}`,
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
    });
  }

  private adjustTrust(userId: string, delta: number) {
    const t = this.trust.find((t) => t.userId === userId);
    if (t) {
      t.score = Math.min(100, Math.max(0, t.score + delta));
      t.completedTransactions += 1;
      t.level = TrustLevelFromScore(t.score);
    }
  }
}

function TrustLevelFromScore(score: number): TrustProfile["level"] {
  if (score >= 90) return TrustLevel.Elite;
  if (score >= 75) return TrustLevel.High;
  if (score >= 60) return TrustLevel.Established;
  return TrustLevel.Building;
}

export const mockStore = new MockStore();
