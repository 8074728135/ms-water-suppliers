import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { adminApi } from '../../api';
import type { Order, Driver } from '../../types';
import AppShell from '../../components/layout/AppShell';
import StatusBadge from '../../components/common/StatusBadge';
import OrderDrawer from '../../components/common/OrderDrawer';
import {
  Search,
  Plus,
  MapPin,
  RotateCcw,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function OwnerOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'ALL');
  const [driverFilter, setDriverFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Selected Order for slide-out drawer
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [statusFilter, dateFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (dateFilter) params.date = dateFilter;

      const [ordersRes, driversRes] = await Promise.allSettled([
        adminApi.getOrders(params),
        adminApi.getDrivers(),
      ]);

      if (ordersRes.status === 'fulfilled' && ordersRes.value.data.success) {
        setOrders(ordersRes.value.data.data || []);
      }
      if (driversRes.status === 'fulfilled' && driversRes.value.data.success) {
        setDrivers(driversRes.value.data.data as any || []);
      }
    } catch {
      toast.error('Unable to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDriver = async (orderId: number, driverId: number) => {
    try {
      await adminApi.assignDriver(orderId, driverId);
      toast.success('Driver assigned successfully');
      loadData();
      setIsDrawerOpen(false);
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

  // Client-side search and driver filter
  const filteredOrders = orders.filter((order) => {
    // Driver filter
    if (driverFilter !== 'ALL') {
      if (driverFilter === 'UNASSIGNED' && order.driverName) return false;
      if (driverFilter !== 'UNASSIGNED' && order.driverName !== driverFilter) return false;
    }

    // Search query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchesOrderNo = order.orderNumber?.toLowerCase().includes(q);
    const matchesCustomer = order.customerName?.toLowerCase().includes(q);
    const matchesPhone = order.customerMobile?.includes(q);
    const matchesAddress = order.deliveryAddress?.toLowerCase().includes(q);

    return matchesOrderNo || matchesCustomer || matchesPhone || matchesAddress;
  });

  const statusTabs = [
    { label: 'All Orders', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Assigned', value: 'ASSIGNED' },
    { label: 'Delivering', value: 'DELIVERING' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  return (
    <AppShell breadcrumb="Operations / Orders Management">
      <Toaster position="top-right" />
      <div className="space-y-12 sm:space-y-16">
        {/* Header Module */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-2">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Orders Management</h1>
            <p className="text-base text-slate-500 mt-2 leading-relaxed">
              Real-time dispatch, driver allocation, and order execution logs across all Hindupur zones.
            </p>
          </div>

          <Link
            to="/owner/orders/create"
            className="btn-primary text-sm h-11 px-6 self-start sm:self-auto font-bold shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Phone Order</span>
          </Link>
        </div>

        {/* Status Filter Tabs Module */}
        <div className="flex items-center gap-2 overflow-x-auto bg-white p-2 rounded-2xl border border-slate-200/90 shadow-xs">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatusFilter(tab.value);
                setSearchParams(tab.value === 'ALL' ? {} : { status: tab.value });
              }}
              className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                statusFilter === tab.value
                  ? 'bg-sky-50 text-sky-800 border border-sky-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Toolbar: Search, Date, Driver Filter Module */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 flex flex-col md:flex-row items-center gap-5 shadow-xs">
          {/* Search Bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order #, customer, phone, or address..."
              className="input-field pl-11 text-sm h-12"
            />
          </div>

          {/* Driver Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={driverFilter}
              onChange={(e) => setDriverFilter(e.target.value)}
              className="input-field text-sm h-12 py-2 px-4 w-full md:w-52"
            >
              <option value="ALL">All Drivers</option>
              <option value="UNASSIGNED">Unassigned Only</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input-field text-sm h-12 py-2 px-4 w-full md:w-auto"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                title="Clear date filter"
                className="p-3 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 bg-white"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Orders Table (Desktop) / Cards (Mobile) */}
        {loading ? (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-16 text-center text-slate-500 text-sm shadow-xs">
            Loading operational orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-16 text-center space-y-3 shadow-xs">
            <div className="text-base font-bold text-slate-900">No orders found</div>
            <div className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              There are no water delivery orders matching your filter criteria.
            </div>
            <button
              onClick={() => {
                setStatusFilter('ALL');
                setDriverFilter('ALL');
                setDateFilter('');
                setSearchQuery('');
              }}
              className="btn-secondary text-xs h-10 px-5 font-bold mt-2"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table Module */}
            <div className="hidden lg:block bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
              <table className="ops-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Water Service</th>
                    <th>Address</th>
                    <th>Driver</th>
                    <th>Slot / Date</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const item = order.items?.[0];
                    return (
                      <tr
                        key={order.id}
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsDrawerOpen(true);
                        }}
                        className="cursor-pointer"
                      >
                        <td>
                          <span className="font-bold text-slate-900 text-xs font-mono px-3.5 py-1.5 bg-slate-100 rounded-lg border border-slate-200">
                            {order.orderNumber}
                          </span>
                        </td>
                        <td>
                          <div className="space-y-1">
                            <div className="font-bold text-slate-900 text-sm truncate max-w-[140px]">
                              {order.customerName}
                            </div>
                            <div className="text-xs text-slate-500 tabular-nums font-medium">
                              {order.customerMobile}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="text-sky-800 text-xs font-bold bg-sky-50 px-3.5 py-1.5 rounded-lg border border-sky-100">
                            {item?.serviceName || 'Full Tank'}
                            {item && item.quantity > 1 ? ` × ${item.quantity}` : ''}
                          </span>
                        </td>
                        <td>
                          <div className="text-xs text-slate-700 truncate max-w-[200px] leading-relaxed" title={order.deliveryAddress}>
                            {order.deliveryAddress}
                          </div>
                        </td>
                        <td>
                          <span className={`text-xs px-3.5 py-1.5 rounded-full border font-semibold ${order.driverName ? 'text-slate-800 bg-slate-50 border-slate-200' : 'text-amber-700 bg-amber-50 border-amber-200'}`}>
                            {order.driverName || 'Unassigned'}
                          </span>
                        </td>
                        <td>
                          <div className="space-y-1">
                            <div className="text-xs text-slate-900 font-semibold">
                              {order.timeSlot || 'Morning'}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {order.deliveryDate || 'Today'}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="font-black text-slate-900 tabular-nums text-sm">
                            ₹{order.totalAmount}
                          </span>
                        </td>
                        <td>
                          <span className={`text-xs font-bold px-3.5 py-1.5 rounded-full border ${order.paymentStatus === 'PAID' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'}`}>
                            {order.paymentStatus || 'Pending'}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsDrawerOpen(true);
                            }}
                            className="btn-secondary text-xs h-10 px-5 font-bold"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View with Generous Line Spacing */}
            <div className="lg:hidden space-y-5">
              {filteredOrders.map((order) => {
                const item = order.items?.[0];
                return (
                  <div
                    key={order.id}
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsDrawerOpen(true);
                    }}
                    className="bg-white border border-slate-200/90 rounded-2xl p-7 sm:p-8 space-y-4 cursor-pointer hover:border-sky-300 shadow-xs hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 font-mono px-3.5 py-1.5 bg-slate-100 rounded-lg border border-slate-200">
                        {order.orderNumber}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>

                    <div className="flex items-baseline justify-between gap-4 pt-1">
                      <div className="space-y-1">
                        <div className="text-base font-black text-slate-900">
                          {order.customerName}
                        </div>
                        <div className="text-xs text-sky-800 font-bold bg-sky-50 px-3.5 py-1.5 rounded-lg inline-block border border-sky-100">
                          {item?.serviceName || 'Full Tank'} {item && item.quantity > 1 ? `× ${item.quantity}` : ''}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-lg font-black text-slate-900 tabular-nums">
                          ₹{order.totalAmount}
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          {order.paymentMethod || 'Cash'}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 flex items-center gap-1.5 truncate leading-relaxed">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{order.deliveryAddress}</span>
                    </div>

                    <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>Driver: <strong className="text-slate-800 font-semibold">{order.driverName || 'Unassigned'}</strong></span>
                      <span>Slot: <strong className="text-slate-800 font-semibold">{order.timeSlot || 'Morning'}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
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
