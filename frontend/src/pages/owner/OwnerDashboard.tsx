import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminApi } from '../../api';
import type { DashboardStats, Order, Driver } from '../../types';
import AppShell from '../../components/layout/AppShell';
import KpiCard from '../../components/common/KpiCard';
import StatusBadge from '../../components/common/StatusBadge';
import OrderDrawer from '../../components/common/OrderDrawer';
import {
  ClipboardList,
  CreditCard,
  Truck,
  Users,
  AlertTriangle,
  Plus,
  UserCheck,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dateFilterMode, setDateFilterMode] = useState<'today' | 'yesterday' | 'week' | 'custom'>('today');
  const [queueFilter, setQueueFilter] = useState<'ALL' | 'PENDING' | 'ASSIGNED' | 'ON_THE_WAY' | 'DELIVERED'>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    loadAllData(selectedDate);
  }, [selectedDate]);

  const loadAllData = async (dateStr: string) => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, driversRes] = await Promise.allSettled([
        adminApi.getDashboardStats(dateStr),
        adminApi.getOrders({ date: dateStr }),
        adminApi.getDrivers(),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.data.success) {
        setStats(statsRes.value.data.data);
      }
      if (ordersRes.status === 'fulfilled' && ordersRes.value.data.success) {
        setOrders(ordersRes.value.data.data || []);
      }
      if (driversRes.status === 'fulfilled' && driversRes.value.data.success) {
        setDrivers(driversRes.value.data.data as any || []);
      }
    } catch {
      toast.error('Unable to load operational dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDatePreset = (preset: 'today' | 'yesterday' | 'week') => {
    setDateFilterMode(preset);
    const now = new Date();
    if (preset === 'today') {
      setSelectedDate(now.toISOString().split('T')[0]);
    } else if (preset === 'yesterday') {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      setSelectedDate(y.toISOString().split('T')[0]);
    } else if (preset === 'week') {
      setSelectedDate(now.toISOString().split('T')[0]);
    }
  };

  const handleAssignDriver = async (orderId: number, driverId: number) => {
    try {
      await adminApi.assignDriver(orderId, driverId);
      toast.success('Driver assigned successfully');
      loadAllData(selectedDate);
      setIsDrawerOpen(false);
    } catch {
      toast.error('Failed to assign driver');
    }
  };

  const handleCancelOrder = async (orderId: number, _reason: string) => {
    try {
      await adminApi.cancelOrder(orderId);
      toast.success('Order cancelled');
      loadAllData(selectedDate);
      setIsDrawerOpen(false);
    } catch {
      toast.error('Failed to cancel order');
    }
  };

  // Filter orders for queue
  const filteredOrders = orders.filter((o) => {
    if (queueFilter === 'ALL') return true;
    if (queueFilter === 'PENDING') return o.status === 'PENDING' || o.status === 'CONFIRMED';
    if (queueFilter === 'ASSIGNED') return o.status === 'ASSIGNED' || o.status === 'ACCEPTED';
    if (queueFilter === 'ON_THE_WAY') return o.status === 'ON_THE_WAY' || (o.status as any) === 'DELIVERING' || o.status === 'ARRIVED';
    if (queueFilter === 'DELIVERED') return o.status === 'DELIVERED' || (o.status as any) === 'COMPLETED';
    return true;
  });

  // Calculate water sales breakdown from orders
  const waterBreakdown = {
    fullTank: 0,
    halfTank: 0,
    drums: 0,
  };

  orders.forEach((o) => {
    o.items?.forEach((item) => {
      const name = (item.serviceName || '').toLowerCase();
      if (name.includes('half')) {
        waterBreakdown.halfTank += item.quantity || 1;
      } else if (name.includes('drum')) {
        waterBreakdown.drums += item.quantity || 1;
      } else if (name.includes('full') || name.includes('tank')) {
        waterBreakdown.fullTank += item.quantity || 1;
      }
    });
  });

  const totalWaterUnits = waterBreakdown.fullTank + waterBreakdown.halfTank + waterBreakdown.drums;

  return (
    <AppShell breadcrumb="Operations / Overview">
      <Toaster position="top-right" />
      <div className="space-y-12 sm:space-y-16">
        {/* Dashboard Header Module with Spacious Layout */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 mb-10 sm:mb-14">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Operations Overview</h1>
            <p className="text-base text-slate-500 mt-2 leading-relaxed">
              Live operational control center for municipal and private water deliveries across Hindupur.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Date Preset Buttons */}
            <div className="inline-flex rounded-2xl bg-white p-1.5 border border-slate-200/90 shadow-xs">
              <button
                onClick={() => handleDatePreset('today')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  dateFilterMode === 'today'
                    ? 'bg-sky-50 text-sky-800 border border-sky-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => handleDatePreset('yesterday')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  dateFilterMode === 'yesterday'
                    ? 'bg-sky-50 text-sky-800 border border-sky-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Yesterday
              </button>
              <button
                onClick={() => handleDatePreset('week')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  dateFilterMode === 'week'
                    ? 'bg-sky-50 text-sky-800 border border-sky-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                This Week
              </button>
            </div>

            {/* Custom Date Input */}
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setDateFilterMode('custom');
                  setSelectedDate(e.target.value);
                }}
                className="input-field text-xs h-11 py-2 px-3.5 w-auto bg-white"
              />
            </div>

            <button
              onClick={() => loadAllData(selectedDate)}
              title="Refresh Data"
              className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/90 rounded-xl transition-colors bg-white shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Primary Action Button */}
            <Link
              to="/owner/orders/create"
              className="btn-primary text-sm h-11 px-6 font-bold shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>New Phone Order</span>
            </Link>
          </div>
        </div>

        {/* Urgent Action Bar (Only shows when unassigned orders > 0) */}
        {stats && stats.unassignedOrders > 0 && (
          <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-8 sm:p-9 flex flex-col sm:flex-row sm:items-center justify-between gap-6 animate-in fade-in shadow-xs mb-10 sm:mb-14">
            <div className="flex items-start sm:items-center gap-4">
              <div className="p-4 rounded-2xl bg-amber-100 text-amber-700 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <div className="text-base font-bold text-amber-900">
                  ⚠ {stats.unassignedOrders} {stats.unassignedOrders === 1 ? 'order needs' : 'orders need'} driver assignment
                </div>
                <div className="text-sm text-amber-800/80 leading-relaxed">
                  Orders are confirmed but have not been assigned to a tanker driver or fleet vehicle.
                </div>
              </div>
            </div>
            <Link
              to="/owner/orders?status=PENDING"
              className="btn-secondary text-xs h-11 px-6 border-amber-300 text-amber-900 hover:bg-amber-100 shrink-0 font-bold"
            >
              Review Assignments →
            </Link>
          </div>
        )}

        {/* Primary KPI Row with Generous Card Margins and Centered Metric Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-16">
          <KpiCard
            label="Today's Orders"
            value={stats ? stats.totalOrders : 0}
            subValue={stats ? `Pending: ${stats.pendingOrders}` : 'Pending: 0'}
            badgeText={stats && stats.unassignedOrders > 0 ? `${stats.unassignedOrders} Unassigned` : undefined}
            badgeType="warning"
            icon={ClipboardList}
          />
          <KpiCard
            label="Today's Revenue"
            value={stats ? `₹${Number(stats.revenue || 0).toLocaleString('en-IN')}` : '₹0'}
            subValue={stats ? `Delivered: ${stats.deliveredOrders}` : 'Delivered: 0'}
            badgeText="Collected"
            badgeType="success"
            icon={CreditCard}
          />
          <KpiCard
            label="Active Deliveries"
            value={stats ? (stats.onTheWayOrders + stats.assignedOrders) : 0}
            subValue={stats ? `On the way: ${stats.onTheWayOrders} · Assigned: ${stats.assignedOrders}` : 'On the way: 0'}
            badgeText="En Route"
            badgeType="cyan"
            icon={Truck}
          />
          <KpiCard
            label="Customers"
            value={stats ? stats.totalCustomers : 0}
            subValue="Registered clients in Hindupur"
            badgeText="Active"
            badgeType="neutral"
            icon={Users}
          />
        </div>

        {/* Main Operations Section with Wide Module Gap */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12 items-start">
          {/* Left Column: Today's Delivery Queue */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Today's Delivery Queue</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} in queue
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 bg-white p-1.5 rounded-2xl border border-slate-200/90 shadow-xs">
                {(['ALL', 'PENDING', 'ASSIGNED', 'ON_THE_WAY', 'DELIVERED'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setQueueFilter(filter)}
                    className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                    queueFilter === filter
                      ? 'bg-sky-50 text-sky-800 border border-sky-200 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {filter === 'ALL'
                      ? 'All'
                      : filter === 'PENDING'
                      ? 'Pending'
                      : filter === 'ASSIGNED'
                      ? 'Assigned'
                      : filter === 'ON_THE_WAY'
                      ? 'On Way'
                      : 'Delivered'}
                  </button>
                ))}
              </div>
            </div>

            {/* Queue List / Cards with Generous Line Spacing */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-14 text-center space-y-3 shadow-xs">
                <p className="text-base font-bold text-slate-800">No orders in this queue</p>
                <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
                  {queueFilter === 'PENDING'
                    ? 'All confirmed orders have been assigned to delivery drivers.'
                    : 'No water deliveries match the selected filter for this operational day.'}
                </p>
              </div>
            ) : (
              <div className="space-y-5 sm:space-y-6">
                {filteredOrders.map((order) => {
                  const item = order.items?.[0];
                  return (
                    <div
                      key={order.id}
                      className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-9 hover:border-sky-300 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                    >
                      <div className="space-y-4 min-w-0 flex-1">
                        <div className="flex items-center gap-3.5">
                          <span className="text-xs font-bold text-slate-900 tracking-tight font-mono px-3.5 py-1.5 bg-slate-100 rounded-lg border border-slate-200">
                            {order.orderNumber}
                          </span>
                          <StatusBadge status={order.status} />
                        </div>
                        <div className="text-lg sm:text-xl font-black text-slate-900 truncate">
                          {order.customerName}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600 flex-wrap leading-relaxed">
                          <span className="text-sky-800 font-bold bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-100">
                            {item?.serviceName || 'Full Tank'}
                            {item && item.quantity > 1 ? ` × ${item.quantity}` : ''}
                          </span>
                          <span>·</span>
                          <span className="font-extrabold text-slate-900 tabular-nums text-base">
                            ₹{order.totalAmount}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1.5 truncate text-slate-600">
                            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                            {order.deliveryAddress}
                          </span>
                        </div>
                        <div className="flex items-center gap-6 text-xs text-slate-500 pt-3.5 mt-2 border-t border-slate-100">
                          <span>Driver: <strong className="text-slate-800 font-semibold">{order.driverName || 'Unassigned'}</strong></span>
                          <span>Slot: <strong className="text-slate-800 font-semibold">{order.timeSlot || 'Morning'}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsDrawerOpen(true);
                          }}
                          className="btn-secondary text-xs h-11 px-6 font-bold"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Operations Summary & Driver Availability */}
          <div className="space-y-8 sm:space-y-10">
            {/* Operations Summary Module */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-9 space-y-6 shadow-xs">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                Operations Summary
              </h3>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm py-3.5 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Pending Assignment</span>
                  <span className={`font-black text-base tabular-nums ${stats && stats.unassignedOrders > 0 ? 'text-amber-700 bg-amber-50 px-3.5 py-1.5 rounded-lg border border-amber-200' : 'text-slate-900'}`}>
                    {stats ? stats.unassignedOrders : 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm py-3.5 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">On the Way</span>
                  <span className="font-black text-base text-sky-700 tabular-nums">
                    {stats ? stats.onTheWayOrders : 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm py-3.5 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Delivered</span>
                  <span className="font-black text-base text-emerald-700 tabular-nums">
                    {stats ? stats.deliveredOrders : 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm py-3.5">
                  <span className="text-slate-600 font-medium">Cancelled / Failed</span>
                  <span className="font-bold text-sm text-slate-500 tabular-nums">
                    {stats ? stats.cancelledOrders : 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Driver Availability Module */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-9 space-y-6 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                  Driver Availability
                </h3>
                <Link
                  to="/owner/drivers"
                  className="text-xs text-sky-700 hover:text-sky-800 font-bold"
                >
                  Manage →
                </Link>
              </div>

              <div className="space-y-3.5">
                {drivers.length === 0 ? (
                  <div className="text-sm text-slate-400 py-6 text-center">
                    No active drivers recorded in system.
                  </div>
                ) : (
                  drivers.slice(0, 5).map((driver) => {
                    const isAvailable = driver.status === 'AVAILABLE';
                    const isDelivering = driver.status === 'BUSY';

                    return (
                      <div
                        key={driver.id}
                        onClick={() => navigate('/owner/drivers')}
                        className="flex items-center justify-between p-4.5 sm:p-5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors border border-slate-100 hover:border-slate-200"
                      >
                        <div className="flex items-center gap-3.5">
                          <span
                            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                              isAvailable
                                ? 'bg-emerald-500'
                                : isDelivering
                                ? 'bg-sky-500'
                                : 'bg-slate-300'
                            }`}
                          />
                          <div>
                            <div className="text-sm font-bold text-slate-900">
                              {driver.name}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              {driver.totalDeliveries || 0} deliveries today
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-xs font-bold px-3.5 py-1.5 rounded-full border ${
                            isAvailable
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isDelivering
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {driver.status}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Water Sales Breakdown Module */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-9 space-y-6 shadow-xs">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                Today's Water Orders
              </h3>

              <div className="space-y-5">
                {/* Full Tank */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-700 font-semibold">Full Tank (~10,000L)</span>
                    <span className="font-black text-slate-900 tabular-nums">
                      {waterBreakdown.fullTank}
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-sky-500 transition-all duration-300 rounded-full"
                      style={{
                        width: totalWaterUnits > 0 ? `${(waterBreakdown.fullTank / totalWaterUnits) * 100}%` : '0%',
                      }}
                    />
                  </div>
                </div>

                {/* Half Tank */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-700 font-semibold">Half Tank (~5,000L)</span>
                    <span className="font-black text-slate-900 tabular-nums">
                      {waterBreakdown.halfTank}
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300 rounded-full"
                      style={{
                        width: totalWaterUnits > 0 ? `${(waterBreakdown.halfTank / totalWaterUnits) * 100}%` : '0%',
                      }}
                    />
                  </div>
                </div>

                {/* Drums */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-700 font-semibold">Drums (100L each)</span>
                    <span className="font-black text-slate-900 tabular-nums">
                      {waterBreakdown.drums}
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 transition-all duration-300 rounded-full"
                      style={{
                        width: totalWaterUnits > 0 ? `${(waterBreakdown.drums / totalWaterUnits) * 100}%` : '0%',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Operations Module - Centered Content Boxes with Generous 4-Sided Padding */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-9 space-y-5 shadow-xs">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs text-center sm:text-left">
                Quick Operations
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/owner/orders/create"
                  className="p-6 sm:p-7 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-sky-50 hover:border-sky-300 flex flex-col items-center justify-center text-center gap-2.5 transition-all shadow-xs group"
                >
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-sky-600 group-hover:scale-105 transition-transform shadow-xs">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                    Phone Order
                  </span>
                </Link>

                <Link
                  to="/owner/orders?status=PENDING"
                  className="p-6 sm:p-7 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-amber-50 hover:border-amber-300 flex flex-col items-center justify-center text-center gap-2.5 transition-all shadow-xs group"
                >
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform shadow-xs">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                    Assign Drivers
                  </span>
                </Link>

                <Link
                  to="/owner/customers"
                  className="p-6 sm:p-7 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-sky-50 hover:border-sky-300 flex flex-col items-center justify-center text-center gap-2.5 transition-all shadow-xs group"
                >
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-sky-600 group-hover:scale-105 transition-transform shadow-xs">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                    Customers
                  </span>
                </Link>

                <Link
                  to="/owner/khata"
                  className="p-6 sm:p-7 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-emerald-50 hover:border-emerald-300 flex flex-col items-center justify-center text-center gap-2.5 transition-all shadow-xs group"
                >
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform shadow-xs">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    Khata Ledgers
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side Drawer for Order Inspection */}
      <OrderDrawer
        order={selectedOrder}
        drivers={drivers}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedOrder(null);
        }}
        onAssignDriver={handleAssignDriver}
        onCancelOrder={handleCancelOrder}
      />
    </AppShell>
  );
}
