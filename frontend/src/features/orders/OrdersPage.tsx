import { Link } from "react-router-dom";
import { ShoppingCart, Eye } from "lucide-react";
import { useAsync } from "../../lib/useAsync";
import { orderService } from "../../services/orderService";
import { LoadingSpinner, ErrorState, EmptyState, PageHeader, StatusBadge } from "../../components/ui";
import { formatNaira, formatDate } from "../../lib/format";
import { useAuth } from "../../context/AuthContext";
import { Role } from "../../types/enums";

export function OrdersPage() {
  const { user } = useAuth();
  const { data: orders, loading, error, refetch } = useAsync(() => orderService.getOrders(), []);

  const myOrders = orders ?? [];

  return (
    <div className="fade-in">
      <PageHeader title="Orders" subtitle="All orders in the Agrolink network." />

      {loading && <LoadingSpinner label="Loading orders..." />}
      {error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && myOrders.length === 0 && (
        <EmptyState
          icon={<ShoppingCart className="h-12 w-12" />}
          title="No orders yet"
          message={
            user?.role === Role.Buyer
              ? "Browse the marketplace and place your first order."
              : "When transactions happen, orders will appear here."
          }
          action={user?.role === Role.Buyer ? <Link to="/marketplace" className="btn-primary">Browse Marketplace</Link> : undefined}
        />
      )}

      {!loading && !error && myOrders.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-sage-50 text-left text-xs uppercase text-forest-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Buyer</th>
                  <th className="px-4 py-3 font-semibold">Farmer</th>
                  <th className="px-4 py-3 font-semibold">Items</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-100">
                {myOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-sage-50">
                    <td className="px-4 py-3 font-medium text-forest-900">{o.orderNumber}</td>
                    <td className="px-4 py-3 text-forest-600">{o.buyerName}</td>
                    <td className="px-4 py-3 text-forest-600">{o.farmerName}</td>
                    <td className="px-4 py-3 text-forest-600">
                      {o.items.map((i) => `${i.quantity} ${i.unit} ${i.crop}`).join(", ")}
                    </td>
                    <td className="px-4 py-3 font-semibold text-forest-800">{formatNaira(o.total)}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3 text-xs text-forest-500">{formatDate(o.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Link to={`/orders/${o.id}`} className="inline-flex items-center gap-1 text-forest-600 hover:text-forest-800">
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
