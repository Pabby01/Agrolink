import { type ReactNode, useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  ShoppingCart,
  Truck,
  ShieldCheck,
  Leaf,
  Bell,
  LogOut,
  Menu,
  X,
  Sprout,
  Globe,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage, type Language } from "../context/LanguageContext";
import { Role } from "../types/enums";
import { MobileBottomNav } from "./MobileBottomNav";

export function AppLayout() {
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) {
    return <Outlet />;
  }

  const navItems = getNavItems(user.role);

  function handleLogout() {
    logout();
    navigate("/");
  }

  const NavLink = ({ to, icon, label }: { to: string; icon: ReactNode; label: string }) => {
    const active = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));
    return (
      <Link
        to={to}
        onClick={() => setMobileOpen(false)}
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          active
            ? "bg-forest-800 text-ivory-50"
            : "text-forest-700 hover:bg-sage-100"
        }`}
      >
        {icon}
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-ivory-100">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-sage-200 bg-white sticky top-0 h-screen">
        <div className="p-5 border-b border-sage-200">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest-800">
              <Sprout className="h-5 w-5 text-sage-300" />
            </div>
            <div>
              <div className="text-lg font-bold text-forest-900">Agrolink</div>
              <div className="text-[10px] text-forest-500 -mt-0.5">Farm to Market</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} icon={item.icon} label={item.label} />
          ))}
        </nav>

        <div className="p-3 border-t border-sage-200 space-y-2">
          <LanguageSelector language={language} setLanguage={setLanguage} />
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-ivory-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-700 text-ivory-50 text-sm font-semibold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-forest-800 truncate">{user.name}</div>
              <div className="text-xs text-forest-500 capitalize">{user.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between border-b border-sage-200 bg-white px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest-800">
            <Sprout className="h-4 w-4 text-sage-300" />
          </div>
          <span className="text-lg font-bold text-forest-900">Agrolink</span>
        </Link>
        <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-sage-100">
          <Menu className="h-5 w-5 text-forest-700" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-forest-900/50" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 bg-white flex flex-col fade-in">
            <div className="flex items-center justify-between p-5 border-b border-sage-200">
              <span className="text-lg font-bold text-forest-900">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="p-1 rounded hover:bg-sage-100">
                <X className="h-5 w-5 text-forest-700" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} icon={item.icon} label={item.label} />
              ))}
            </nav>
            <div className="p-3 border-t border-sage-200 space-y-2">
              <LanguageSelector language={language} setLanguage={setLanguage} />
              <button onClick={handleLogout} className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom tab bar */}
      <MobileBottomNav />
    </div>
  );
}

function LanguageSelector({ language, setLanguage }: { language: Language; setLanguage: (l: Language) => void }) {
  const [open, setOpen] = useState(false);
  const labels: Record<Language, string> = {
    english: "English",
    yoruba: "Yorùbá",
    igbo: "Igbo",
    hausa: "Hausa",
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-forest-700 hover:bg-sage-100"
      >
        <Globe className="h-4 w-4" />
        {labels[language]}
      </button>
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-1 rounded-lg border border-sage-200 bg-white shadow-lg py-1">
          {(Object.keys(labels) as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setLanguage(lang);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-sage-100 ${
                lang === language ? "font-semibold text-forest-800" : "text-forest-600"
              }`}
            >
              {labels[lang]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface NavItem {
  to: string;
  icon: ReactNode;
  label: string;
}

function getNavItems(role: Role): NavItem[] {
  const common: NavItem[] = [
    { to: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" />, label: "Dashboard" },
    { to: "/marketplace", icon: <Store className="h-4 w-4" />, label: "Marketplace" },
    { to: "/orders", icon: <ShoppingCart className="h-4 w-4" />, label: "Orders" },
    { to: "/deliveries", icon: <Truck className="h-4 w-4" />, label: "Deliveries" },
    { to: "/trust", icon: <ShieldCheck className="h-4 w-4" />, label: "Trust" },
    { to: "/crop-intelligence", icon: <Leaf className="h-4 w-4" />, label: "Crop Intelligence" },
    { to: "/notifications", icon: <Bell className="h-4 w-4" />, label: "Notifications" },
  ];

  if (role === Role.Admin) {
    return [
      { to: "/admin", icon: <LayoutDashboard className="h-4 w-4" />, label: "Overview" },
      { to: "/admin/users", icon: <ShieldCheck className="h-4 w-4" />, label: "Users" },
      { to: "/admin/orders", icon: <ShoppingCart className="h-4 w-4" />, label: "Orders" },
      { to: "/admin/shipments", icon: <Truck className="h-4 w-4" />, label: "Shipments" },
      { to: "/admin/risk", icon: <ShieldCheck className="h-4 w-4" />, label: "Risk" },
      { to: "/admin/audit", icon: <LayoutDashboard className="h-4 w-4" />, label: "Audit" },
    ];
  }

  return common;
}
