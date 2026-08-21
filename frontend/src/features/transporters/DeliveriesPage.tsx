import { useState } from "react";
import { Link } from "react-router-dom";
import { Truck, CheckCircle2, Package, Camera, AlertTriangle, MapPin, User } from "lucide-react";
import { useAsync } from "../../lib/useAsync";
import { shipmentService } from "../../services/shipmentService";
import { TrustScore } from "../../components/TrustScore";
import { LoadingSpinner, ErrorState, PageHeader, StatusBadge } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { ShipmentStatus } from "../../types/enums";
import type { Shipment } from "../../types";

export function DeliveriesPage() {
  const { user } = useAuth();
  const { data: shipments, loading, error, refetch } = useAsync(
    () => shipmentService.getShipments(),
    [],
  );

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedShip, setSelectedShip] = useState<Shipment | null>(null);

  async function doAction(id: string, action: () => Promise<Shipment>) {
    setActionLoading(id);
    setActionError(null);
    try {
      await action();
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) return <LoadingSpinner label="Loading deliveries..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const all = shipments ?? [];
  const available = all.filter((s) => s.status === ShipmentStatus.Available);
  const myActive = all.filter((s) =>
    s.transporterId === user?.id &&
    s.status !== ShipmentStatus.Delivered
  );
  const completed = all.filter((s) => s.status === ShipmentStatus.Delivered);

  return (
    <div className="fade-in">
      <PageHeader title="Deliveries" subtitle="Available jobs, active deliveries, and completed shipments." />

      {actionError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {/* Available jobs */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-forest-900 mb-3">Available Delivery Jobs</h2>
        {available.length === 0 ? (
          <div className="card p-6 text-center text-sm text-forest-500">
            No delivery jobs available right now. New jobs appear here when buyers place orders.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {available.map((s) => (
              <DeliveryJobCard
                key={s.id}
                shipment={s}
                actionLabel="Accept Job"
                actionLoading={actionLoading === s.id}
                onAction={() =>
                  doAction(s.id, () =>
                    shipmentService.acceptShipment(s.id, user!.id, user!.name)
                  )
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* Active deliveries */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-forest-900 mb-3">Active Deliveries</h2>
        {myActive.length === 0 ? (
          <div className="card p-6 text-center text-sm text-forest-500">
            No active deliveries. Accept a job above to get started.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {myActive.map((s) => (
              <ActiveDeliveryCard
                key={s.id}
                shipment={s}
                actionLoading={actionLoading === s.id}
                onPickup={() => doAction(s.id, () => shipmentService.pickupShipment(s.id))}
                onDeliver={() => setSelectedShip(s)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Completed */}
      <section>
        <h2 className="text-lg font-semibold text-forest-900 mb-3">Completed Deliveries</h2>
        {completed.length === 0 ? (
          <div className="card p-6 text-center text-sm text-forest-500">
            No completed deliveries yet.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {completed.map((s) => (
              <div key={s.id} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-forest-900">{s.orderNumber}</span>
                  <StatusBadge status={s.status} />
                </div>
                <div className="text-sm text-forest-600">{s.crop} — {s.quantity} {s.unit}</div>
                <div className="text-xs text-forest-500 mt-1">{s.pickupLocation} → {s.dropoffLocation}</div>
                {s.proofOfDelivery && (
                  <div className="mt-2 text-xs text-forest-500">
                    Delivered: {s.proofOfDelivery.receivedQuantity}/{s.proofOfDelivery.expectedQuantity} {s.proofOfDelivery.unit}
                    {s.proofOfDelivery.hasDiscrepancy && (
                      <span className="text-red-600 ml-2">· discrepancy</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Delivery confirmation modal */}
      {selectedShip && (
        <DeliveryConfirmationModal
          shipment={selectedShip}
          onClose={() => setSelectedShip(null)}
          onConfirm={async (receivedQty, photoUrl, method) => {
            await doAction(selectedShip.id, () =>
              shipmentService.deliverShipment(selectedShip.id, {
                receivedQuantity: receivedQty,
                photoUrl,
                confirmationMethod: method,
              })
            );
            setSelectedShip(null);
          }}
        />
      )}
    </div>
  );
}

function DeliveryJobCard({
  shipment,
  actionLabel,
  actionLoading,
  onAction,
}: {
  shipment: Shipment;
  actionLabel: string;
  actionLoading: boolean;
  onAction: () => void;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-semibold text-forest-900">{shipment.crop}</div>
          <div className="text-xs text-forest-500">{shipment.orderNumber}</div>
        </div>
        <StatusBadge status={shipment.status} />
      </div>

      <div className="space-y-2 text-sm mb-4">
        <div className="flex items-center gap-2 text-forest-600">
          <Package className="h-4 w-4" />
          {shipment.quantity} {shipment.unit}
        </div>
        <div className="flex items-center gap-2 text-forest-600">
          <MapPin className="h-4 w-4" />
          {shipment.pickupLocation} → {shipment.dropoffLocation}
        </div>
        <div className="flex items-center gap-2 text-forest-600">
          <User className="h-4 w-4" />
          Farmer: {shipment.farmerName}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <TrustScore userId={shipment.farmerId} variant="badge" />
        <TrustScore userId={shipment.buyerId} variant="badge" />
      </div>

      <button onClick={onAction} className="btn-primary w-full" disabled={actionLoading}>
        {actionLoading ? "Accepting..." : actionLabel}
      </button>
    </div>
  );
}

function ActiveDeliveryCard({
  shipment,
  actionLoading,
  onPickup,
  onDeliver,
}: {
  shipment: Shipment;
  actionLoading: boolean;
  onPickup: () => void;
  onDeliver: () => void;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-semibold text-forest-900">{shipment.crop}</div>
          <div className="text-xs text-forest-500">{shipment.orderNumber}</div>
        </div>
        <StatusBadge status={shipment.status} />
      </div>

      <div className="space-y-2 text-sm mb-4">
        <div className="flex items-center gap-2 text-forest-600">
          <Package className="h-4 w-4" />
          {shipment.quantity} {shipment.unit}
        </div>
        <div className="flex items-center gap-2 text-forest-600">
          <MapPin className="h-4 w-4" />
          {shipment.pickupLocation} → {shipment.dropoffLocation}
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-1 mb-4">
        {[
          ShipmentStatus.Accepted,
          ShipmentStatus.PickedUp,
          ShipmentStatus.InTransit,
          ShipmentStatus.Delivered,
        ].map((st, i) => {
          const order = [ShipmentStatus.Available, ShipmentStatus.Accepted, ShipmentStatus.PickedUp, ShipmentStatus.InTransit, ShipmentStatus.Delivered];
          const currentIdx = order.indexOf(shipment.status);
          const stepIdx = i + 1;
          const done = stepIdx <= currentIdx;
          return (
            <div key={st} className="flex items-center flex-1">
              <div className={`h-2 w-2 rounded-full ${done ? "bg-forest-600" : "bg-sage-200"}`} />
              {i < 3 && <div className={`flex-1 h-0.5 ${stepIdx < currentIdx ? "bg-forest-600" : "bg-sage-200"}`} />}
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        {shipment.status === ShipmentStatus.Accepted && (
          <button onClick={onPickup} className="btn-primary flex-1" disabled={actionLoading}>
            {actionLoading ? "..." : "Mark Picked Up"}
          </button>
        )}
        {(shipment.status === ShipmentStatus.PickedUp || shipment.status === ShipmentStatus.InTransit) && (
          <button onClick={onDeliver} className="btn-primary flex-1" disabled={actionLoading}>
            <CheckCircle2 className="h-4 w-4" />
            {actionLoading ? "..." : "Mark Delivered"}
          </button>
        )}
        <Link to={`/orders/${shipment.orderId}`} className="btn-outline">
          View Order
        </Link>
      </div>
    </div>
  );
}

function DeliveryConfirmationModal({
  shipment,
  onClose,
  onConfirm,
}: {
  shipment: Shipment;
  onClose: () => void;
  onConfirm: (receivedQty: number, photoUrl: string | undefined, method: string) => Promise<void>;
}) {
  const [receivedQty, setReceivedQty] = useState(shipment.quantity);
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [method, setMethod] = useState("Photo verification");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = 800;
          canvas.height = (img.height / img.width) * 800;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          setPhotoUrl(canvas.toDataURL("image/jpeg", 0.7));
        };
        img.src = ev.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onConfirm(receivedQty, photoUrl || undefined, method);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to confirm delivery");
    } finally {
      setLoading(false);
    }
  }

  const hasDiscrepancy = receivedQty !== shipment.quantity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-900/50" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-forest-900">Proof of Delivery</h2>
          <button onClick={onClose} className="text-forest-400 hover:text-forest-700">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Expected vs Received */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-sage-50 p-4">
              <div className="text-xs text-forest-500 mb-1">EXPECTED</div>
              <div className="text-2xl font-bold text-forest-800">{shipment.quantity} {shipment.unit}</div>
            </div>
            <div className="rounded-lg bg-sage-50 p-4">
              <div className="text-xs text-forest-500 mb-1">RECEIVED</div>
              <input
                type="number"
                value={receivedQty}
                onChange={(e) => setReceivedQty(parseInt(e.target.value) || 0)}
                className="input text-2xl font-bold text-forest-800 !border-0 !bg-transparent !p-0 w-full"
                min="0"
              />
              <div className="text-xs text-forest-500">{shipment.unit}</div>
            </div>
          </div>

          {hasDiscrepancy && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-center gap-2 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4" />
              Delivery discrepancy detected — {Math.abs(receivedQty - shipment.quantity)} {shipment.unit} difference.
            </div>
          )}

          {/* Photo evidence */}
          <div>
            <label className="label">Evidence Photo</label>
            <div className="flex items-center gap-3">
              {photoUrl ? (
                <img src={photoUrl} alt="Evidence" className="h-20 w-20 rounded-lg object-cover border border-sage-200" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-sage-300 bg-sage-50">
                  <Camera className="h-6 w-6 text-sage-400" />
                </div>
              )}
              <div>
                <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" id="delivery-photo" />
                <label htmlFor="delivery-photo" className="btn-outline cursor-pointer text-sm">
                  Upload Photo
                </label>
              </div>
            </div>
          </div>

          {/* Confirmation method */}
          <div>
            <label className="label">Confirmation Method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)} className="input">
              <option>Photo verification</option>
              <option>Buyer signature</option>
              <option>OTP confirmation</option>
              <option>In-person check</option>
            </select>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Confirming..." : "Confirm Delivery"}
          </button>
        </form>
      </div>
    </div>
  );
}
