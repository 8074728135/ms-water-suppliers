interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status ? status.toUpperCase().replace(/\s+/g, '_') : 'PENDING';

  switch (normalized) {
    case 'PENDING':
      return (
        <span className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
          Pending
        </span>
      );
    case 'CONFIRMED':
      return (
        <span className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200">
          Confirmed
        </span>
      );
    case 'ASSIGNED':
      return (
        <span className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
          Assigned
        </span>
      );
    case 'ACCEPTED':
      return (
        <span className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
          Accepted
        </span>
      );
    case 'ON_THE_WAY':
    case 'DELIVERING':
      return (
        <span className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg text-xs font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
          On The Way
        </span>
      );
    case 'ARRIVED':
      return (
        <span className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">
          Arrived
        </span>
      );
    case 'DELIVERED':
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          Delivered
        </span>
      );
    case 'FAILED':
      return (
        <span className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
          Failed
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
          Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
          {status}
        </span>
      );
  }
}
