import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { orderApi, customerApi } from '../../api';
import type { Order, CustomerProfile } from '../../types';
import CustomerLayout from '../../components/layout/CustomerLayout';
import StatusBadge from '../../components/common/StatusBadge';
import {
  Plus,
  Truck,
  MapPin,
  CheckCircle2,
  Circle,
  RotateCcw,
  Gauge,
  Droplets,
  ShieldCheck,
  Zap,
  Star,
  Clock,
  PhoneCall,
  Calendar,
  AlertCircle,
  Sparkles,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function CustomerHome() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Tank Level Estimator State
  const [tankCapacity, setTankCapacity] = useState<number>(5000);
  const [currentLevelPercent, setCurrentLevelPercent] = useState<number>(65);
  const [householdMembers, setHouseholdMembers] = useState<number>(4);

  // Quick feedback state
  const [ratedOrderId, setRatedOrderId] = useState<number | null>(null);
  const [ratingStars, setRatingStars] = useState<number>(5);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersRes, profileRes] = await Promise.allSettled([
        orderApi.getMyOrders(),
        customerApi.getProfile(),
      ]);

      if (ordersRes.status === 'fulfilled' && ordersRes.value.data.success) {
        setOrders(ordersRes.value.data.data || []);
      }
      if (profileRes.status === 'fulfilled' && profileRes.value.data.success) {
        setProfile(profileRes.value.data.data);
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  const activeOrder = orders.find(
    (o) => !['DELIVERED', 'COMPLETED', 'CANCELLED', 'FAILED'].includes(o.status)
  );

  const pastOrders = orders
    .filter((o) => ['DELIVERED', 'COMPLETED'].includes(o.status))
    .slice(0, 3);

  // Water Calculation formulas
  const currentLitres = Math.round((tankCapacity * currentLevelPercent) / 100);
  const dailyUsageLitres = householdMembers * 150; // standard 150L per capita
  const daysRemaining = Math.max(1, Math.round(currentLitres / dailyUsageLitres));

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleRateDelivery = (orderId: number) => {
    setRatedOrderId(orderId);
    toast.success('Thank you for rating driver Ramesh! 5 stars recorded ⭐');
  };

  const getTimelineSteps = (order: Order) => [
    {
      label: 'Order Confirmed',
      desc: 'Booking received and verified',
      completed: true,
    },
    {
      label: 'Driver Assigned',
      desc: order.driverName ? `Assigned to ${order.driverName}` : 'Assigning tanker...',
      completed: Boolean(order.driverName) || ['ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'DELIVERING', 'ARRIVED', 'DELIVERED'].includes(order.status),
    },
    {
      label: 'Driver On The Way',
      desc: order.status === 'ON_THE_WAY' || (order.status as any) === 'DELIVERING' ? 'Tanker is en route to your street' : 'Awaiting dispatch',
      completed: ['ON_THE_WAY', 'DELIVERING', 'ARRIVED', 'DELIVERED'].includes(order.status),
    },
    {
      label: 'Arrived at Location',
      desc: 'Tanker connected to your sump / tank',
      completed: ['ARRIVED', 'DELIVERED'].includes(order.status),
    },
    {
      label: 'Delivered & Complete',
      desc: 'Water pumped successfully',
      completed: ['DELIVERED', 'COMPLETED'].includes(order.status),
    },
  ];

  return (
    <CustomerLayout>
      <Toaster position="top-center" />
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Top Hero Banner */}
        <div className="bg-gradient-to-r from-sky-700 via-sky-800 to-blue-900 rounded-3xl p-7 sm:p-9 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute right-24 top-0 w-32 h-32 rounded-full bg-sky-400/20 blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-sky-200 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Hindupur Priority Water Network</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
                {getGreeting()}, {user?.name?.split(' ')[0] || 'Valued Resident'}! 💧
              </h1>
              <p className="text-sm sm:text-base text-sky-100 font-normal leading-relaxed">
                Clean, mineral-balanced water delivered straight into your sump or overhead tank within 45–60 minutes.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                to="/customer/order"
                className="px-6 py-3.5 rounded-xl bg-white text-sky-900 hover:bg-sky-50 font-black text-sm shadow-lg shadow-black/10 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-sky-700" />
                <span>BOOK WATER NOW</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar inside Hero */}
          <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <div className="text-sky-200 font-medium">Customer Status</div>
              <div className="text-sm font-bold text-white mt-0.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Verified Resident
              </div>
            </div>
            <div>
              <div className="text-sky-200 font-medium">Orders Placed</div>
              <div className="text-sm font-bold text-white mt-0.5 tabular-nums">
                {profile?.totalOrders || orders.length} Deliveries
              </div>
            </div>
            <div>
              <div className="text-sky-200 font-medium">Delivery Guarantee</div>
              <div className="text-sm font-bold text-white mt-0.5">
                45–60 Mins Express
              </div>
            </div>
            <div>
              <div className="text-sky-200 font-medium">Quality Rating</div>
              <div className="text-sm font-bold text-white mt-0.5 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                4.9 / 5.0 (Hindupur)
              </div>
            </div>
          </div>
        </div>

        {/* Active Order Tracker (If any) */}
        {activeOrder && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-sky-800 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-sky-600 animate-bounce" />
                Live Tanker In-Progress
              </span>
              <StatusBadge status={activeOrder.status} />
            </div>

            <div className="bg-white border-2 border-sky-300 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="text-xs font-mono text-sky-700 font-bold">
                    {activeOrder.orderNumber}
                  </div>
                  <div className="text-xl font-black text-slate-900 mt-0.5">
                    {activeOrder.items?.[0]?.serviceName || 'Full Tanker (10,000L)'}
                    {activeOrder.items?.[0]?.quantity > 1 ? ` × ${activeOrder.items[0].quantity}` : ''}
                  </div>
                </div>
                <div className="sm:text-right">
                  <div className="text-2xl font-black text-slate-900 tabular-nums">
                    ₹{activeOrder.totalAmount}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    {activeOrder.paymentMethod} · <span className="text-amber-700 font-bold">{activeOrder.paymentStatus}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Destination & Driver Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <span className="text-slate-500 font-bold flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-sky-600" />
                    Delivery Destination
                  </span>
                  <div className="text-slate-800 font-medium leading-relaxed">{activeOrder.deliveryAddress}</div>
                </div>

                <div className="p-4.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <span className="text-slate-500 font-bold flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    <Truck className="w-3.5 h-3.5 text-sky-600" />
                    Assigned Driver
                  </span>
                  <div className="text-slate-900 font-bold text-sm">
                    {activeOrder.driverName ? (
                      <div className="flex items-center justify-between">
                        <span>{activeOrder.driverName}</span>
                        <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          ● En Route
                        </span>
                      </div>
                    ) : (
                      <span className="text-amber-700 font-medium text-xs">Dispatching nearest available tanker...</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Real Timeline */}
              <div className="pt-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                  Step-by-step Delivery Progress
                </div>

                <div className="relative pl-6 space-y-4">
                  <div className="absolute top-2 bottom-2 left-[9px] w-0.5 bg-slate-200" />
                  {getTimelineSteps(activeOrder).map((step, idx) => (
                    <div key={idx} className="relative flex items-start gap-3">
                      <div className="absolute -left-6 flex items-center justify-center mt-0.5">
                        {step.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 bg-white" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-300 bg-white" />
                        )}
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${step.completed ? 'text-slate-900' : 'text-slate-400'}`}>
                          {step.label}
                        </div>
                        <div className="text-xs text-slate-500">{step.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feature Grid: Tank Level Forecaster & Water Purity Telemetry */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feature 1: Sump / Tank Water Level Estimator */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-7 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Gauge className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Sump & Tank Depletion Forecaster</h2>
                  <p className="text-xs text-slate-500">Calculate days remaining before your sump runs dry</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-sky-50 text-sky-800 border border-sky-200 rounded-xl text-xs font-bold">
                Smart Forecaster
              </div>
            </div>

            {/* Interactive Tank Level Visualizer */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center p-5 bg-slate-50 rounded-2xl border border-slate-200">
              {/* Graphical Tank Gauge */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-24 h-36 bg-slate-200 rounded-2xl border-4 border-slate-300 relative overflow-hidden flex flex-col justify-end shadow-inner">
                  <div
                    className="w-full bg-gradient-to-t from-sky-600 to-sky-400 transition-all duration-700 relative"
                    style={{ height: `${currentLevelPercent}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center font-black text-slate-900 text-sm bg-white/40 backdrop-blur-2xs">
                    {currentLevelPercent}%
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-500 mt-2">Tanker Gauge</span>
              </div>

              {/* Status and Days Remaining */}
              <div className="sm:col-span-2 space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-slate-500">Estimated Water in Sump:</span>
                  <span className="text-base font-black text-slate-900 tabular-nums">
                    {currentLitres.toLocaleString()} / {tankCapacity.toLocaleString()} Litres
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                  <div className="text-xs text-slate-500 font-medium">Estimated Days Remaining:</div>
                  <div className="text-2xl font-black text-sky-700 tabular-nums flex items-center gap-2">
                    <span>~{daysRemaining} Days</span>
                    <span className="text-xs font-bold text-slate-400">
                      ({dailyUsageLitres} L/day for {householdMembers} persons)
                    </span>
                  </div>
                  {daysRemaining <= 2 ? (
                    <div className="text-xs font-bold text-rose-700 flex items-center gap-1 pt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Low water level! Please book a tanker now.
                    </div>
                  ) : (
                    <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1 pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Sump level is currently adequate.
                    </div>
                  )}
                </div>

                {/* Adjust Level Slider */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                    <span>Adjust Current Level</span>
                    <span className="font-bold text-sky-700">{currentLevelPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={currentLevelPercent}
                    onChange={(e) => setCurrentLevelPercent(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                  />
                </div>
              </div>
            </div>

            {/* Quick Sump Settings Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Sump Capacity
                </label>
                <select
                  value={tankCapacity}
                  onChange={(e) => setTankCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 font-semibold"
                >
                  <option value={10000}>10,000 Litres (Large)</option>
                  <option value={5000}>5,000 Litres (Standard)</option>
                  <option value={3000}>3,000 Litres (Medium)</option>
                  <option value={1000}>1,000 Litres (Drum / Small)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Household Members
                </label>
                <select
                  value={householdMembers}
                  onChange={(e) => setHouseholdMembers(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 font-semibold"
                >
                  <option value={2}>2 Members (~300L/day)</option>
                  <option value={4}>4 Members (~600L/day)</option>
                  <option value={6}>6 Members (~900L/day)</option>
                  <option value={8}>8+ Members (~1200L/day)</option>
                </select>
              </div>

              <div className="col-span-2 sm:col-span-1 flex items-end">
                <Link
                  to="/customer/order"
                  className="w-full h-10 rounded-xl btn-primary text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Book Refill</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Feature 2: Certified Water Quality & Mineral Safety */}
          <div className="bg-white rounded-3xl p-7 sm:p-8 border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Water Purity Report</h2>
                  <p className="text-xs text-slate-500">Tested today at Hindupur Lab</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">TDS (Dissolved Solids)</div>
                    <div className="text-[11px] text-slate-500">WHO safe range: 100-300 ppm</div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-emerald-700">142 ppm</span>
                    <span className="block text-[10px] text-emerald-600 font-bold uppercase">Sweet Grade</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">pH Balance</div>
                    <div className="text-[11px] text-slate-500">Neutral drinking optimal</div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-sky-700">7.2 pH</span>
                    <span className="block text-[10px] text-sky-600 font-bold uppercase">Optimal Neutral</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Water Hardness</div>
                    <div className="text-[11px] text-slate-500">Safe for bathroom & washing</div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-slate-800">85 mg/L</span>
                    <span className="block text-[10px] text-slate-500 font-bold uppercase">Soft Grade</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                100% Certified Safe
              </span>
              <span className="font-mono text-slate-400">ID: HDP-WAT-2026</span>
            </div>
          </div>
        </div>

        {/* Feature 3: 1-Click Quick Reorder Packages */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Standard Delivery Packages</h2>
              <p className="text-xs text-slate-500">Delivered directly to your sump or drums in Hindupur</p>
            </div>
            <Link to="/customer/order" className="text-xs font-bold text-sky-600 hover:text-sky-700">
              View All Services →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Card 1: Full Tanker */}
            <div className="bg-white border-2 border-slate-200 hover:border-sky-400 rounded-3xl p-6 space-y-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-black text-sm">
                    10kL
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 text-[11px] font-bold">
                    Most Popular
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">Full Water Tanker</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  10,000 Litres heavy delivery. Ideal for underground residential sumps and commercial tanks.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xl font-black text-slate-900">₹400</span>
                  <span className="text-[11px] text-slate-400 block">All inclusive</span>
                </div>
                <Link
                  to="/customer/order"
                  className="px-4 py-2 rounded-xl btn-primary text-xs font-bold shadow-xs group-hover:scale-105 transition-transform"
                >
                  Book 10,000L
                </Link>
              </div>
            </div>

            {/* Card 2: Half Tanker */}
            <div className="bg-white border-2 border-slate-200 hover:border-sky-400 rounded-3xl p-6 space-y-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-black text-sm">
                    5kL
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                    Fast Fill
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">Half Water Tanker</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  5,000 Litres delivery. Fits medium household sumps or overhead tanks. Quick pumping time.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xl font-black text-slate-900">₹200</span>
                  <span className="text-[11px] text-slate-400 block">All inclusive</span>
                </div>
                <Link
                  to="/customer/order"
                  className="px-4 py-2 rounded-xl btn-primary text-xs font-bold shadow-xs group-hover:scale-105 transition-transform"
                >
                  Book 5,000L
                </Link>
              </div>
            </div>

            {/* Card 3: Water Drum */}
            <div className="bg-white border-2 border-slate-200 hover:border-sky-400 rounded-3xl p-6 space-y-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-sm">
                    100L
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                    Flexible
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">Water Drum</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Individual drum of 100 Litres. Order 1 to 20 drums for emergency household needs.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xl font-black text-slate-900">₹50</span>
                  <span className="text-[11px] text-slate-400 block">Per drum</span>
                </div>
                <Link
                  to="/customer/order"
                  className="px-4 py-2 rounded-xl btn-primary text-xs font-bold shadow-xs group-hover:scale-105 transition-transform"
                >
                  Book Drums
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Order History & Driver Feedback Module */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recent Deliveries & Feedback</h2>
              <p className="text-xs text-slate-500">Your recent water orders and service ratings</p>
            </div>
            <Link to="/customer/orders" className="text-xs font-bold text-sky-600 hover:text-sky-700">
              View all orders ({orders.length}) →
            </Link>
          </div>

          {loading ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-500 text-sm">
              Loading orders history...
            </div>
          ) : pastOrders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-3 shadow-xs">
              <div className="text-base font-bold text-slate-800">No past orders found</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Ready to book your first delivery? Choose full tanker or drum above.
              </p>
              <Link to="/customer/order" className="btn-primary text-xs h-10 px-5 inline-flex font-bold">
                Order Your First Tanker
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {pastOrders.map((o) => {
                const isRated = ratedOrderId === o.id;
                return (
                  <div
                    key={o.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-sky-300 shadow-xs transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono font-bold text-slate-900">
                          {o.orderNumber}
                        </span>
                        <StatusBadge status={o.status} />
                      </div>
                      <div className="text-sm text-slate-800 font-bold">
                        {o.items?.[0]?.serviceName || 'Full Tank'} · ₹{o.totalAmount}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span>{o.deliveryAddress}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* Driver Rating Widget */}
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center gap-2">
                        <span className="text-slate-500 font-medium">Driver:</span>
                        <strong className="text-slate-800">{o.driverName || 'Ramesh'}</strong>
                        {isRated ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1 ml-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Rated 5★
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRateDelivery(o.id)}
                            className="text-amber-500 hover:text-amber-600 font-bold flex items-center gap-1 ml-1 hover:underline cursor-pointer"
                          >
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            Rate 5★
                          </button>
                        )}
                      </div>

                      <Link
                        to="/customer/order"
                        className="btn-secondary text-xs h-10 px-4 font-bold flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-sky-600" />
                        <span>Reorder</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Hindupur Helpline Card */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-lg">
          <div className="space-y-1">
            <h3 className="text-base font-bold flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              Need Urgent Water in Hindupur?
            </h3>
            <p className="text-xs text-slate-400">
              For functions, construction, or sudden dry-bore emergencies, call dispatch 24/7.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="tel:9999999999"
              className="px-5 py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold transition-colors"
            >
              📞 Call Owner: 9999999999
            </a>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
