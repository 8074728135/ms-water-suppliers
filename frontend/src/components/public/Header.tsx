import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Droplets, Phone, ArrowRight, Menu, X, User, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const navLinks = [
    { label: 'Water Packages', href: '/#packages' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Price Estimator', href: '/#estimator' },
    { label: 'Purity Standards', href: '/#quality' },
    { label: 'Customer Reviews', href: '/#reviews' },
    { label: 'FAQs', href: '/#faqs' },
    { label: 'Contact', href: '/#contact' },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    if (href.startsWith('/#')) {
      const id = href.replace('/#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 h-[76px] bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="app-container h-full flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <Droplets className="w-5 h-5 fill-white/20" />
          </div>
          <div>
            <div className="text-base sm:text-lg font-black tracking-tight text-slate-900 flex items-center gap-1.5 leading-none">
              MS WATER <span className="text-sky-600">SUPPLIERS</span>
            </div>
            <div className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mt-1">
              HINDUPUR EXPRESS TANKERS
            </div>
          </div>
        </Link>

        {/* Amazon-style "Deliver to Hindupur" badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
          <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 block leading-tight">Delivering to</span>
            <span className="font-bold text-slate-800 leading-tight">Hindupur 515201</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-1 bg-slate-50 p-1.5 rounded-full border border-slate-200">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(link.href);
              }}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-sky-600 hover:bg-white transition-all shadow-xs"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Side Hotline, Login, CTA */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          {/* Hotline */}
          <a
            href="tel:9440523340"
            className="flex items-center gap-2 px-3 py-1.5 text-right text-slate-600 hover:text-sky-600 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
              <Phone className="w-3.5 h-3.5" />
            </div>
            <div className="text-left hidden md:block">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Fast Hotline
              </div>
              <div className="text-xs font-bold text-slate-900 tabular-nums">
                +91 94405 23340
              </div>
            </div>
          </a>

          {/* Customer Login or Dashboard */}
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="btn-secondary text-xs h-10 px-4 flex items-center gap-2"
            >
              <User className="w-3.5 h-3.5 text-sky-600" />
              <span>{user?.role === 'OWNER' ? 'Owner Portal' : user?.role === 'DRIVER' ? 'Driver Portal' : 'My Account'}</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="btn-secondary text-xs h-10 px-4 flex items-center gap-2"
            >
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Sign In</span>
            </Link>
          )}

          {/* Primary Book Now CTA */}
          <Link
            to={isAuthenticated ? "/customer/order" : "/login"}
            className="btn-primary text-xs h-10 px-4 font-bold"
          >
            <span>Book Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="xl:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-slate-200 px-4 py-6 space-y-4 shadow-xl animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <MapPin className="w-4 h-4 text-sky-600" />
            <span>Serving All Wards in <strong>Hindupur 515201</strong></span>
          </div>

          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="px-3 py-2.5 text-sm font-semibold text-slate-700 hover:text-sky-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <a
              href="tel:9440523340"
              className="flex items-center gap-2.5 text-sm font-bold text-slate-800 p-2 rounded-lg bg-sky-50/70 border border-sky-100"
            >
              <Phone className="w-4 h-4 text-sky-600" />
              <span>Hotline: +91 94405 23340</span>
            </a>

            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-secondary text-xs h-10 w-full"
              >
                Sign In
              </Link>
              <Link
                to="/customer/order"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary text-xs h-10 w-full font-bold"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
