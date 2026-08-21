import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  ShoppingCart,
  Truck,
  Leaf,
  ShieldCheck,
  Bell,
  AlertTriangle,
  FileText,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Role } from "../types/enums";
import type { ReactNode } from "react";

interface TabItem {
  to: string;
  icon: ReactNode;
  label: string;
}

function getBottomTabs(role: Role): TabItem[] {
  if (role === Role.Admin) {
    return [
      { to: "/admin", icon: <LayoutDashboard className="h-5 w-5" />, label: "Overview" },
      { to: "/admin/orders", icon: <ShoppingCart className="h-5 w-5" />, label: "Orders" },
      { to: "/admin/risk", icon: <AlertTriangle className="h-5 w-5" />, label: "Risk" },
      { to: "/admin/users", icon: <Users className="h-5 w-5" />, label: "Users" },
      { to: "/admin/audit", icon: <FileText className="h-5 w-5" />, label: "Audit" },
    ];
  }

  if (role === Role.Farmer) {
    return [
      { to: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" />, label: "Home" },
      { to: "/marketplace", icon: <Store className="h-5 w-5" />, label: "Market" },
      { to: "/orders", icon: <ShoppingCart className="h-5 w-5" />, label: "Orders" },
      { to: "/crop-intelligence", icon: <Leaf className="h-5 w-5" />, label: "AI Crop" },
      { to: "/notifications", icon: <Bell className="h-5 w-5" />, label: "Alerts" },
    ];
  }

  if (role === Role.Buyer) {
    return [
      { to: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" />, label: "Home" },
      { to: "/marketplace", icon: <Store className="h-5 w-5" />, label: "Market" },
      { to: "/orders", icon: <ShoppingCart className="h-5 w-5" />, label: "Orders" },
      { to: "/deliveries", icon: <Truck className="h-5 w-5" />, label: "Deliveries" },
      { to: "/trust", icon: <ShieldCheck className="h-5 w-5" />, label: "Trust" },
    ];
  }

  // Transporter
  return [
    { to: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" />, label: "Home" },
    { to: "/deliveries", icon: <Truck className="h-5 w-5" />, label: "Jobs" },
    { to: "/orders", icon: <ShoppingCart className="h-5 w-5" />, label: "Orders" },
    { to: "/trust", icon: <ShieldCheck className="h-5 w-5" />, label: "Trust" },
    { to: "/notifications", icon: <Bell className="h-5 w-5" />, label: "Alerts" },
  ];
}

export function MobileBottomNav() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const tabs = getBottomTabs(user.role);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-sage-200 bg-white/95 backdrop-blur-md safe-area-bottom">
      <div className="flex items-stretch justify-around">
        {tabs.map((tab) => {
          const active =
            tab.to === location.pathname ||
            (tab.to !== "/" && tab.to !== "/dashboard" && tab.to !== "/admin" && location.pathname.startsWith(tab.to)) ||
            (tab.to === "/dashboard" && location.pathname === "/dashboard") ||
            (tab.to === "/admin" && location.pathname === "/admin");

          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 pt-2.5 text-[10px] font-medium transition-colors ${
                active
                  ? "text-forest-800"
                  : "text-forest-400"
              }`}
            >
              <div className={`relative ${active ? "text-forest-800" : "text-forest-400"}`}>
                {tab.icon}
                {active && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-forest-700" />
                )}
              </div>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
