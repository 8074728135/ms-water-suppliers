import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Star, ShieldCheck, Zap, Droplets, Truck, Layers } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function WaterPackages() {
  const { isAuthenticated } = useAuth();
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

  const packages = [
    {
      id: 'full-tank',
      title: 'Full Tanker Delivery',
      capacity: '10,000 Litres',
      price: 400,
      priceLabel: '₹400',
      rating: '4.9',
      reviewCount: 420,
      badgeText: 'Most Popular for Sumps',
      description:
        'High-capacity bulk tanker for residential sumps, multi-family homes, apartment complexes, and construction sites.',
      icon: Truck,
      accentColor: 'from-sky-500 to-blue-600',
      features: [
        '10,000L high-volume discharge capacity',
        'Direct connection to underground sumps & tanks',
        'High-flow motorized pumping (1,000 L / 5 mins)',
        'Up to 50 meters flexible heavy-duty hose',
        'Natural sweet borewell groundwater (TDS tested)',
        'Instant digital bill with UPI / Cash receipt',
      ],
      deliveryPromise: 'Dispatched within 45–60 mins',
      popular: true,
    },
    {
      id: 'half-tank',
      title: 'Half Tanker Delivery',
      capacity: '5,000 Litres',
      price: 200,
      priceLabel: '₹200',
      rating: '4.8',
      reviewCount: 290,
      badgeText: 'Ideal for Independent Houses',
      description:
        'Right-sized tanker for standard independent homes, routine overhead Sintex tank top-ups, and 2–4 member families.',
      icon: Droplets,
      accentColor: 'from-sky-400 to-sky-600',
      features: [
        '5,000L rapid tank filling volume',
        'Compact tanker maneuverable through narrow streets',
        'Direct pumping into overhead or ground cisterns',
        'Up to 40 meters flexible discharge hose',
        'Tested clean, odour-free natural water',
        'Transparent fixed billing with zero bargaining',
      ],
      deliveryPromise: 'Same-day delivery guaranteed',
      popular: false,
    },
    {
      id: 'water-drum',
      title: 'Water Drum Supply',
      capacity: '100 Litres (Per Drum)',
      price: 50,
      priceLabel: '₹50',
      rating: '4.9',
      reviewCount: 180,
      badgeText: 'Doorstep Drinking Water',
      description:
        'Hygienically sanitized 100-litre food-grade drums delivered directly to your doorstep, shop, caterer, or event.',
      icon: Layers,
      accentColor: 'from-blue-500 to-indigo-600',
      features: [
        '100L heavy-duty food-grade sealed drum',
        'Multi-stage purified drinking water supply',
        'Order 1 to 20 drums in a single delivery',
        'Driver unloading and doorstep placement assistance',
        'Clean, tamper-sealed safety cap',
        'Ideal for small business, stores & emergency use',
      ],
      deliveryPromise: 'Immediate local doorstep arrival',
      popular: false,
    },
  ];

  return (
    <section id="packages" ref={sectionRef} className="py-24 sm:py-32 bg-white border-t border-slate-200/80">
      <div className="app-container space-y-16">
        
        {/* Section Header with Generous Line Height, Description Margin, and Safe Separation */}
        <div
          className="reveal-on-scroll section-header-block flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 sm:mb-24 pb-4"
          style={{ marginBottom: '4.5rem' }}
        >
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-xs font-bold text-sky-800 uppercase tracking-wider">
              <span>STANDARDIZED WATER PACKAGES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Honest, Fixed Pricing for Every Water Need
            </h2>
            <p className="topic-desc text-base sm:text-lg text-slate-600 leading-relaxed mt-4">
              No hidden fees, no seasonal surge pricing, and no bargaining. Choose your calibrated capacity and get it delivered in Hindupur.
            </p>
          </div>

          <a
            href="#estimator"
            className="text-sm font-bold text-sky-700 hover:text-sky-800 flex items-center gap-2 self-start md:self-auto shrink-0 group py-2"
          >
            <span>Open Capacity & Price Calculator</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* 3 Decent, Spacious Package Cards with Guaranteed Separation from Header */}
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10 items-stretch module-start-gap mt-16 sm:mt-24 pt-6"
          style={{ marginTop: '4rem' }}
        >
          {packages.map((pkg, idx) => {
            const Icon = pkg.icon;
            return (
              <div
                key={pkg.id}
                className={`reveal-on-scroll bg-white rounded-3xl border transition-all duration-300 flex flex-col justify-between relative group ${
                  pkg.popular
                    ? 'border-sky-400 ring-2 ring-sky-100 shadow-lg'
                    : 'border-slate-200/90 shadow-sm hover:border-sky-300 hover:shadow-md'
                }`}
                style={{
                  padding: '2.5rem 2.25rem',
                  transitionDelay: `${idx * 80}ms`,
                  boxSizing: 'border-box',
                }}
              >
                {/* Popular Badge */}
                {pkg.popular && (
                  <div className="absolute -top-3.5 left-8 px-4 py-1 rounded-full bg-gradient-to-r from-sky-600 to-blue-600 text-xs font-bold text-white uppercase tracking-wider shadow-md">
                    Recommended in Hindupur
                  </div>
                )}

                <div className="space-y-7">
                  
                  {/* Decent, Modern Graphic Header (Replacing Truck/Drum Photos) with Generous 4-Sided Padding */}
                  <div
                    className="rounded-2xl bg-gradient-to-br from-sky-50/80 via-blue-50/40 to-slate-50 border border-sky-100 flex items-center justify-between"
                    style={{ padding: '1.75rem 2rem', boxSizing: 'border-box' }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${pkg.accentColor} text-white flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-sky-800 uppercase tracking-wider">
                          Calibrated Capacity
                        </div>
                        <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                          {pkg.capacity}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
                        In Stock
                      </div>
                    </div>
                  </div>

                  {/* Title & Rating */}
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex items-center text-amber-400">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      </div>
                      <span className="text-xs font-bold text-slate-900">{pkg.rating}</span>
                      <span className="text-xs text-slate-400">({pkg.reviewCount} reviews)</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] font-semibold text-sky-700">{pkg.badgeText}</span>
                    </div>

                    <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                      {pkg.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      {pkg.description}
                    </p>
                  </div>

                  {/* Pricing Box with Generous 4-Sided Padding */}
                  <div className="p-6 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex items-baseline justify-between shadow-2xs">
                    <div>
                      <div className="text-xs text-slate-500 font-medium">Standard All-Inclusive Rate</div>
                      <div className="text-4xl font-black text-slate-900 tabular-nums tracking-tight mt-1">
                        {pkg.priceLabel}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-sky-600">Hindupur Municipal Wards</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{pkg.deliveryPromise}</div>
                    </div>
                  </div>

                  {/* Feature Checklist with Spacious Lines */}
                  <div className="space-y-3.5">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Included with Delivery:
                    </div>
                    <ul className="space-y-3">
                      {pkg.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
                          <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </div>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* Card Action Footer */}
                <div className="p-8 sm:p-10 pt-0">
                  <Link
                    to={isAuthenticated ? "/customer/order" : "/login"}
                    className={`w-full h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      pkg.popular
                        ? 'btn-primary shadow-md shadow-sky-600/20'
                        : 'bg-slate-900 text-white hover:bg-sky-600 shadow-xs'
                    }`}
                  >
                    <span>Book {pkg.title}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
