import { MapPin, ArrowRight } from 'lucide-react';

export default function CoverageBar() {
  const areas = [
    'Melapuram Ward 1-4',
    'Kotnoor Rural & Colony',
    'Clock Tower & Main Bazaar',
    'Penukonda Road',
    'RTC Bus Stand',
    'Railway Colony',
    'Parigi Road',
    'Hindupur Industrial Estate',
    'Sevashrama Area',
    'Somandepalli Border',
  ];

  // Duplicate for infinite scroll illusion
  const tickerItems = [...areas, ...areas];

  return (
    <div id="coverage" className="w-full bg-sky-50/70 border-y border-sky-200/80 py-4.5 overflow-hidden">
      <div className="app-container flex items-center gap-5">
        {/* Left Badge */}
        <div className="flex items-center gap-2.5 text-xs font-bold text-sky-900 shrink-0">
          <MapPin className="w-4 h-4 text-sky-600" />
          <span className="hidden sm:inline">Active Municipal Delivery Zones:</span>
          <span className="sm:hidden">Coverage:</span>
        </div>

        {/* Auto-Scrolling Areas Ticker */}
        <div className="flex-1 overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-sky-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-sky-50 to-transparent z-10 pointer-events-none" />

          <div className="ticker-track">
            {tickerItems.map((area, index) => (
              <span key={`${area}-${index}`} className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-slate-800 font-semibold hover:text-sky-600 transition-colors cursor-default px-3.5 py-1.5 rounded-full bg-white/90 border border-sky-200/70 shadow-2xs">
                  {area}
                </span>
                <span className="text-sky-300 select-none text-xs">•</span>
              </span>
            ))}
          </div>
        </div>

        {/* View All Areas Link */}
        <a
          href="#contact"
          className="text-xs font-bold text-sky-700 hover:text-sky-800 flex items-center gap-1 shrink-0 whitespace-nowrap pl-2 group"
        >
          <span className="hidden sm:inline">View Dispatch Hub</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>
    </div>
  );
}
