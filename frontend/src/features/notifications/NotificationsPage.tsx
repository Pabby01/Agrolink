import { Link } from "react-router-dom";
import { Bell, CheckCircle2, AlertTriangle, Info, XCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useAsync } from "../../lib/useAsync";
import { notificationService } from "../../services/aiService";
import { LoadingSpinner, ErrorState, EmptyState, PageHeader } from "../../components/ui";
import { timeAgo } from "../../lib/format";

export function NotificationsPage() {
  const { user } = useAuth();
  const { data: notifications, loading, error, refetch } = useAsync(
    () => notificationService.getNotifications(user!.id),
    [user?.id],
  );

  if (loading) return <LoadingSpinner label="Loading notifications..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const all = notifications ?? [];

  return (
    <div className="fade-in">
      <PageHeader title="Notifications" subtitle="Your latest activity and alerts." />

      {all.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-12 w-12" />}
          title="No notifications"
          message="You're all caught up. New activity will appear here."
          action={<Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>}
        />
      ) : (
        <div className="space-y-2">
          {all.map((n) => {
            const Icon = n.type === "success" ? CheckCircle2 : n.type === "warning" ? AlertTriangle : n.type === "error" ? XCircle : Info;
            const iconColor = n.type === "success" ? "text-sage-600" : n.type === "warning" ? "text-gold-600" : n.type === "error" ? "text-red-600" : "text-forest-600";
            const bgColor = n.type === "success" ? "bg-sage-50" : n.type === "warning" ? "bg-gold-50" : n.type === "error" ? "bg-red-50" : "bg-forest-50";

            return (
              <div key={n.id} className={`card p-4 flex items-start gap-3 ${!n.read ? "border-forest-300" : ""}`}>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bgColor} flex-shrink-0`}>
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-forest-900">{n.title}</h3>
                    <span className="text-xs text-forest-400 flex-shrink-0">{timeAgo(n.createdAt)}</span>
                  </div>
                  <p className="text-sm text-forest-600 mt-0.5">{n.message}</p>
                </div>
                {!n.read && <div className="h-2 w-2 rounded-full bg-forest-500 flex-shrink-0 mt-2" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
