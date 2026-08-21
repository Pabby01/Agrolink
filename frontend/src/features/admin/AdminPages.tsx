import { useAsync } from "../../lib/useAsync";
import { adminService, disputeService } from "../../services/aiService";
import { marketplaceService } from "../../services/marketplaceService";
import { orderService } from "../../services/orderService";
import { shipmentService } from "../../services/shipmentService";
import { mockStore } from "../../services/mockStore";
import { LoadingSpinner, ErrorState, PageHeader, StatusBadge, EmptyState } from "../../components/ui";
import { Users, ShoppingCart, Truck, AlertTriangle, ShieldCheck, TrendingUp, FileText, Activity } from "lucide-react";
import { formatNaira, formatDate, timeAgo } from "../../lib/format";
import { Link } from "react-router-dom";

export function AdminOverviewPage() {
  const { data: overview, loading, error, refetch } = useAsync(() => adminService.getOverview(), []);
  const { data: orders } = useAsync(() => orderService.getOrders(), []);
  const { data: shipments } = useAsync(() => shipmentService.getShipments(), []);
  const { data: disputes } = useAsync(() => disputeService.getDisputes(), []);
  const { data: riskSignals } = useAsync(() => adminService.getRiskSignals(), []);
  const { data: auditLogs } = useAsync(() => adminService.getAuditLogs(), []);
  const { data: listings } = useAsync(() => marketplaceService.getListings(), []);

  if (loading) return <LoadingSpinner label="Loading admin overview..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!overview) return null;

  const stats = [
    { label: "Total Farmers", value: overview.totalFarmers, icon: Users, color: "bg-forest-700" },
    { label: "Total Buyers", value: overview.totalBuyers, icon: ShoppingCart, color: "bg-sage-500" },
    { label: "Total Transporters", value: overview.totalTransporters, icon: Truck, color: "bg-gold-500" },
    { label: "Active Orders", value: overview.activeOrders, icon: Activity, color: "bg-forest-600" },
    { label: "Active Shipments", value: overview.activeShipments, icon: Truck, color: "bg-sage-600" },
    { label: "Open Disputes", value: overview.openDisputes, icon: AlertTriangle, color: "bg-red-500" },
    { label: "Average Trust", value: overview.averageTrust, icon: ShieldCheck, color: "bg-forest-700" },
    { label: "Total Listings", value: listings?.length ?? 0, icon: TrendingUp, color: "bg-sage-500" },
  ];

  return (
    <div className="fade-in">
      <PageHeader title="Admin Overview" subtitle="Platform-wide metrics and activity monitoring." />

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card p-5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color} text-white mb-3`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-3xl font-bold text-forest-900">{stat.value}</div>
              <div className="text-xs text-forest-500 mt-1">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-forest-700 uppercase">Recent Orders</h3>
            <Link to="/admin/orders" className="text-sm text-forest-600 hover:text-forest-800">View all</Link>
          </div>
          {(orders ?? []).length === 0 ? (
            <p className="text-sm text-forest-500 py-4 text-center">No orders yet.</p>
          ) : (
            <div className="space-y-2">
              {(orders ?? []).slice(0, 5).map((o) => (
                <div key={o.id} className="flex items-center justify-between py-2 border-b border-sage-100 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-forest-900">{o.orderNumber}</div>
                    <div className="text-xs text-forest-500">{o.buyerName} → {o.farmerName}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-forest-800">{formatNaira(o.total)}</span>
                    <StatusBadge status={o.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active shipments */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-forest-700 uppercase">Active Shipments</h3>
            <Link to="/admin/shipments" className="text-sm text-forest-600 hover:text-forest-800">View all</Link>
          </div>
          {(shipments ?? []).length === 0 ? (
            <p className="text-sm text-forest-500 py-4 text-center">No shipments yet.</p>
          ) : (
            <div className="space-y-2">
              {(shipments ?? []).slice(0, 5).map((s) => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-sage-100 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-forest-900">{s.orderNumber}</div>
                    <div className="text-xs text-forest-500">{s.crop} · {s.pickupLocation} → {s.dropoffLocation}</div>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Risk signals */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-forest-700 uppercase">Risk Signals</h3>
            <Link to="/admin/risk" className="text-sm text-forest-600 hover:text-forest-800">View all</Link>
          </div>
          {(riskSignals ?? []).length === 0 ? (
            <p className="text-sm text-forest-500 py-4 text-center">No risk signals detected.</p>
          ) : (
            <div className="space-y-2">
              {(riskSignals ?? []).map((r) => (
                <div key={r.id} className="flex items-start gap-3 py-2 border-b border-sage-100 last:border-0">
                  <AlertTriangle className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                    r.severity === "high" ? "text-red-600" : r.severity === "moderate" ? "text-gold-600" : "text-forest-600"
                  }`} />
                  <div>
                    <div className="text-sm font-medium text-forest-900">{r.type}</div>
                    <div className="text-xs text-forest-500">{r.entity} — {r.description}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audit log */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-forest-700 uppercase">Audit Events</h3>
            <Link to="/admin/audit" className="text-sm text-forest-600 hover:text-forest-800">View all</Link>
          </div>
          {(auditLogs ?? []).length === 0 ? (
            <p className="text-sm text-forest-500 py-4 text-center">No audit events.</p>
          ) : (
            <div className="space-y-2">
              {(auditLogs ?? []).slice(0, 6).map((log) => (
                <div key={log.id} className="flex items-start gap-3 py-2 border-b border-sage-100 last:border-0">
                  <FileText className="h-4 w-4 flex-shrink-0 mt-0.5 text-forest-500" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-forest-900">{log.event.replace(/_/g, " ")}</div>
                    <div className="text-xs text-forest-500">{log.description}</div>
                    <div className="text-xs text-forest-400 mt-0.5">{log.actor} · {timeAgo(log.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Disputes */}
      {(disputes ?? []).length > 0 && (
        <div className="card p-5 mt-6">
          <h3 className="text-sm font-semibold text-forest-700 uppercase mb-4">Open Disputes</h3>
          <div className="space-y-2">
            {(disputes ?? []).map((d) => (
              <div key={d.id} className="flex items-center justify-between py-2 border-b border-sage-100 last:border-0">
                <div>
                  <div className="text-sm font-medium text-forest-900">{d.orderNumber} — {d.reason}</div>
                  <div className="text-xs text-forest-500">{d.description}</div>
                </div>
                <StatusBadge status={d.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminUsersPage() {
  const { data: users, loading, error, refetch } = useAsync(async () => mockStore.users, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="fade-in">
      <PageHeader title="Users" subtitle="All registered users on the platform." />
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-sage-50 text-left text-xs uppercase text-forest-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100">
              {(users ?? []).map((u) => (
                <tr key={u.id} className="hover:bg-sage-50">
                  <td className="px-4 py-3 font-medium text-forest-900">{u.name}</td>
                  <td className="px-4 py-3 text-forest-600">{u.email}</td>
                  <td className="px-4 py-3 text-forest-600 capitalize">{u.role}</td>
                  <td className="px-4 py-3 text-forest-600">{u.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function AdminOrdersPage() {
  const { data: orders, loading, error, refetch } = useAsync(() => orderService.getOrders(), []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="fade-in">
      <PageHeader title="All Orders" subtitle="Platform-wide order management." />
      {(orders ?? []).length === 0 ? (
        <EmptyState icon={<ShoppingCart className="h-12 w-12" />} title="No orders" message="Orders will appear here when buyers place them." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-sage-50 text-left text-xs uppercase text-forest-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Buyer</th>
                  <th className="px-4 py-3 font-semibold">Farmer</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-100">
                {(orders ?? []).map((o) => (
                  <tr key={o.id} className="hover:bg-sage-50">
                    <td className="px-4 py-3 font-medium text-forest-900">
                      <Link to={`/orders/${o.id}`} className="hover:underline">{o.orderNumber}</Link>
                    </td>
                    <td className="px-4 py-3 text-forest-600">{o.buyerName}</td>
                    <td className="px-4 py-3 text-forest-600">{o.farmerName}</td>
                    <td className="px-4 py-3 font-semibold text-forest-800">{formatNaira(o.total)}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3 text-xs text-forest-500">{formatDate(o.createdAt)}</td>
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

export function AdminShipmentsPage() {
  const { data: shipments, loading, error, refetch } = useAsync(() => shipmentService.getShipments(), []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="fade-in">
      <PageHeader title="All Shipments" subtitle="Platform-wide delivery tracking." />
      {(shipments ?? []).length === 0 ? (
        <EmptyState icon={<Truck className="h-12 w-12" />} title="No shipments" message="Shipments will appear here when orders are placed." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-sage-50 text-left text-xs uppercase text-forest-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Crop</th>
                  <th className="px-4 py-3 font-semibold">Route</th>
                  <th className="px-4 py-3 font-semibold">Transporter</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-100">
                {(shipments ?? []).map((s) => (
                  <tr key={s.id} className="hover:bg-sage-50">
                    <td className="px-4 py-3 font-medium text-forest-900">{s.orderNumber}</td>
                    <td className="px-4 py-3 text-forest-600">{s.crop} ({s.quantity} {s.unit})</td>
                    <td className="px-4 py-3 text-forest-600">{s.pickupLocation} → {s.dropoffLocation}</td>
                    <td className="px-4 py-3 text-forest-600">{s.transporterName || "Unassigned"}</td>
                    <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
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

export function AdminRiskPage() {
  const { data: signals, loading, error, refetch } = useAsync(() => adminService.getRiskSignals(), []);
  const { data: disputes } = useAsync(() => disputeService.getDisputes(), []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="fade-in">
      <PageHeader title="Risk Signals" subtitle="Monitor platform risks and disputes." />

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-forest-700 uppercase mb-4">Risk Signals</h3>
          {(signals ?? []).length === 0 ? (
            <p className="text-sm text-forest-500 py-4 text-center">No risk signals detected.</p>
          ) : (
            <div className="space-y-3">
              {(signals ?? []).map((r) => (
                <div key={r.id} className="rounded-lg border border-sage-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-forest-900">{r.type}</span>
                    <span className={`badge ${
                      r.severity === "high" ? "bg-red-100 text-red-700" :
                      r.severity === "moderate" ? "bg-gold-100 text-gold-700" :
                      "bg-sage-100 text-forest-700"
                    }`}>
                      {r.severity}
                    </span>
                  </div>
                  <p className="text-sm text-forest-600">{r.description}</p>
                  <p className="text-xs text-forest-400 mt-1">{r.entity}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-forest-700 uppercase mb-4">Disputes</h3>
          {(disputes ?? []).length === 0 ? (
            <p className="text-sm text-forest-500 py-4 text-center">No disputes filed.</p>
          ) : (
            <div className="space-y-3">
              {(disputes ?? []).map((d) => (
                <div key={d.id} className="rounded-lg border border-sage-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-forest-900">{d.orderNumber}</span>
                    <StatusBadge status={d.status} />
                  </div>
                  <p className="text-sm text-forest-600">{d.reason}: {d.description}</p>
                  <p className="text-xs text-forest-400 mt-1">Raised by {d.raisedBy}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminAuditPage() {
  const { data: logs, loading, error, refetch } = useAsync(() => adminService.getAuditLogs(), []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="fade-in">
      <PageHeader title="Audit Logs" subtitle="All platform events and actions." />
      {(logs ?? []).length === 0 ? (
        <EmptyState icon={<FileText className="h-12 w-12" />} title="No audit events" message="Events will appear here as users interact with the platform." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-sage-50 text-left text-xs uppercase text-forest-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Event</th>
                  <th className="px-4 py-3 font-semibold">Actor</th>
                  <th className="px-4 py-3 font-semibold">Target</th>
                  <th className="px-4 py-3 font-semibold">Description</th>
                  <th className="px-4 py-3 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-100">
                {(logs ?? []).map((log) => (
                  <tr key={log.id} className="hover:bg-sage-50">
                    <td className="px-4 py-3 font-medium text-forest-900 capitalize">{log.event.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3 text-forest-600">{log.actor}</td>
                    <td className="px-4 py-3 text-forest-600">{log.target}</td>
                    <td className="px-4 py-3 text-forest-600">{log.description}</td>
                    <td className="px-4 py-3 text-xs text-forest-500">{timeAgo(log.createdAt)}</td>
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
