import React from 'react';
import { Truck, MapPin, Phone, CheckCircle2, Clock, Navigation } from 'lucide-react';

interface OrderTrackerRadarProps {
  orderNumber: string;
  status: string;
  driverName?: string;
  driverPhone?: string;
  vehicleNumber?: string;
  addressText?: string;
  landmark?: string;
  etaMinutes?: number;
}

export default function OrderTrackerRadar({
  orderNumber,
  status,
  driverName = 'Assigned Driver',
  driverPhone = '9999999999',
  vehicleNumber = 'AP 02 WT 4455',
  addressText = 'Hindupur Delivery Point',
  landmark = 'Near Clock Tower',
  etaMinutes = 25,
}: OrderTrackerRadarProps) {
  const isEnRoute = status === 'ON_THE_WAY';
  const isArrived = status === 'ARRIVED';
  const isDelivered = status === 'DELIVERED';

  return (
    <div className="w-full glass-cyber rounded-3xl p-5 sm:p-6 md:p-8 border border-cyan-500/30 shadow-2xl space-y-5">
      {/* Header with Live Status & Order ID */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-cyan-500/20">
        <div>
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/80 px-3.5 py-1.5 rounded-full border border-cyan-500/30">
            RADAR DISPATCH • {orderNumber}
          </span>
          <h3 className="text-lg sm:text-xl font-black text-white mt-1.5 flex items-center gap-2">
            Live Tanker Telemetry
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          </h3>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-xs text-slate-400 font-semibold">Estimated Arrival</div>
          <div className="text-lg sm:text-xl font-black text-cyan-300 flex items-center sm:justify-end gap-1.5 mt-0.5">
            <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
            {isDelivered ? 'Delivered' : isArrived ? 'At Gate' : `~${etaMinutes} mins`}
          </div>
        </div>
      </div>

      {/* Tactical Radar Display */}
      <div className="relative h-44 sm:h-52 w-full rounded-2xl bg-slate-950 border border-cyan-500/30 overflow-hidden flex items-center justify-center shadow-inner">
        {/* Radar Concentric Circles */}
        <div className="absolute w-24 h-24 rounded-full border border-cyan-500/20" />
        <div className="absolute w-40 h-40 rounded-full border border-cyan-500/15" />
        <div className="absolute w-56 h-56 rounded-full border border-cyan-500/10" />

        {/* Crosshairs */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-px bg-cyan-500/15" />
          <div className="h-full w-px bg-cyan-500/15 absolute" />
        </div>

        {/* Rotating Sonar Radar Sweep */}
        <div className="absolute w-56 h-56 rounded-full animate-radar-sweep pointer-events-none">
          <div className="w-1/2 h-1/2 bg-gradient-to-br from-cyan-400/30 via-cyan-400/5 to-transparent rounded-tl-full origin-bottom-right" />
        </div>

        {/* Destination Marker (Home) */}
        <div className="absolute right-8 sm:right-14 top-8 sm:top-10 flex flex-col items-center z-10">
          <div className="relative">
            <div className="absolute -inset-2 rounded-full bg-emerald-500/30 animate-ping" />
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/50">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-300 bg-slate-900/90 px-3.5 py-1.5 rounded-full border border-emerald-500/30 mt-1 whitespace-nowrap">
            Your Location
          </span>
        </div>

        {/* Tanker Moving Marker */}
        <div
          className={`absolute flex flex-col items-center z-10 transition-all duration-1000 ${
            isDelivered || isArrived
              ? 'right-12 sm:right-16 top-10'
              : isEnRoute
              ? 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
              : 'left-8 sm:left-12 bottom-6 sm:bottom-8'
          }`}
        >
          <div className="relative">
            <div className="absolute -inset-2 rounded-full bg-cyan-400/40 animate-pulse" />
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/50">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <span className="text-[10px] font-bold text-cyan-200 bg-slate-900/90 px-3.5 py-1.5 rounded-full border border-cyan-400/30 mt-1 flex items-center gap-1.5 whitespace-nowrap">
            <Navigation className="w-2.5 h-2.5 animate-spin" />
            {vehicleNumber}
          </span>
        </div>

        {/* Distance / Status Overlay Pill */}
        <div className="absolute bottom-2.5 left-2.5 z-10 px-4 py-2 rounded-full bg-slate-900/90 border border-cyan-500/30 text-[10px] sm:text-xs text-cyan-300 font-mono flex items-center gap-2 shadow-md">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          {isDelivered
            ? 'Water Delivered'
            : isArrived
            ? 'Tanker Waiting at Gate'
            : isEnRoute
            ? 'In Transit (~1.8 km)'
            : 'Driver Preparing Dispatch'}
        </div>
      </div>

      {/* Driver Card & Direct Call Action */}
      <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-base shadow-md flex-shrink-0">
            {driverName.charAt(0)}
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              {driverName}
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-xs text-slate-400">
              {vehicleNumber} • Hindupur Fleet
            </div>
          </div>
        </div>

        <a
          href={`tel:${driverPhone}`}
          className="btn-shimmer w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all hover:-translate-y-0.5"
        >
          <Phone className="w-3.5 h-3.5" />
          Call Tanker Driver
        </a>
      </div>
    </div>
  );
}
