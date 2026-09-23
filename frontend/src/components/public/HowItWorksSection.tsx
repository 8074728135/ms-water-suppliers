import { useEffect, useRef } from 'react';
import { MousePointerClick, Truck, Droplets, CheckCircle2, Award } from 'lucide-react';

export default function HowItWorksSection() {
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

  const steps = [
    {
      step: '01',
      title: 'Choose Package & Location',
      description:
        'Select your required volume (Full 10,000L, Half 5,000L, or 100L Drum), enter your Hindupur street address, and pick an immediate or scheduled delivery window.',
      icon: MousePointerClick,
      badge: 'Takes 60 Seconds',
    },
    {
      step: '02',
      title: 'Instant Fleet Dispatch',
      description:
        'Our central Hindupur logistics hub assigns the closest tanker driver. You receive direct dispatch notifications until the vehicle arrives at your gate.',
      icon: Truck,
      badge: 'Local Fleet Active',
    },
    {
      step: '03',
      title: 'Clean Sump Pumping',
      description:
        'Our driver unrolls flexible high-pressure hoses and pumps fresh groundwater directly into your underground sump or overhead Sintex tank. Pay via UPI or Cash.',
      icon: Droplets,
      badge: 'Contactless & Quick',
    },
  ];

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="py-24 sm:py-36 bg-slate-50 border-t border-slate-200/80"
    >
      <div className="app-container space-y-16">
        
        {/* Section Header with Spacious Margins */}
        <div
          className="reveal-on-scroll section-header-block text-center max-w-2xl mx-auto space-y-4 mb-16 sm:mb-24 pb-4"
          style={{ marginBottom: '4.5rem' }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-sky-700 uppercase tracking-wider shadow-xs">
            <span>SIMPLE 3-STEP FULFILLMENT</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            How Doorstep Water Delivery Works
          </h2>
          <p className="topic-desc text-base sm:text-lg text-slate-600 leading-relaxed mt-4">
            Reliable, hassle-free bulk water delivery for independent homes, residential apartments, and commercial projects in Hindupur.
          </p>
        </div>

        {/* 3 Step Cards Grid with Breathing Room */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 relative module-start-gap mt-16 sm:mt-24 pt-6"
          style={{ marginTop: '4rem' }}
        >
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="reveal-on-scroll bg-white rounded-3xl border border-slate-200/90 flex flex-col justify-between relative group hover:border-sky-300 hover:shadow-md transition-all duration-300"
                style={{
                  padding: '2.75rem 2.5rem',
                  transitionDelay: `${idx * 100}ms`,
                  boxSizing: 'border-box',
                }}
              >
                {/* Step Header */}
                <div className="flex items-center justify-between mb-8">
                  <span className="text-4xl font-black text-sky-600/20 group-hover:text-sky-600/60 transition-colors font-mono">
                    {item.step}
                  </span>
                  <span className="text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-3.5 py-1.5 rounded-full">
                    {item.badge}
                  </span>
                </div>

                {/* Icon & Details */}
                <div className="space-y-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>

                {/* Bottom Trust Badge */}
                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Verified SOP execution</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Fast Assurance Bar with Generous 4-Sided Space */}
        <div
          className="reveal-on-scroll rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left mt-12 shadow-xs"
          style={{ padding: '2rem 2.5rem', boxSizing: 'border-box' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-base font-bold text-slate-900">
                100% Pumping & Hose Deployment Included
              </div>
              <div className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Drivers manage complete unloading and pump operations at zero extra labor cost.
              </div>
            </div>
          </div>
          <a
            href="#packages"
            className="text-xs font-bold text-sky-700 hover:text-sky-800 shrink-0 uppercase tracking-wider px-5 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 transition-colors"
          >
            Explore All Packages →
          </a>
        </div>

      </div>
    </section>
  );
}