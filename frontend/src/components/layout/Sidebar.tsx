import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ClipboardList,
  Columns3,
  Users,
  Truck,
  BookOpen,
  CreditCard,
  Tag,
  Receipt,
  BarChart3,
  FileSpreadsheet,
  Settings,
  LogOut,
  Droplets,
  PackageCheck,
  PanelLeftClose,
  X,
} from 'lucide-react';

interface SidebarProps {
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({
  sidebarOpen = true,
  onToggleSidebar,
  mobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navGroups = [
    {
      label: 'OPERATIONS',
      items: [
        { label: 'Dashboard', path: '/owner', icon: LayoutDashboard, end: true },
        { label: 'Orders', path: '/owner/orders', icon: ClipboardList },
        { label: 'Dispatch Board', path: '/owner/dispatch', icon: Columns3 },
        { label: 'Drivers', path: '/owner/drivers', icon: Users },
        { label: 'Deliveries', path: '/owner/orders?status=DELIVERING', icon: PackageCheck },
      ],
    },
    {
      label: 'BUSINESS',
      items: [
        { label: 'Customers', path: '/owner/customers', icon: Users },
        { label: 'Khata / Ledger', path: '/owner/khata', icon: BookOpen },
        { label: 'Payments', path: '/owner/payments', icon: CreditCard },
        { label: 'Pricing', path: '/owner/pricing', icon: Tag },
      ],
    },
    {
      label: 'MANAGEMENT',
      items: [
        { label: 'Expenses', path: '/owner/expenses', icon: Receipt },
        { label: 'Vehicles', path: '/owner/vehicles', icon: Truck },
        { label: 'Analytics', path: '/owner/analytics', icon: BarChart3 },
        { label: 'Reports', path: '/owner/reports', icon: FileSpreadsheet },
      ],
    },
    {
      label: 'SYSTEM',
      items: [
        { label: 'Settings', path: '/owner/settings', icon: Settings },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white">
      {/* Brand Header with Close / Collapse Button */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 to-blue-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <Droplets className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black tracking-tight text-slate-900 truncate">
              MS WATER SUPPLIERS
            </div>
            <div className="text-[10px] text-slate-500 font-semibold tracking-wide uppercase">
              Operations Center
            </div>
          </div>
        </div>

        {/* Desktop / Laptop Collapse Button */}
        <button
          onClick={onToggleSidebar}
          className="hidden sm:flex p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
          title="Hide Sidebar"
          aria-label="Hide Sidebar"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={onCloseMobile}
          className="sm:hidden p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          title="Close Navigation"
          aria-label="Close Navigation"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Groups with Spacious Item Padding */}
      <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1.5">
            <div className="px-3 text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">
              {group.label}
            </div>
            <div className="space-y-1 pt-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    onClick={() => onCloseMobile?.()}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 text-[13px] font-semibold rounded-xl transition-all ${
                        isActive
                          ? 'bg-sky-50 text-sky-800 border border-sky-200/90 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Profile with Signout - Generous 4-Sided Space */}
      <div className="p-3.5 border-t border-slate-200 bg-slate-50/80">
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center text-xs font-bold text-sky-800 shrink-0">
              {user?.name ? user.name[0].toUpperCase() : 'O'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">
                {user?.name || 'Owner'}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop / Laptop / Tablet In-Flow Sidebar (Adjacent to main content so it NEVER cuts off!) */}
      {sidebarOpen && (
        <aside className="hidden sm:flex flex-col w-64 shrink-0 border-r border-slate-200 sticky top-0 h-screen z-30 transition-all duration-300">
          {sidebarContent}
        </aside>
      )}

      {/* 2. Mobile Backdrop & Slide-Over Drawer (< sm) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
