import { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import EditPhoneModal from '../customer/EditPhoneModal';
import {
  Droplets,
  Home,
  PlusCircle,
  ClipboardList,
  MapPin,
  User,
  Phone,
  LogOut,
  Edit2,
} from 'lucide-react';

interface CustomerLayoutProps {
  children: React.ReactNode;
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  const { user, logout } = useAuth();
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Home', path: '/customer', icon: Home, end: true },
    { label: 'Order Water', path: '/customer/order', icon: PlusCircle },
    { label: 'My Orders', path: '/customer/orders', icon: ClipboardList },
    { label: 'Addresses', path: '/customer/addresses', icon: MapPin },
    { label: 'Profile & Phone', path: '/customer/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Desktop & Tablet Top Header */}
      <header className="sticky top-0 z-40 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-6">
          <Link to="/customer" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900 tracking-tight">
                MS WATER SUPPLIERS
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Customer Portal · Hindupur
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 pl-4 border-l border-slate-200">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Sign Out */}
        <div className="flex items-center gap-3">
          {/* Clickable Phone Number / Profile Pill */}
          <button
            type="button"
            onClick={() => setShowPhoneModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-sky-50 hover:border-sky-300 transition-colors cursor-pointer text-left"
            title="Click to add or change your delivery phone number"
          >
            <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700 shrink-0">
              <Phone className="w-3.5 h-3.5" />
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-slate-900 leading-none">
                {user?.name || 'Customer'}
              </div>
              <div className="text-[11px] font-mono text-sky-700 font-bold mt-0.5">
                {user?.mobile ? `+91 ${user.mobile}` : 'Add Phone Number +'}
              </div>
            </div>
            <Edit2 className="w-3 h-3 text-slate-400 ml-1 hidden sm:block" />
          </button>

          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto pb-24 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-around px-2 shadow-lg">
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1.5 px-2 rounded-xl text-[10px] font-semibold transition-colors ${
                  isActive ? 'text-sky-600 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Quick Edit Phone Modal */}
      <EditPhoneModal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
      />
    </div>
  );
}
