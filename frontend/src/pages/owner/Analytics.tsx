import { useState, useEffect } from 'react';
import { adminApi } from '../../api';
import type { DashboardStats, Order } from '../../types';
import AppShell from '../../components/layout/AppShell';
import KpiCard from '../../components/common/KpiCard';
import {
  BarChart3,
  TrendingUp,
  CreditCard,
  ClipboardList,
  Users,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function Analytics() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeRange, setTimeRange] = useState<'today' | '7days' | '30days'>('today');

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes] = await Promise.allSettled([
        adminApi.getDashboardStats(selectedDate),
        adminApi.getOrders({ date: selectedDate }),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.data.success) {
        setStats(statsRes.value.data.data);
      }
      if (ordersRes.status === 'fulfilled' && ordersRes.value.data.success) {
        setOrders(ordersRes.value.data.data || []);
      }
    } catch {
      toast.error('Unable to load operational analytics');
    } finally {
      setLoading(false);
    }
  };

  // Status breakdown data for Pie Chart
  const statusData = [
    { name: 'Delivered', value: stats?.deliveredOrders || 0, color: '#10B981' },
    { name: 'On The Way', value: stats?.onTheWayOrders || 0, color: '#22D3EE' },
    { name: 'Pending', value: stats?.pendingOrders || 0, color: '#F59E0B' },
    { name: 'Cancelled', value: stats?.cancelledOrders || 0, color: '#EF4444' },
  ].filter((item) => item.value > 0);

  // Water type distribution
  const waterStats = {
    fullTank: 0,
    halfTank: 0,
    drums: 0,
  };

  orders.forEach((o) => {
    o.items?.forEach((i) => {
      const name = (i.serviceName || '').toLowerCase();
      if (name.includes('half')) waterStats.halfTank += i.quantity || 1;
      else if (name.includes('drum')) waterStats.drums += i.quantity || 1;
      else if (name.includes('full') || name.includes('tank')) waterStats.fullTank += i.quantity || 1;
    });
  });

  const waterData = [
    { name: 'Full Tank (~10,000L)', count: waterStats.fullTank },
    { name: 'Half Tank (~5,000L)', count: waterStats.halfTank },
    { name: 'Drums (100L each)', count: waterStats.drums },
  ];

  const avgOrderValue =
    stats && stats.deliveredOrders > 0
      ? Math.round(Number(stats.revenue || 0) / stats.deliveredOrders)
      : 0;

  return (
    <AppShell breadcrumb="Management / Analytics">
      <Toaster position="top-right" />
      <div className="space-y-12 sm:space-y-16">
        {/* Header Module */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-2">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Operations Analytics</h1>
            <p className="text-base text-slate-500 mt-2 leading-relaxed">
              Business intelligence, delivery volume breakdowns, and revenue performance across Hindupur.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="inline-flex rounded-2xl bg-white p-1.5 border border-slate-200/90 shadow-xs gap-1">
              <button
                onClick={() => {
                  setTimeRange('today');
                  setSelectedDate(new Date().toISOString().split('T')[0]);
                }}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  timeRange === 'today'
                    ? 'bg-sky-50 text-sky-800 shadow-xs border border-sky-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setTimeRange('7days')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  timeRange === '7days'
                    ? 'bg-sky-50 text-sky-800 shadow-xs border border-sky-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setTimeRange('30days')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  timeRange === '30days'
                    ? 'bg-sky-50 text-sky-800 shadow-xs border border-sky-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                30 Days
              </button>
            </div>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field text-xs h-11 py-2 px-3.5 w-auto bg-white"
            />
          </div>
        </div>

        {/* 4 Analytics KPI Cards Module */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <KpiCard
            label="Gross Revenue"
            value={stats ? `₹${Number(stats.revenue || 0).toLocaleString('en-IN')}` : '₹0'}
            subValue="Delivered bookings"
            badgeText="Revenue"
            badgeType="success"
            icon={CreditCard}
          />
          <KpiCard
            label="Total Completed Orders"
            value={stats ? stats.deliveredOrders : 0}
            subValue={`Out of ${stats ? stats.totalOrders : 0} bookings`}
            badgeText="Fulfilled"
            badgeType="cyan"
            icon={ClipboardList}
          />
          <KpiCard
            label="Average Order Value"
            value={`₹${avgOrderValue}`}
            subValue="Revenue per fulfilled delivery"
            badgeText="AOV"
            badgeType="neutral"
            icon={TrendingUp}
          />
          <KpiCard
            label="Active Customers"
            value={stats ? stats.totalCustomers : 0}
            subValue="Hindupur client directory"
            badgeText="Directory"
            badgeType="neutral"
            icon={Users}
          />
        </div>

        {/* Analytical Visualizations Module */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
          {/* Chart 1: Water Delivery Breakdown */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-7 sm:p-8 space-y-6 shadow-xs">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Water Service Volume Breakdown
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Distribution of Full Tank, Half Tank, and Drum orders
              </p>
            </div>

            <div className="h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={waterData} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <XAxis type="number" stroke="#94A3B8" fontSize={11} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#64748B"
                    fontSize={11}
                    width={150}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#0F172A',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    }}
                  />
                  <Bar dataKey="count" fill="#0284C7" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Fulfillment Status Distribution */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-7 sm:p-8 space-y-6 shadow-xs">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Fulfillment Status Distribution
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Delivery pipeline efficiency for selected date
              </p>
            </div>

            {statusData.length === 0 ? (
              <div className="h-72 sm:h-80 flex items-center justify-center text-sm text-slate-400 font-medium">
                No order activity recorded for this date.
              </div>
            ) : (
              <div className="h-72 sm:h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: '#0F172A',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
