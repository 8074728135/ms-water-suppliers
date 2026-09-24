import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../../api';
import type { Order } from '../../types';
import CustomerLayout from '../../components/layout/CustomerLayout';
import StatusBadge from '../../components/common/StatusBadge';
import {
  MapPin,
  RotateCcw,
  Plus,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await orderApi.getMyOrders();
      if (res.data.success) {
        setOrders(res.data.data || []);
      }
    } catch {
      toast.error('Unable to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === 'ACTIVE') {
      return !['DELIVERED', 'COMPLETED', 'CANCELLED', 'FAILED'].includes(o.status);
    }
    if (filter === 'COMPLETED') {
      return ['DELIVERED', 'COMPLETED'].includes(o.status);
    }
    return true;
  });

  return (
    <CustomerLayout>
      <Toaster position="top-center" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Water Orders</h1>
            <p className="text-sm text-slate-600 mt-1">
              Water tanker and drum delivery history in Hindupur.
            </p>
          </div>

          <Link
            to="/customer/order"
            className="btn-primary text-xs h-10 px-4 self-start sm:self-auto font-bold shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Book Water</span>
          </Link>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 text-xs rounded-xl font-bold transition-colors ${
                filter === tab
                  ? 'bg-sky-50 text-sky-800 border border-sky-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab === 'ALL'
                ? `All Orders (${orders.length})`
                : tab === 'ACTIVE'
                ? 'Active Deliveries'
                : 'Delivered'}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs">
            Loading your orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
            <div className="text-base font-bold text-slate-900">No orders found</div>
            <p className="text-xs text-slate-500">
              {filter === 'ACTIVE'
                ? 'No active water deliveries right now.'
                : 'You have not placed any water orders yet.'}
            </p>
            <Link
              to="/customer/order"
              className="btn-primary text-xs h-9 px-4 inline-flex mt-2 font-bold"
            >
              Order Now
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const item = order.items?.[0];
              return (
                <div
                  key={order.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 space-y-4 hover:border-sky-300 shadow-xs hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-slate-900 font-mono">
                        {order.orderNumber}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {item?.serviceName || 'Full Tank'}
                        {item && item.quantity > 1 ? ` × ${item.quantity}` : ''}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span>{order.deliveryAddress}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-lg font-black text-slate-900 tabular-nums">
                        ₹{order.totalAmount}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {order.paymentMethod} · <span className={order.paymentStatus === 'PAID' ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>{order.paymentStatus || 'Pending'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="text-slate-500">
                      Driver: <strong className="text-slate-800 font-semibold">{order.driverName || 'Assigning driver...'}</strong>
                    </div>

                    <Link
                      to="/customer/order"
                      className="btn-secondary text-xs h-8 px-3 font-semibold"
                    >
                      <RotateCcw className="w-3 h-3 text-sky-600" />
                      <span>Reorder</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
