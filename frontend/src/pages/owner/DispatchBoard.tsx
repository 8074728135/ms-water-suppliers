import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api';
import type { Order, Driver } from '../../types';
import AppShell from '../../components/layout/AppShell';
import StatusBadge from '../../components/common/StatusBadge';
import OrderDrawer from '../../components/common/OrderDrawer';
import {
  Columns3,
  Plus,
  RefreshCw,
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  User,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function DispatchBoard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');

  // Slide-out drawer
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersRes, driversRes] = await Promise.allSettled([
        adminApi.getOrders({ date: selectedDate }),
        adminApi.getDrivers(),
      ]);

      if (ordersRes.status === 'fulfilled' && ordersRes.value.data.success) {
        setOrders(ordersRes.value.data.data || []);
      }
      if (driversRes.status === 'fulfilled' && driversRes.value.data.success) {
        setDrivers(driversRes.value.data.data as any || []);
      }
    } catch {
      toast.error('Unable to load dispatch board');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDriver = async (orderId: number, driverId: number) => {
    try {
      await adminApi.assignDriver(orderId, driverId);
      toast.success('Driver assigned');
      loadData();
    } catch {
      toast.error('Failed to assign driver');
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    try {
      await adminApi.cancelOrder(orderId);
      toast.success('Order cancelled');
      loadData();
      setIsDrawerOpen(false);
    } catch {
      toast.error('Failed to cancel order');
    }
  };

  // Filter orders by search
  const filteredOrders = orders.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.orderNumber?.toLowerCase().includes(q) ||
      o.customerName?.toLowerCase().includes(q) ||
      o.deliveryAddress?.toLowerCase().includes(q) ||
      o.customerMobile?.includes(q)
    );
  });

  // Organize orders into 6 operational columns
  const columns = [
    {
      id: 'PENDING',
      title: 'NEW / PENDING',
      orders: filteredOrders.filter((o) => o.status === 'PENDING'),
      badgeColor: 'border-amber-200 text-amber-700 bg-amber-50',
    },
    {
      id: 'CONFIRMED',
      title: 'CONFIRMED',
      orders: filteredOrders.filter((o) => o.status === 'CONFIRMED' && !o.driverName),
      badgeColor: 'border-sky-200 text-sky-700 bg-sky-50',
    },
    {
      id: 'UNASSIGNED',
      title: 'UNASSIGNED',
      orders: filteredOrders.filter((o) => (o.status === 'CONFIRMED' || o.status === 'PENDING') && !o.driverName),
      badgeColor: 'border-rose-200 text-rose-700 bg-rose-50',
    },
    {
      id: 'ASSIGNED',
      title: 'ASSIGNED',
      orders: filteredOrders.filter((o) => o.status === 'ASSIGNED' || o.status === 'ACCEPTED'),
      badgeColor: 'border-slate-200 text-slate-700 bg-slate-100',
    },
    {
      id: 'ON_THE_WAY',
      title: 'ON THE WAY',
      orders: filteredOrders.filter(
        (o) => o.status === 'ON_THE_WAY' || (o.status as any) === 'DELIVERING' || o.status === 'ARRIVED'
      ),
      badgeColor: 'border-cyan-200 text-cyan-700 bg-cyan-50',
    },
    {
      id: 'DELIVERED',
      title: 'DELIVERED',
      orders: filteredOrders.filter((o) => o.status === 'DELIVERED' || (o.status as any) === 'COMPLETED'),
      badgeColor: 'border-emerald-200 text-emerald-700 bg-emerald-50',
    },
  ];

  return (
    <AppShell breadcrumb="Operations / Dispatch Board">
      <Toaster position="top-right" />
      <div className="space-y-12 sm:space-y-16">
        {/* Header Module */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-2">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Columns3 className="w-8 h-8 text-sky-600" />
              Visual Dispatch Board
            </h1>
            <p className="text-base text-slate-500 mt-2 leading-relaxed">
              Multi-column logistics board. Allocate drivers, monitor tanker dispatch stages, and streamline order handoffs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field text-xs h-11 py-2 px-3.5 w-auto bg-white"
            />
            <button
              onClick={loadData}
              title="Refresh Board"
              className="p-3 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200/90 rounded-xl transition-colors bg-white shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/owner/orders/create"
              className="btn-primary text-sm h-11 px-6 font-bold shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>New Phone Order</span>
            </Link>
          </div>
        </div>

        {/* Quick Search Toolbar Module */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs">
          <div className="relative max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dispatch board by order #, customer, address..."
              className="input-field pl-11 text-sm h-12"
            />
          </div>
        </div>

        {/* 6-Column Visual Kanban / Board Module */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-6 sm:gap-7 items-start overflow-x-auto pb-4">
          {columns.map((col) => (
            <div
              key={col.id}
              className="bg-slate-100/80 border border-slate-200/90 rounded-2xl flex flex-col min-h-[560px] p-2.5"
            >
              {/* Column Header */}
              <div className="p-4 sm:p-4.5 border-b border-slate-200/90 bg-white rounded-xl flex items-center justify-between mb-3.5 shadow-xs">
                <span className="text-xs font-black text-slate-800 tracking-wider">
                  {col.title}
                </span>
                <span className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border tabular-nums ${col.badgeColor}`}>
                  {col.orders.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="p-1 flex-1 space-y-4 overflow-y-auto max-h-[calc(100vh-280px)]">
                {col.orders.length === 0 ? (
                  <div className="h-36 flex items-center justify-center text-xs text-slate-400 font-medium italic">
                    No orders in stage
                  </div>
                ) : (
                  col.orders.map((order) => {
                    const item = order.items?.[0];
                    return (
                      <div
                        key={order.id}
                        className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 hover:border-sky-300 hover:shadow-md transition-all shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 font-mono px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200">
                            {order.orderNumber}
                          </span>
                          <span className="text-sm font-black text-slate-900 tabular-nums">
                            ₹{order.totalAmount}
                          </span>
                        </div>

                        <div className="text-sm font-bold text-slate-900 truncate">
                          {order.customerName}
                        </div>

                        <div className="text-xs text-sky-800 font-bold bg-sky-50 px-3 py-1.5 rounded-lg inline-block border border-sky-100">
                          {item?.serviceName || 'Full Tank'}
                          {item && item.quantity > 1 ? ` × ${item.quantity}` : ''}
                        </div>

                        <div className="text-xs text-slate-500 truncate flex items-center gap-1.5 leading-relaxed">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{order.deliveryAddress}</span>
                        </div>

                        {/* Driver Selector on Card */}
                        {!['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(order.status) && (
                          <div className="pt-3.5 border-t border-slate-100 flex items-center gap-2">
                            <select
                              defaultValue={order.driverId || ''}
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleAssignDriver(order.id, Number(e.target.value));
                                }
                              }}
                              className="input-field text-xs h-11 px-3 flex-1"
                            >
                              <option value="">
                                {order.driverName ? `Assigned: ${order.driverName}` : 'Assign Driver...'}
                              </option>
                              <option value="999">Owner (Self)</option>
                              {drivers.map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d.name} {d.status === 'AVAILABLE' ? '●' : `(${d.status})`}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs text-slate-500 font-medium">
                            {order.timeSlot || 'Morning'}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsDrawerOpen(true);
                            }}
                            className="text-xs text-sky-700 hover:text-sky-800 font-bold px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 transition-colors"
                          >
                            Details →
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slide-out Order Details Drawer */}
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
