import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Droplets,
  ShieldCheck,
  Truck,
  Clock,
  FileCheck,
  Phone,
  ArrowRight,
  Home,
  Building2,
  HardHat,
  Store,
  Star,
  Activity,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function HeroSection() {
  const { isAuthenticated } = useAuth();
  const [activePackage, setActivePackage] = useState<'FULL' | 'HALF' | 'DRUM'>('FULL');
  const sectionRef = useRef<HTMLElement>(null);

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1 }
    );
    const elements = sectionRef.current?.querySelectorAll('.reveal-on-scroll');
    elements?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const packageSpecs = {
    FULL: {
      title: 'Full Tanker',
      subtitle: 'Complete 10,000L Underground Sump Filling',
      price: '₹400',
      litres: '10,000',
      fillPercent: '95%',
      source: 'Tested Deep Borewell Aquifer',
      flowRate: '1,000 L / 5 mins',
      deliveryTime: 'Within 45–60 Mins',
      suitableFor: 'Independent houses, sumps & apartments',
      hoseLength: 'Up to 50 meters flexible discharge hose',
    },
    HALF: {
      title: 'Half Tanker',
      subtitle: 'Standard 5,000L Overhead & Cistern Delivery',
      price: '₹200',
      litres: '5,000',
      fillPercent: '55%',
      source: 'Tested Deep Borewell Aquifer',
      flowRate: '800 L / 5 mins',
      deliveryTime: 'Within 45–60 Mins',
      suitableFor: 'Small households, overhead Sintex & routine refills',
      hoseLength: 'Up to 40 meters flexible discharge hose',
    },
    DRUM: {
      title: 'Water Drum',
      subtitle: 'Hygienic 100L Sealed Drinking Water Supply',
      price: '₹50',
      litres: '100',
      fillPercent: '30%',
      source: 'Multi-Stage Filtered Drinking Water',
      flowRate: 'Direct Doorstep Delivery',
      deliveryTime: 'Same-Day Fast Dispatch',
      suitableFor: 'Commercial shops, caterers & emergency needs',
      hoseLength: 'Unloaded & positioned at your doorstep',
    },
  };

  const current = packageSpecs[activePackage];

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative pt-16 pb-28 sm:pt-20 sm:pb-36 overflow-hidden bg-gradient-to-b from-sky-50/50 via-white to-slate-50/60"
    >
      {/* Soft atmospheric ambient glow */}
      <div className="absolute top-0 right-1/4 w-[700px] h-[450px] bg-sky-100/40 rounded-full blur-[140px] pointer-events-none" />

      <div className="app-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Spacious Headline & Copy */}
          <div className="lg:col-span-6 space-y-9">
            
            {/* Trust Eyebrow Badge */}
            <div className="reveal-on-scroll inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-sky-200/90 shadow-xs text-xs font-semibold text-slate-700">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-bold text-slate-900">4.9 / 5.0</span>
              <span className="text-slate-300">•</span>
              <span className="text-sky-700 font-semibold">Hindupur's Most Trusted Water Delivery</span>
            </div>

            {/* Main Headline with Generous Line Height */}
            <h1 className="reveal-on-scroll text-4xl sm:text-5xl lg:text-[52px] font-extrabold tracking-tight text-slate-900 leading-[1.18]">
              Clean Groundwater & Water Tankers,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-sky-500 to-blue-700 block mt-2">
                Delivered in 60 Minutes.
              </span>
            </h1>

            {/* Supporting Description with Relaxed Spacing */}
            <p className="reveal-on-scroll topic-desc text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mb-4">
              Reliable doorstep water tankers across Hindupur with fixed, honest pricing and live fleet dispatch. From 100L clean drums to 10,000L full tankers for your sump, house, or business.
            </p>

            {/* 4 Feature Badges with Generous Room - Centered Alignment with Ample 4-Sided Padding */}
            <div className="reveal-on-scroll grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 py-2 mt-8 mb-8">
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col items-center text-center justify-center gap-3 hover:border-sky-300 hover:shadow-sm transition-all">
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Sweet Water</div>
                  <div className="text-[11px] text-slate-500 mt-1">TDS Tested</div>
                </div>
              </div>

              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col items-center text-center justify-center gap-3 hover:border-sky-300 hover:shadow-sm transition-all">
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Fast Dispatch</div>
                  <div className="text-[11px] text-slate-500 mt-1">Local Fleet</div>
                </div>
              </div>

              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col items-center text-center justify-center gap-3 hover:border-sky-300 hover:shadow-sm transition-all">
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Same Day</div>
                  <div className="text-[11px] text-slate-500 mt-1">Under 60 Mins</div>
                </div>
              </div>

              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col items-center text-center justify-center gap-3 hover:border-sky-300 hover:shadow-sm transition-all">
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Clear Billing</div>
                  <div className="text-[11px] text-slate-500 mt-1">UPI / Cash</div>
                </div>
              </div>
            </div>

            {/* CTAs with Generous Padding */}
            <div className="reveal-on-scroll flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4 mt-6">
              <Link
                to={isAuthenticated ? "/customer/order" : "/login"}
                className="btn-primary h-13 px-8 text-base font-bold shadow-md shadow-sky-600/20"
              >
                <Droplets className="w-5 h-5" />
                <span>Book Delivery Online</span>
                <ArrowRight className="w-5 h-5 ml-1" />
              </Link>

              <a
                href="tel:9440523340"
                className="btn-secondary h-13 px-7 text-sm font-bold flex items-center justify-center gap-2.5"
              >
                <Phone className="w-4 h-4 text-sky-600" />
                <span>Direct Hotline: +91 94405 23340</span>
              </a>
            </div>

            {/* Serving Target Row with Ample Margin */}
            <div className="reveal-on-scroll pt-6 flex flex-wrap items-center gap-6 border-t border-slate-200 text-xs font-medium text-slate-600">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">We Serve:</span>
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <Home className="w-4 h-4 text-sky-600" />
                <span>Homes & Sumps</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <Building2 className="w-4 h-4 text-sky-600" />
                <span>Apartments</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <HardHat className="w-4 h-4 text-sky-600" />
                <span>Construction</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <Store className="w-4 h-4 text-sky-600" />
                <span>Commercial Shops</span>
              </div>
            </div>

          </div>

          {/* Right Column: Decent, Modern Dispatch & Telemetry Hub (No Tacky Truck Photo) */}
          <div className="lg:col-span-6">
            <div className="reveal-on-scroll bg-white rounded-3xl border border-slate-200/90 shadow-md p-8 sm:p-10 space-y-8">
              
              {/* Card Top: Live Telemetry Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-800 tracking-wider uppercase">
                    Hindupur Live Dispatch Hub
                  </span>
                </div>
                <span className="text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full">
                  4 Tankers On Duty
                </span>
              </div>

              {/* Package Selector Pills with Breathing Space */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Select Water Volume
                </div>
                <div className="grid grid-cols-3 gap-2.5 p-1.5 rounded-2xl bg-slate-100/80 border border-slate-200 text-xs font-semibold">
                  {(['FULL', 'HALF', 'DRUM'] as const).map((pkg) => (
                    <button
                      key={pkg}
                      type="button"
                      onClick={() => setActivePackage(pkg)}
                      className={`py-2.5 px-3 rounded-xl transition-all font-bold ${
                        activePackage === pkg
                          ? 'bg-white text-sky-700 shadow-sm border border-slate-200/80'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {pkg === 'FULL' ? 'Full 10,000L' : pkg === 'HALF' ? 'Half 5,000L' : 'Drum 100L'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Package Highlight & Price */}
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {current.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    {current.subtitle}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-4xl font-black text-slate-900 tabular-nums tracking-tight">
                    {current.price}
                  </div>
                  <div className="text-xs font-bold text-emerald-600 mt-0.5">
                    Fixed Delivery Rate
                  </div>
                </div>
              </div>

              {/* Elegant Reservoir Visualizer & Liquid Level Indicator */}
              <div className="relative h-32 rounded-2xl bg-gradient-to-b from-sky-50 to-blue-50/40 border border-sky-200/80 overflow-hidden flex items-center justify-center p-7">
                {/* Fluid Liquid Level */}
                <div
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-sky-400 via-sky-300 to-sky-200/50 transition-all duration-700 ease-out"
                  style={{ height: current.fillPercent }}
                >
                  <div className="w-full h-1 bg-sky-500/30" />
                </div>

                {/* Calibrated Level Marks */}
                <div className="absolute right-5 inset-y-3.5 flex flex-col justify-between text-[10px] text-slate-400 font-mono select-none">
                  <span>10,000L</span>
                  <span>5,000L</span>
                  <span>100L</span>
                </div>

                {/* Center Badge */}
                <div className="relative z-10 text-center">
                  <div className="w-9 h-9 rounded-full bg-white/95 text-sky-600 shadow-xs flex items-center justify-center mx-auto mb-2">
                    <Droplets className="w-4.5 h-4.5 fill-sky-500" />
                  </div>
                  <div className="text-3xl font-black text-slate-900 tracking-tight tabular-nums">
                    {current.litres}
                  </div>
                  <div className="text-[10px] font-extrabold text-sky-800 tracking-widest uppercase mt-0.5">
                    LITRES CALIBRATED
                  </div>
                </div>
              </div>

              {/* Specifications & Logistics Metrics with Generous 4-Sided Padding */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-4.5 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-slate-500 text-[11px] font-medium">Delivery Guarantee</div>
                  <div className="font-bold text-emerald-700">{current.deliveryTime}</div>
                </div>
                <div className="p-4.5 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-slate-500 text-[11px] font-medium">Pumping Hose Reach</div>
                  <div className="font-bold text-slate-800 truncate">{current.hoseLength}</div>
                </div>
                <div className="p-4.5 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-slate-500 text-[11px] font-medium">Water Source</div>
                  <div className="font-bold text-slate-800">{current.source}</div>
                </div>
                <div className="p-4.5 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-slate-500 text-[11px] font-medium">Best Suited For</div>
                  <div className="font-bold text-slate-800 truncate">{current.suitableFor}</div>
                </div>
              </div>

              {/* Bottom Direct CTA */}
              <div className="pt-2">
                <Link
                  to={isAuthenticated ? "/customer/order" : "/login"}
                  className="btn-primary w-full h-12 text-sm font-bold shadow-md shadow-sky-600/20 flex items-center justify-center gap-2"
                >
                  <span>Confirm & Dispatch {current.title}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
