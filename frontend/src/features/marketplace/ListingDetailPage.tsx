import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Store, ShoppingCart, Package, Truck, Calculator } from "lucide-react";
import { useAsync } from "../../lib/useAsync";
import { marketplaceService } from "../../services/marketplaceService";
import { orderService } from "../../services/orderService";
import { TrustScore } from "../../components/TrustScore";
import { LoadingSpinner, ErrorState, PageHeader, StatusBadge } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { formatNaira } from "../../lib/format";
import { ListingAvailability } from "../../types/enums";
import type { Order } from "../../types";

export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: listing, loading, error, refetch } = useAsync(
    () => marketplaceService.getListing(id!),
    [id],
  );

  const [quantity, setQuantity] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  if (loading) return <LoadingSpinner label="Loading listing..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!listing) return <ErrorState message="Listing not found" />;

  const produceSubtotal = listing.pricePerUnit * quantity;
  const logisticsEstimate = Math.round(produceSubtotal * 0.12);
  const agrolinkFee = Math.round(produceSubtotal * 0.03);
  const total = produceSubtotal + logisticsEstimate + agrolinkFee;

  async function handlePlaceOrder() {
    if (!user) return;
    setOrdering(true);
    setOrderError(null);
    try {
      const order = await orderService.createOrder({
        buyerId: user.id,
        buyerName: user.name,
        listingId: listing!.id,
        quantity,
      });
      setCreatedOrder(order);
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setOrdering(false);
    }
  }

  if (createdOrder) {
    return (
      <div className="fade-in max-w-2xl">
        <div className="card p-8 text-center">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-sage-100 mb-4">
            <Package className="h-8 w-8 text-forest-700" />
          </div>
          <h2 className="text-2xl font-bold text-forest-900 mb-2">Order Placed Successfully!</h2>
          <p className="text-forest-500 mb-6">Your order has been created and a delivery job has been posted for transporters.</p>

          <div className="rounded-lg bg-sage-50 p-4 mb-6 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-forest-500">Order Number</span>
              <span className="font-bold text-forest-900">{createdOrder.orderNumber}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-forest-500">Status</span>
              <StatusBadge status={createdOrder.status} />
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-forest-500">Total</span>
              <span className="font-bold text-forest-900">{formatNaira(createdOrder.total)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-forest-500">Delivery Job</span>
              <span className="text-sm text-forest-700">Posted for transporters</span>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Link to={`/orders/${createdOrder.id}`} className="btn-primary">
              View Order
            </Link>
            <Link to="/marketplace" className="btn-outline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-forest-600 hover:text-forest-800 mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to Marketplace
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Listing details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card overflow-hidden">
            <div className="h-64 bg-sage-100 relative">
              {listing.imageUrl ? (
                <img src={listing.imageUrl} alt={listing.crop} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Store className="h-20 w-20 text-sage-400" />
                </div>
              )}
              <div className="absolute top-3 right-3">
                <StatusBadge status={listing.availability} />
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-forest-900">{listing.crop}</h1>
                  <p className="text-sm text-forest-500">{listing.category}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-forest-800">{formatNaira(listing.pricePerUnit)}</div>
                  <div className="text-sm text-forest-500">per {listing.unit}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="rounded-lg bg-sage-50 p-3">
                  <div className="text-xs text-forest-500 mb-1">Available</div>
                  <div className="font-semibold text-forest-800">{listing.quantity} {listing.unit}</div>
                </div>
                <div className="rounded-lg bg-sage-50 p-3">
                  <div className="text-xs text-forest-500 mb-1">Location</div>
                  <div className="font-semibold text-forest-800 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {listing.location}
                  </div>
                </div>
              </div>

              {listing.description && (
                <div className="border-t border-sage-200 pt-4">
                  <h3 className="text-sm font-semibold text-forest-700 mb-2">Description</h3>
                  <p className="text-sm text-forest-600">{listing.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: Farmer trust + order */}
        <div className="space-y-4">
          <TrustScore userId={listing.farmerId} name={listing.farmerName} />

          {/* Order panel */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-forest-700 uppercase mb-4">Place Order</h3>

            {listing.availability === ListingAvailability.SoldOut ? (
              <p className="text-sm text-red-600">This listing is sold out.</p>
            ) : (
              <>
                <div className="mb-4">
                  <label className="label">Quantity ({listing.unit})</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-10 w-10 rounded-lg border border-sage-200 font-bold text-forest-700 hover:bg-sage-100"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(listing.quantity, parseInt(e.target.value) || 1)))}
                      className="input text-center"
                      min="1"
                      max={listing.quantity}
                    />
                    <button
                      onClick={() => setQuantity(Math.min(listing.quantity, quantity + 1))}
                      className="h-10 w-10 rounded-lg border border-sage-200 font-bold text-forest-700 hover:bg-sage-100"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-xs text-forest-500 mt-1">Max {listing.quantity} {listing.unit}</p>
                </div>

                {!showCheckout ? (
                  <button onClick={() => setShowCheckout(true)} className="btn-primary w-full">
                    <ShoppingCart className="h-4 w-4" />
                    Order Now
                  </button>
                ) : (
                  <div className="space-y-3 fade-in">
                    <div className="rounded-lg bg-ivory-100 p-4 space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-forest-600">Produce subtotal</span>
                        <span className="font-medium text-forest-800">{formatNaira(produceSubtotal)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-forest-600 flex items-center gap-1">
                          <Truck className="h-3 w-3" /> Logistics estimate
                        </span>
                        <span className="font-medium text-forest-800">{formatNaira(logisticsEstimate)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-forest-600 flex items-center gap-1">
                          <Calculator className="h-3 w-3" /> Agrolink fee
                        </span>
                        <span className="font-medium text-forest-800">{formatNaira(agrolinkFee)}</span>
                      </div>
                      <div className="border-t border-sage-200 pt-2 flex items-center justify-between">
                        <span className="font-bold text-forest-900">Total</span>
                        <span className="font-bold text-lg text-forest-900">{formatNaira(total)}</span>
                      </div>
                    </div>

                    {orderError && (
                      <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                        {orderError}
                      </div>
                    )}

                    <button
                      onClick={handlePlaceOrder}
                      className="btn-primary w-full"
                      disabled={ordering}
                    >
                      {ordering ? "Placing order..." : "Confirm Order"}
                    </button>
                    <button onClick={() => setShowCheckout(false)} className="btn-outline w-full">
                      Cancel
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
