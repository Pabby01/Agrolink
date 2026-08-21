import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Truck, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useAsync } from "../../lib/useAsync";
import { orderService } from "../../services/orderService";
import { shipmentService } from "../../services/shipmentService";
import { disputeService } from "../../services/aiService";
import { TrustScore } from "../../components/TrustScore";
import { LoadingSpinner, ErrorState, PageHeader, StatusBadge } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { formatNaira, formatDate } from "../../lib/format";
import { Role, OrderStatus, DisputeStatus } from "../../types/enums";
import type { Shipment, Dispute } from "../../types";

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: order, loading, error, refetch } = useAsync(
    () => orderService.getOrder(id!),
    [id],
  );

  const [confirming, setConfirming] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showDispute, setShowDispute] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeDesc, setDisputeDesc] = useState("");
  const [disputing, setDisputing] = useState(false);
  const [disputeResult, setDisputeResult] = useState<Dispute | null>(null);

  const { data: shipments } = useAsync(() => shipmentService.getShipments(), []);
  const shipment = shipments?.find((s) => s.orderId === id);

  if (loading) return <LoadingSpinner label="Loading order..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!order) return <ErrorState message="Order not found" />;

  async function handleConfirmDelivery() {
    setConfirming(true);
    setActionError(null);
    try {
      await orderService.confirmDelivery(order!.id, {
        expectedQuantity: shipment?.quantity ?? 0,
        receivedQuantity: shipment?.proofOfDelivery?.receivedQuantity ?? shipment?.quantity ?? 0,
        unit: shipment?.unit ?? "crates",
        confirmationMethod: "Buyer confirmation",
      });
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to confirm delivery");
    } finally {
      setConfirming(false);
    }
  }

  async function handleFileDispute(e: React.FormEvent) {
    e.preventDefault();
    setDisputing(true);
    setActionError(null);
    try {
      const d = await disputeService.createDispute(
        order!.id,
        disputeReason,
        disputeDesc,
        user?.name || "User",
      );
      setDisputeResult(d);
      setShowDispute(false);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to file dispute");
    } finally {
      setDisputing(false);
    }
  }

  const canConfirmDelivery = order.status === OrderStatus.Delivered && user?.role === Role.Buyer;
  const canDispute = order.status !== OrderStatus.Completed && order.status !== OrderStatus.Cancelled;
  const hasDiscrepancy = shipment?.proofOfDelivery?.hasDiscrepancy;

  return (
    <div className="fade-in">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-forest-600 hover:text-forest-800 mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </button>

      <PageHeader
        title={order.orderNumber}
        subtitle={`Created ${formatDate(order.createdAt)}`}
        action={<StatusBadge status={order.status} />}
      />

      {actionError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {disputeResult && (
        <div className="mb-4 rounded-lg bg-gold-50 border border-gold-200 px-4 py-3 text-sm text-gold-800 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Dispute opened: {disputeResult.reason} (Status: {DisputeStatus.Open})
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Order details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items & pricing */}
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-forest-700 uppercase mb-4">Order Summary</h3>
            <div className="space-y-3 mb-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-sage-100">
                  <div>
                    <div className="font-medium text-forest-900">{item.crop}</div>
                    <div className="text-xs text-forest-500">{item.quantity} {item.unit} × {formatNaira(item.pricePerUnit)}</div>
                  </div>
                  <div className="font-semibold text-forest-800">{formatNaira(item.quantity * item.pricePerUnit)}</div>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-forest-600">
                <span>Produce subtotal</span>
                <span>{formatNaira(order.produceSubtotal)}</span>
              </div>
              <div className="flex justify-between text-forest-600">
                <span>Logistics estimate</span>
                <span>{formatNaira(order.logisticsEstimate)}</span>
              </div>
              <div className="flex justify-between text-forest-600">
                <span>Agrolink fee</span>
                <span>{formatNaira(order.agrolinkFee)}</span>
              </div>
              <div className="flex justify-between border-t border-sage-200 pt-2 font-bold text-forest-900 text-base">
                <span>Total</span>
                <span>{formatNaira(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Shipment section */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="h-5 w-5 text-forest-700" />
              <h3 className="text-sm font-semibold text-forest-700 uppercase">Delivery Status</h3>
            </div>

            {shipment ? (
              <ShipmentProgress shipment={shipment} />
            ) : (
              <p className="text-sm text-forest-500">No shipment assigned yet.</p>
            )}

            {/* Proof of delivery */}
            {shipment?.proofOfDelivery && (
              <div className="mt-4 border-t border-sage-200 pt-4">
                <h4 className="text-sm font-semibold text-forest-700 mb-3">Proof of Delivery</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-sage-50 p-3">
                    <div className="text-xs text-forest-500 mb-1">Expected</div>
                    <div className="font-bold text-forest-800">{shipment.proofOfDelivery.expectedQuantity} {shipment.proofOfDelivery.unit}</div>
                  </div>
                  <div className="rounded-lg bg-sage-50 p-3">
                    <div className="text-xs text-forest-500 mb-1">Received</div>
                    <div className="font-bold text-forest-800">{shipment.proofOfDelivery.receivedQuantity} {shipment.proofOfDelivery.unit}</div>
                  </div>
                </div>

                {hasDiscrepancy && (
                  <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-3">
                    <div className="flex items-center gap-2 text-red-700 font-medium text-sm mb-1">
                      <AlertTriangle className="h-4 w-4" />
                      Delivery discrepancy detected
                    </div>
                    <p className="text-xs text-red-600 mb-3">
                      {Math.abs(shipment.proofOfDelivery.receivedQuantity - shipment.proofOfDelivery.expectedQuantity)} {shipment.proofOfDelivery.unit} difference.
                    </p>
                    {canDispute && (
                      <button onClick={() => setShowDispute(true)} className="btn-danger text-sm">
                        Open Dispute
                      </button>
                    )}
                  </div>
                )}

                {shipment.proofOfDelivery.photoUrl && (
                  <div className="mt-3">
                    <div className="text-xs text-forest-500 mb-1">Evidence photo:</div>
                    <img src={shipment.proofOfDelivery.photoUrl} alt="Proof" className="h-32 rounded-lg border border-sage-200" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Confirm delivery */}
          {canConfirmDelivery && (
            <div className="card p-6 bg-forest-900 text-ivory-50 border-forest-800">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle2 className="h-6 w-6 text-sage-400" />
                <h3 className="font-bold text-lg">Confirm Delivery</h3>
              </div>
              <p className="text-sage-200 text-sm mb-4">
                Your order has been delivered. Confirm receipt to complete the transaction and update trust scores.
              </p>
              <button onClick={handleConfirmDelivery} className="btn-gold" disabled={confirming}>
                {confirming ? "Confirming..." : "Confirm Delivery"}
              </button>
            </div>
          )}

          {/* Dispute form */}
          {showDispute && (
            <div className="card p-6 border-red-200">
              <h3 className="font-bold text-forest-900 mb-4">File a Dispute</h3>
              <form onSubmit={handleFileDispute} className="space-y-3">
                <div>
                  <label className="label">Reason</label>
                  <select value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} className="input" required>
                    <option value="">Select a reason...</option>
                    <option>Quantity mismatch</option>
                    <option>Quality issue</option>
                    <option>Damaged goods</option>
                    <option>Late delivery</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea value={disputeDesc} onChange={(e) => setDisputeDesc(e.target.value)} className="input min-h-[80px]" placeholder="Describe the issue..." required />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-danger" disabled={disputing}>
                    {disputing ? "Filing..." : "Submit Dispute"}
                  </button>
                  <button type="button" onClick={() => setShowDispute(false)} className="btn-outline">Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <TrustScore userId={order.buyerId} name={order.buyerName} variant="compact" />
          <TrustScore userId={order.farmerId} name={order.farmerName} variant="compact" />
          {shipment?.transporterId && (
            <TrustScore userId={shipment.transporterId} name={shipment.transporterName} variant="compact" />
          )}
        </div>
      </div>
    </div>
  );
}

function ShipmentProgress({ shipment }: { shipment: Shipment }) {
  const steps = [
    { status: "available", label: "Available" },
    { status: "accepted", label: "Accepted" },
    { status: "picked_up", label: "Picked Up" },
    { status: "in_transit", label: "In Transit" },
    { status: "delivered", label: "Delivered" },
  ];

  const currentIndex = steps.findIndex((s) => s.status === shipment.status);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-forest-600">{shipment.pickupLocation}</span>
        <span className="text-sm text-forest-600">{shipment.dropoffLocation}</span>
      </div>
      <div className="relative flex items-center justify-between">
        {steps.map((step, i) => (
          <div key={step.status} className="flex flex-col items-center flex-1 relative">
            {i < steps.length - 1 && (
              <div className={`absolute top-3 left-1/2 w-full h-0.5 ${i < currentIndex ? "bg-forest-600" : "bg-sage-200"}`} />
            )}
            <div className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
              i <= currentIndex ? "bg-forest-700 text-ivory-50" : "bg-sage-200 text-forest-400"
            }`}>
              {i < currentIndex ? "✓" : i + 1}
            </div>
            <span className={`text-[10px] mt-1 ${i <= currentIndex ? "text-forest-700 font-medium" : "text-forest-400"}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
      {shipment.transporterName && (
        <div className="mt-4 text-sm text-forest-600">
          Transporter: <span className="font-medium text-forest-800">{shipment.transporterName}</span>
        </div>
      )}
    </div>
  );
}
