import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

export function LoadingSpinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-forest-500" />
      {label && <p className="text-sm text-forest-500">{label}</p>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="rounded-full bg-red-50 p-3">
        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <p className="text-sm text-red-700">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-outline text-sm">
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon, title, message, action }: { icon?: ReactNode; title: string; message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
      {icon && <div className="text-forest-300">{icon}</div>}
      <h3 className="text-lg font-semibold text-forest-800">{title}</h3>
      <p className="text-sm text-forest-500 max-w-sm">{message}</p>
      {action}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-forest-900">{title}</h1>
        {subtitle && <p className="text-sm text-forest-500 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-gold-100 text-gold-700",
    confirmed: "bg-sage-100 text-forest-700",
    in_transit: "bg-blue-100 text-blue-700",
    delivered: "bg-sage-200 text-forest-800",
    completed: "bg-forest-100 text-forest-800",
    cancelled: "bg-red-100 text-red-700",
    disputed: "bg-red-100 text-red-700",
    available: "bg-blue-100 text-blue-700",
    accepted: "bg-sage-100 text-forest-700",
    picked_up: "bg-gold-100 text-gold-700",
    open: "bg-red-100 text-red-700",
    under_review: "bg-gold-100 text-gold-700",
    resolved: "bg-sage-100 text-forest-700",
    rejected: "bg-red-100 text-red-700",
  };

  const label = status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span className={`badge ${colors[status] || "bg-gray-100 text-gray-700"}`}>
      {label}
    </span>
  );
}
