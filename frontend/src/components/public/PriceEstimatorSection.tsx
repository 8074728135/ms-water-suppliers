import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Zap,
  Receipt,
  Minus,
  Plus,
  Calculator,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function PriceEstimatorSection() {
  const { isAuthenticated } = useAuth();
  const [selectedService, setSelectedService] = useState<'FULL' | 'HALF' | 'DRUM'>('FULL');
  const [selectedLocation, setSelectedLocation] = useState('Melapuram Ward 1-4');
  const [drumQty, setDrumQty] = useState(1);
  const sectionRef = useRef<HTMLElement>(null);

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

  const locations = [
    'Melapuram Ward 1-4',
    'Kotnoor Rural & Colony',
    'Clock Tower & Main Bazaar',
    'Penukonda Road',
    'RTC Bus Stand Area',
    'Railway Colony',
    'Parigi Road',
    'Hindupur Industrial Estate',
    'Lepakshi Gate Bypass',
  ];

  const prices = {
    FULL: 400,
    HALF: 200,
    DRUM: 50,
  };

  const calculatedTotal =
    selectedService === 'DRUM' ? prices.DRUM * drumQty : prices[selectedService];

  const capacityMap = {
    FULL: '10,000 Litres',
    HALF: '5,000 Litres',
    DRUM: `${drumQty * 100} Litres (${drumQty} × 100L Drums)`,
  };

  return (
    <section id="estimator" ref={sectionRef} className="py-24 sm:py-36 bg-white border-t border-slate-200/80">
      <div className="app-container space-y-16">
        
        {/* Section Header */}
        <div className="reveal-on-scroll section-header-block text-center max-w-2xl mx-auto space-y-4 mb-16 sm:mb-24 pb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-xs font-bold text-sky-700 uppercase tracking-wider">
            <Calculator className="w-3.5 h-3.5" />
            <span>TRANSPARENT PRICING CALCULATOR</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Calculate Delivery Cost in Hindupur
          </h2>
          <p className="topic-desc text-base sm:text-lg text-slate-600 leading-relaxed mt-4">
            Select your required water package and delivery locality in Hindupur to see your exact all-inclusive cost.
          </p>
        </div>

        {/* 2-Column Calculator Grid with Generous Gaps */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start module-start-gap mt-16 sm:mt-24 pt-6">
          
          {/* Left Column: Form Controls */}
          <div
            className="reveal-on-scroll lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 space-y-8 shadow-sm"
            style={{ padding: '2.75rem 2.5rem', boxSizing: 'border-box' }}
          >
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Delivery Specifications
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mt-1">
                Customize your required capacity and delivery area for immediate dispatch calculation.
              </p>
            </div>

            {/* Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Select Package */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Water Package
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sky-600">
                    <Truck className="w-4 h-4" />
                  </div>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value as any)}
                    className="input-field pl-11 text-xs sm:text-sm font-semibold text-slate-900 h-13"
                  >
                    <option value="FULL">Full Tanker (10,000L) - ₹400</option>
                    <option value="HALF">Half Tanker (5,000L) - ₹200</option>
                    <option value="DRUM">Water Drum (100L) - ₹50 each</option>
                  </select>
                </div>
              </div>

              {/* Delivery Location */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Hindupur Locality
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sky-600">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="input-field pl-11 text-xs sm:text-sm font-semibold text-slate-900 h-13"
                  >
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Drum Qty selector if Drum is selected with Generous 4-Sided Space */}
            {selectedService === 'DRUM' && (
              <div
                className="flex items-center justify-between rounded-2xl bg-sky-50/70 border border-sky-200 animate-fade-in"
                style={{ padding: '1.75rem 2rem', boxSizing: 'border-box' }}
              >
                <div>
                  <div className="text-sm font-bold text-slate-900">Quantity of Drums</div>
                  <div className="text-xs text-slate-500 mt-1">100 Litres per food-grade sealed drum</div>
                </div>
                <div className="flex items-center gap-3.5">
                  <button
                    type="button"
                    onClick={() => setDrumQty(Math.max(1, drumQty - 1))}
                    className="w-10 h-10 rounded-xl bg-white border border-slate-300 flex items-center justify-center text-slate-700 hover:border-sky-500 hover:text-sky-600 shadow-xs transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-lg font-black text-slate-900 w-8 text-center tabular-nums">
                    {drumQty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDrumQty(Math.min(20, drumQty + 1))}
                    className="w-10 h-10 rounded-xl bg-white border border-slate-300 flex items-center justify-center text-slate-700 hover:border-sky-500 hover:text-sky-600 shadow-xs transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Value Props Strip with Generous 4-Sided Padding */}
            <div
              className="rounded-2xl bg-slate-50 border border-slate-200/90 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600"
              style={{ padding: '1.5rem 1.75rem', boxSizing: 'border-box' }}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                <span className="font-semibold text-slate-800">Zero Hidden Charges</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Zap className="w-4.5 h-4.5 text-sky-600 shrink-0" />
                <span className="font-semibold text-slate-800">60-Min Fast Dispatch</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Receipt className="w-4.5 h-4.5 text-blue-600 shrink-0" />
                <span className="font-semibold text-slate-800">Instant Digital Bill</span>
              </div>
            </div>

          </div>

          {/* Right Column: Order Estimate Summary */}
          <div
            className="reveal-on-scroll lg:col-span-5 bg-gradient-to-b from-sky-50/60 to-white rounded-3xl border border-sky-200/90 space-y-8 shadow-sm"
            style={{ padding: '2.75rem 2.5rem', boxSizing: 'border-box' }}
          >
            <div>
              <div className="text-xs font-bold text-sky-800 uppercase tracking-wider">
                Instant Price Summary
              </div>
              <div className="text-4xl sm:text-5xl font-black text-slate-900 tabular-nums tracking-tight mt-2">
                ₹{calculatedTotal}
              </div>
              <div className="text-xs text-emerald-700 font-semibold mt-1">
                All-inclusive total delivered to your doorstep
              </div>
            </div>

            {/* Breakdown List */}
            <div className="space-y-3.5 text-xs sm:text-sm border-y border-sky-100 py-6">
              <div className="flex items-center justify-between text-slate-600">
                <span>Selected Package</span>
                <span className="font-bold text-slate-900">
                  {selectedService === 'FULL' ? 'Full Tanker' : selectedService === 'HALF' ? 'Half Tanker' : 'Water Drum'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Total Water Volume</span>
                <span className="font-bold text-sky-700">{capacityMap[selectedService]}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Delivery Area</span>
                <span className="font-bold text-slate-900 truncate max-w-[180px]">{selectedLocation}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Pumping & Discharge Hose</span>
                <span className="font-bold text-emerald-700">Included Free</span>
              </div>
            </div>

            {/* Action CTA */}
            <div className="space-y-3">
              <Link
                to={isAuthenticated ? "/customer/order" : "/login"}
                className="btn-primary w-full h-13 text-sm font-bold shadow-md shadow-sky-600/20 flex items-center justify-center gap-2"
              >
                <span>Book This Delivery (₹{calculatedTotal})</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="text-center text-xs text-slate-500">
                Pay on delivery via Cash or PhonePe / Google Pay QR
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
