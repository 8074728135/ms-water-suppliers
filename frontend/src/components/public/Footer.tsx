import { Link } from 'react-router-dom';
import { Droplets, Phone, MapPin, ArrowUp } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-20 pb-16 border-t border-slate-800">
      <div className="app-container space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-5">
            <Link to="/" className="flex items-center gap-3.5 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
                <Droplets className="w-6 h-6 fill-white/20" />
              </div>
              <div>
                <div className="text-lg font-black tracking-tight text-white group-hover:text-sky-400 transition-colors">
                  MS WATER SUPPLIERS
                </div>
                <div className="text-[11px] font-bold text-sky-400 tracking-widest uppercase mt-0.5">
                  HINDUPUR EXPRESS TANKERS
                </div>
              </div>
            </Link>

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Hindupur's verified doorstep water delivery service. Providing fresh, sweet groundwater for households, sumps, apartments, and commercial projects across all municipal wards.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <a href="tel:9440523340" className="flex items-center gap-2 hover:text-white transition-colors font-bold text-slate-200">
                <Phone className="w-4 h-4 text-sky-400" />
                <span>+91 94405 23340</span>
              </a>
              <span>·</span>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-400" />
                <span>Hindupur, AP 515201</span>
              </span>
            </div>
          </div>

          {/* Quick Links: Services */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Water Packages
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>
                <a href="#packages" className="hover:text-white transition-colors">
                  Full Tanker (10,000L) - ₹400
                </a>
              </li>
              <li>
                <a href="#packages" className="hover:text-white transition-colors">
                  Half Tanker (5,000L) - ₹200
                </a>
              </li>
              <li>
                <a href="#packages" className="hover:text-white transition-colors">
                  Water Drum (100L) - ₹50
                </a>
              </li>
              <li>
                <a href="#estimator" className="hover:text-white transition-colors">
                  Delivery Price Calculator
                </a>
              </li>
            </ul>
          </div>

          {/* Standards & Areas */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Quality & Coverage
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>
                <a href="#coverage" className="hover:text-white transition-colors">
                  Hindupur Coverage Areas
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How Delivery Works
                </a>
              </li>
              <li>
                <a href="#quality" className="hover:text-white transition-colors">
                  Purity & Hygiene Standards
                </a>
              </li>
              <li>
                <a href="#reviews" className="hover:text-white transition-colors">
                  Customer Ratings & Reviews
                </a>
              </li>
              <li>
                <a href="#faqs" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
            </ul>
          </div>

          {/* Operations Portals */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Access Portals
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Customer Sign In
                </Link>
              </li>
              <li>
                <Link to="/customer/order" className="hover:text-white transition-colors">
                  Book Tanker Online
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Driver Dispatch Portal
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Owner Management Desk
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} MS Water Suppliers. All rights reserved. Hindupur, Andhra Pradesh.
          </div>

          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer transition-colors">Terms of Service</span>
            <button
              onClick={scrollToTop}
              className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:border-sky-500 transition-all ml-2 cursor-pointer"
              title="Back to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
