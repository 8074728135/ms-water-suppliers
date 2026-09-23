import { useEffect, useRef } from 'react';
import { Droplets, Shield, Filter, CheckCircle2 } from 'lucide-react';

export default function QualitySection() {
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

  const qualityPillars = [
    {
      title: 'Deep Aquifer Source',
      desc: 'Sourced directly from deep natural Hindupur borewell aquifers, protected from surface contamination and monsoon runoff.',
      icon: Droplets,
    },
    {
      title: 'Regular Purity Testing',
      desc: 'Tested continuously for clarity, mineral softness, low sediment, and pleasant natural taste (TDS under 120 PPM).',
      icon: Filter,
    },
    {
      title: 'Hygienic Tank Transport',
      desc: 'Our delivery tankers undergo routine internal pressure washing and disinfection to maintain complete sanitary standards.',
      icon: Shield,
    },
    {
      title: 'On-Delivery Verification',
      desc: 'Our drivers perform an upfront visual and clarity check right at your sump entrance before unrolling pumping hoses.',
      icon: CheckCircle2,
    },
  ];

  return (
    <section id="quality" ref={sectionRef} className="py-24 sm:py-36 bg-slate-50 border-t border-slate-200/80">
      <div className="app-container space-y-16">
        
        {/* Section Header */}
        <div
          className="reveal-on-scroll section-header-block text-center max-w-2xl mx-auto space-y-4 mb-16 sm:mb-24 pb-4"
          style={{ marginBottom: '4.5rem' }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-sky-700 uppercase tracking-wider shadow-xs">
            <span>CERTIFIED HYGIENE & PURITY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Clean, Sweet & Refreshing Groundwater
          </h2>
          <p className="topic-desc text-base sm:text-lg text-slate-600 leading-relaxed mt-4">
            Our strict quality protocols ensure safe, pleasant water for your family, residential tenants, and commercial projects daily.
          </p>
        </div>

        {/* 4 Quality Cards with Generous 4-Sided Spacing */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 module-start-gap mt-16 sm:mt-24 pt-6"
          style={{ marginTop: '4rem' }}
        >
          {qualityPillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="reveal-on-scroll bg-white rounded-3xl border border-slate-200/90 quality-card space-y-6 flex flex-col justify-between group hover:border-sky-300 hover:shadow-md transition-all duration-300 shadow-xs"
                style={{
                  padding: '2.75rem 2.5rem',
                  transitionDelay: `${idx * 80}ms`,
                  boxSizing: 'border-box',
                }}
              >
                <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-all shadow-xs">
                  <Icon className="w-7 h-7" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-sky-600 transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
