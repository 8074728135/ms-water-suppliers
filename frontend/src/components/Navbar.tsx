import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Droplets, Shield, Truck, User, LogOut, Menu, X, Sparkles, PhoneCall, ArrowRight } from 'lucide-react';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const getDashboardPath = () => {
    if (user?.role === 'OWNER') return '/owner';
    if (user?.role === 'DRIVER') return '/driver';
    return '/customer';
  };

  const getRoleBadge = () => {
    if (user?.role === 'OWNER') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
          <Shield className="w-3.5 h-3.5" /> Owner
        </span>
      );
    }
    if (user?.role === 'DRIVER') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <Truck className="w-3.5 h-3.5" /> Driver
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
        <User className="w-3.5 h-3.5" /> Customer
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/95 border-b border-slate-200/80 shadow-xs transition-all">
      <div className="app-container">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-3.5 group flex-shrink-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Droplets className="w-6 h-6" />
            </div>
            <div>
              <div className="text-base sm:text-xl font-black tracking-wider flex items-center gap-1.5 text-slate-900">
                MS WATER <span className="text-sky-600">SUPPLIERS</span>
              </div>
              <div className="text-[10px] sm:text-xs font-bold text-slate-500 tracking-widest uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Hindupur Express Tankers
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-7 text-xs font-bold text-slate-700">
            <a href="/#packages" className="hover:text-sky-600 transition-colors">
              Water Packages
            </a>
            <a href="/#estimator" className="hover:text-sky-600 transition-colors">
              Cost Estimator
            </a>
            <a href="/#how-it-works" className="hover:text-sky-600 transition-colors">
              How It Works
            </a>
            <a href="/#coverage" className="hover:text-sky-600 transition-colors">
              Coverage Areas
            </a>
            <a href="/#faqs" className="hover:text-sky-600 transition-colors">
              FAQs
            </a>
          </nav>

          {/* Desktop Action Buttons & Hotline */}
          <div className="hidden md:flex items-center gap-3.5 flex-shrink-0">
            <a
              href="tel:9999999999"
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-sky-50 border border-sky-200 text-xs font-bold text-sky-800 hover:bg-sky-100 transition-all shadow-xs"
              title="Click to call direct dispatch"
            >
              <PhoneCall className="w-3.5 h-3.5 text-sky-600" />
              <span>Hotline: 99999 99999</span>
            </a>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {getRoleBadge()}
                <Link
                  to={getDashboardPath()}
                  className="btn-primary text-xs h-11 px-5 font-bold flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl bg-white border border-slate-300 text-slate-600 hover:text-red-600 hover:border-red-300 shadow-xs transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="btn-secondary text-xs h-11 px-5 font-bold"
                >
                  Sign In
                </Link>
                <Link
                  to="/customer/order"
                  className="btn-primary text-xs h-11 px-5 font-bold flex items-center gap-1.5"
                >
                  <span>Book Tanker</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated && getRoleBadge()}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white p-5 space-y-4 shadow-xl">
          <a
            href="tel:9999999999"
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-sky-50 border border-sky-200 text-xs font-bold text-sky-800"
          >
            <PhoneCall className="w-4 h-4 text-sky-600" />
            Direct Helpline: 99999 99999
          </a>

          <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700 pt-2 border-t border-slate-100">
            <a
              href="/#packages"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center hover:text-sky-600"
            >
              Water Packages
            </a>
            <a
              href="/#estimator"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center hover:text-sky-600"
            >
              Cost Estimator
            </a>
            <a
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center hover:text-sky-600"
            >
              How It Works
            </a>
            <a
              href="/#coverage"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center hover:text-sky-600"
            >
              Coverage
            </a>
          </div>

          {isAuthenticated ? (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary w-full h-11 text-xs font-bold flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Go to Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 font-bold text-xs flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-secondary h-11 text-center font-bold text-xs flex items-center justify-center"
              >
                Sign In
              </Link>
              <Link
                to="/customer/order"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary h-11 text-center font-bold text-xs flex items-center justify-center"
              >
                Book Tanker
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
