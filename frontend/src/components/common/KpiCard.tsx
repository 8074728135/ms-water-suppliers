import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  badgeText?: string;
  badgeType?: 'neutral' | 'success' | 'warning' | 'cyan';
  icon: LucideIcon;
}

export default function KpiCard({
  label,
  value,
  subValue,
  badgeText,
  badgeType = 'neutral',
  icon: Icon,
}: KpiCardProps) {
  const badgeColors = {
    neutral: 'text-slate-700 bg-slate-100 border-slate-200',
    success: 'text-emerald-700 bg-emerald-50 border-emerald-200 font-bold',
    warning: 'text-amber-800 bg-amber-50 border-amber-200 font-bold',
    cyan: 'text-sky-700 bg-sky-50 border-sky-200 font-bold',
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-10 flex flex-col items-center text-center justify-center shadow-xs hover:border-sky-300 hover:shadow-md transition-all duration-200 min-h-[220px]">
      {/* Centered Icon Container */}
      <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 mb-4 shadow-xs">
        <Icon className="w-6 h-6" />
      </div>

      {/* Centered Label */}
      <div className="text-xs font-extrabold text-slate-500 tracking-wider uppercase mb-2">
        {label}
      </div>

      {/* Centered Big Value */}
      <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight tabular-nums my-1.5">
        {value}
      </div>

      {/* Centered SubValue & Badge */}
      {(subValue || badgeText) && (
        <div className="mt-4 flex items-center justify-center gap-2.5 text-xs text-slate-500 flex-wrap leading-relaxed max-w-[280px]">
          {badgeText && (
            <span className={`px-3.5 py-1.5 rounded-full border text-xs font-bold ${badgeColors[badgeType]}`}>
              {badgeText}
            </span>
          )}
          {subValue && <span className="font-medium text-slate-600">{subValue}</span>}
        </div>
      )}
    </div>
  );
}
