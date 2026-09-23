import React from 'react';
import { Droplets, Sparkles, ShieldCheck, Activity, Gauge, Truck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface WaterTankVisualizerProps {
  volumeLitres?: number;
  capacityLitres?: number;
  serviceName?: string;
  price?: number;
  showControls?: boolean;
  onSelectService?: (serviceName: string) => void;
}

export default function WaterTankVisualizer({
  volumeLitres = 10000,
  capacityLitres = 10000,
  serviceName = 'Full Tank (10,000L)',
  price = 400,
  showControls = true,
  onSelectService,
}: WaterTankVisualizerProps) {
  // Compute percentage safely between 12% and 100%
  const percentage = Math.min(Math.max((volumeLitres / capacityLitres) * 100, 14), 100);

  return (
    <div className="w-full glass-cyber rounded-3xl p-5 sm:p-7 border border-sky-500/25 shadow-2xl relative overflow-hidden flex flex-col justify-between">
      {/* Background ambient water glow */}
      <div className="absolute -right-16 -top-16 w-56 h-56 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Title, Volume, and Pricing */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center justify-center flex-shrink-0 shadow-md">
            <Droplets className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-white tracking-wide">
                {serviceName}
              </h3>
              <span className="text-xs px-3.5 py-1.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 font-bold">
                {volumeLitres.toLocaleString()} Litres
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">
              Source: Deep Natural Hindupur Spring Aquifer
            </p>
          </div>
        </div>

        <div className="text-right ml-auto">
          <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-emerald-300">
            ₹{price}
          </div>
          <div className="text-[10px] sm:text-[11px] text-emerald-400 flex items-center justify-end gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Ready for Instant Dispatch
          </div>
        </div>
      </div>

      {/* Tank Capacity Preset Selection Tabs */}
      {showControls && (
        <div className="mb-5 relative z-10">
          <div className="grid grid-cols-3 gap-2.5 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800">
            <button
              type="button"
              onClick={() => onSelectService?.('FULL_TANK')}
              className={`py-3 px-3.5 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                volumeLitres === 10000
                  ? 'gradient-water text-white shadow-lg shadow-cyan-500/30 scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Truck className="w-4 h-4 flex-shrink-0" />
              <span>Full Tank (10kL)</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectService?.('HALF_TANK')}
              className={`py-3 px-3.5 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                volumeLitres === 5000
                  ? 'gradient-water text-white shadow-lg shadow-cyan-500/30 scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Droplets className="w-4 h-4 flex-shrink-0" />
              <span>Half Tank (5kL)</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectService?.('DRUM')}
              className={`py-3 px-3.5 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                volumeLitres === 100
                  ? 'gradient-water text-white shadow-lg shadow-cyan-500/30 scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Gauge className="w-4 h-4 flex-shrink-0" />
              <span>Drum (100L)</span>
            </button>
          </div>
        </div>
      )}

      {/* 3D Glass Water Tank Visualization */}
      <div className="relative h-56 sm:h-64 w-full rounded-2xl bg-slate-950/95 border-2 border-cyan-500/30 p-2 overflow-hidden shadow-inner flex flex-col justify-end">
        {/* Tank Graduations */}
        <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-3.5 text-[10px] font-mono text-cyan-300/40">
          <div className="flex justify-between items-center border-b border-cyan-500/10 pb-1">
            <span>10,000 L [FULL TANK]</span>
            <span className="text-cyan-400 font-bold">100%</span>
          </div>
          <div className="flex justify-between items-center border-b border-cyan-500/10 pb-1">
            <span>7,500 L [3/4 LOAD]</span>
            <span>75%</span>
          </div>
          <div className="flex justify-between items-center border-b border-cyan-500/10 pb-1">
            <span>5,000 L [HALF TANK]</span>
            <span className="text-cyan-400 font-bold">50%</span>
          </div>
          <div className="flex justify-between items-center border-b border-cyan-500/10 pb-1">
            <span>100 L [DRUM UNIT]</span>
            <span className="text-emerald-400 font-bold">100L</span>
          </div>
          <div className="flex justify-between items-center text-cyan-400/40">
            <span>0 L [BASE]</span>
            <span>0%</span>
          </div>
        </div>

        {/* Tank Glare Highlight */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-20" />

        {/* Dynamic Water Liquid Body */}
        <div
          className="relative w-full transition-all duration-700 ease-out z-10 overflow-hidden rounded-b-xl"
          style={{ height: `${percentage}%` }}
        >
          {/* Animated Undulating Wave Surface */}
          <div className="absolute -top-5 left-0 w-[200%] h-6 pointer-events-none">
            <svg
              className="w-full h-full animate-wave-left fill-cyan-400/75"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <path d="M0,0 C150,90 350,-40 500,50 C650,140 900,-20 1200,40 L1200,120 L0,120 Z" />
            </svg>
          </div>

          <div className="absolute -top-3 left-0 w-[200%] h-5 pointer-events-none opacity-60">
            <svg
              className="w-full h-full animate-wave-right fill-sky-300/60"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <path d="M0,40 C300,-30 450,80 700,10 C950,-50 1050,70 1200,20 L1200,120 L0,120 Z" />
            </svg>
          </div>

          {/* Liquid Core */}
          <div className="w-full h-full bg-gradient-to-b from-cyan-500/80 via-sky-600/85 to-slate-950/95 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 pointer-events-none">
              <span className="text-xl sm:text-3xl font-black text-white drop-shadow-lg tracking-tight">
                {volumeLitres.toLocaleString()} <span className="text-xs sm:text-sm font-bold text-cyan-200">LITRES</span>
              </span>
              <span className="text-[10px] font-bold text-cyan-100 bg-cyan-950/85 px-3.5 py-1.5 rounded-full border border-cyan-400/30 mt-1 shadow-sm">
                Food-Grade SS304 Tank • 100ft Discharge Hose
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Purity & Quality Telemetry Badges */}
      <div className="grid grid-cols-3 gap-2.5 mt-4 relative z-10">
        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/80 border border-cyan-500/20 text-center">
          <div className="flex items-center justify-center gap-1 text-cyan-400 text-[11px] font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>TDS Level</span>
          </div>
          <div className="text-xs sm:text-sm font-black text-white">&lt; 120 PPM</div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/80 border border-emerald-500/20 text-center">
          <div className="flex items-center justify-center gap-1 text-emerald-400 text-[11px] font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Purity</span>
          </div>
          <div className="text-xs sm:text-sm font-black text-white">100% Tested</div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/80 border border-blue-500/20 text-center">
          <div className="flex items-center justify-center gap-1 text-blue-400 text-[11px] font-semibold mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span>Tank Material</span>
          </div>
          <div className="text-xs sm:text-sm font-black text-white">Food-Grade SS</div>
        </div>
      </div>

      {/* Direct Booking Link CTA */}
      <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-3 relative z-10">
        <div className="text-xs text-slate-300">
          <span className="text-slate-400">Total Price: </span>
          <span className="font-black text-white text-sm">₹{price}</span>
          <span className="text-[11px] text-slate-400"> (No extra charges)</span>
        </div>
        <Link
          to="/register"
          className="btn-shimmer px-4 py-2 rounded-xl gradient-water text-white font-bold text-xs shadow-md shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all hover:-translate-y-0.5 flex items-center gap-1.5"
        >
          <span>Order Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

