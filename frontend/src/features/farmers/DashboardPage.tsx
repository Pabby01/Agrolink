import { Link, Navigate } from "react-router-dom";
import { Plus, Eye, Camera, Package, Bell, Leaf } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useAsync } from "../../lib/useAsync";
import { TrustScore } from "../../components/TrustScore";
import { LoadingSpinner, EmptyState, PageHeader, StatusBadge } from "../../components/ui";
import { marketplaceService } from "../../services/marketplaceService";
import { orderService } from "../../services/orderService";
import { notificationService } from "../../services/aiService";
import { Role } from "../../types/enums";

export function DashboardPage() {
  const { user } = useAuth();
  if (!user) return null;

  if (user.role === Role.Admin) {
    return <Navigate to="/admin" replace />;
  }

  return <RoleDashboard userId={user.id} userName={user.name} role={user.role} />;
}

function RoleDashboard({ userId, userName, role }: { userId: string; userName: string; role: Role }) {
  const { data: listings, loading: listingsLoading } = useAsync(
    () => marketplaceService.getListings(),
    [],
  );
  const { data: orders, loading: ordersLoading } = useAsync(
    () => orderService.getOrders(),
    [],
  );
  const { data: notifications } = useAsync(
    () => notificationService.getNotifications(userId),
    [userId],
  );

  const myListings = listings?.filter((l) => l.farmerId === userId) ?? [];
  const myOrders = orders ?? [];
  const recentNotifications = notifications?.slice(0, 3) ?? [];

  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  const greeting = role === Role.Farmer ? "Farm Dashboard" : role === Role.Buyer ? "Buyer Dashboard" : "Transport Dashboard";

  return (
    <div className="fade-in">
      <PageHeader
        title={greeting}
        subtitle={`Welcome back, ${userName}`}
        action={
          role === Role.Farmer && (
            <Link to="/marketplace/create" className="btn-primary">
              <Plus className="h-4 w-4" />
              Create Listing
            </Link>
          )
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Trust score */}
        <div>
          <TrustScore userId={userId} name={userName} />
        </div>

        {/* Role-specific cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick actions */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-forest-700 uppercase mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <QuickAction to="/marketplace" icon={Eye} label="Browse Marketplace" />
              <QuickAction to="/orders" icon={Package} label="View Orders" />
              <QuickAction to="/crop-intelligence" icon={Camera} label="Crop Scanner" />
              <QuickAction to="/notifications" icon={Bell} label="Notifications" />
            </div>
          </div>

          {/* Farmer: Listings */}
          {role === Role.Farmer && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-forest-700 uppercase">My Listings</h3>
                <Link to="/marketplace" className="text-sm text-forest-600 hover:text-forest-800">View all</Link>
              </div>
              {listingsLoading ? (
                <LoadingSpinner />
              ) : myListings.length === 0 ? (
                <EmptyState
                  icon={<Leaf className="h-10 w-10" />}
                  title="No listings yet"
                  message="Create your first produce listing to start selling."
                  action={<Link to="/marketplace/create" className="btn-primary"><Plus className="h-4 w-4" />Create Listing</Link>}
                />
              ) : (
                <div className="space-y-2">
                  {myListings.map((l) => (
                    <div key={l.id} className="flex items-center justify-between rounded-lg border border-sage-200 p-3">
                      <div>
                        <div className="font-medium text-forest-900">{l.crop}</div>
                        <div className="text-xs text-forest-500">{l.quantity} {l.unit} · ₦{l.pricePerUnit.toLocaleString()}/{l.unit}</div>
                      </div>
                      <StatusBadge status={l.availability} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Orders summary */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-forest-700 uppercase">
                {role === Role.Farmer ? "Active Orders" : role === Role.Buyer ? "Recent Orders" : "Delivery Jobs"}
              </h3>
              <Link to="/orders" className="text-sm text-forest-600 hover:text-forest-800">View all</Link>
            </div>
            {ordersLoading ? (
              <LoadingSpinner />
            ) : myOrders.length === 0 ? (
              <EmptyState
                icon={<Package className="h-10 w-10" />}
                title="No orders yet"
                message={
                  role === Role.Buyer
                    ? "Browse the marketplace to place your first order."
                    : role === Role.Farmer
                    ? "When buyers order your produce, they'll appear here."
                    : "Delivery jobs will appear here when orders are placed."
                }
                action={role === Role.Buyer ? <Link to="/marketplace" className="btn-primary">Browse Marketplace</Link> : undefined}
              />
            ) : (
              <div className="space-y-2">
                {myOrders.slice(0, 5).map((o) => (
                  <Link
                    key={o.id}
                    to={`/orders/${o.id}`}
                    className="flex items-center justify-between rounded-lg border border-sage-200 p-3 hover:border-forest-400 transition-colors"
                  >
                    <div>
                      <div className="font-medium text-forest-900">{o.orderNumber}</div>
                      <div className="text-xs text-forest-500">
                        {o.items[0]?.crop} · {o.items[0]?.quantity} {o.items[0]?.unit}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-forest-800">₦{o.total.toLocaleString()}</span>
                      <StatusBadge status={o.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent activity / notifications */}
          {recentNotifications.length > 0 && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-forest-700 uppercase mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentNotifications.map((n) => (
                  <div key={n.id} className="flex items-start gap-3">
                    <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                      n.type === "success" ? "bg-sage-500" :
                      n.type === "warning" ? "bg-gold-400" :
                      n.type === "error" ? "bg-red-500" : "bg-forest-500"
                    }`} />
                    <div>
                      <div className="text-sm font-medium text-forest-800">{n.title}</div>
                      <div className="text-xs text-forest-500">{n.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI CTA for farmers */}
          {role === Role.Farmer && (
            <Link to="/crop-intelligence" className="block card p-6 bg-forest-900 text-ivory-50 border-forest-800 hover:bg-forest-800 transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage-400">
                  <Camera className="h-6 w-6 text-forest-900" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">AI Crop Intelligence</h3>
                  <p className="text-sm text-sage-200">Scan your crops for disease diagnosis and get AI-powered recommendations.</p>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickAction({ to, icon: Icon, label }: { to: string; icon: typeof Eye; label: string }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-2 rounded-lg border border-sage-200 p-3 hover:border-forest-400 hover:bg-sage-50 transition-colors text-center"
    >
      <Icon className="h-5 w-5 text-forest-600" />
      <span className="text-xs font-medium text-forest-700">{label}</span>
    </Link>
  );
}
