import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { orderApi } from '../../api';
import type { Order } from '../../types';
import CustomerLayout from '../../components/layout/CustomerLayout';
import StatusBadge from '../../components/common/StatusBadge';
import {
  Plus,
  Truck,
  MapPin,
  CheckCircle2,
  Circle,
  RotateCcw,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function CustomerHome() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await orderApi.getMyOrders();
      if (res.data.success) {
        setOrders(res.data.data || []);
      }
    } catch {
      toast.error('Unable to load your orders');
    } finally {
      setLoading(false);
    }
  };

  const activeOrder = orders.find(
    (o) => !['DELIVERED', 'COMPLETED', 'CANCELLED', 'FAILED'].includes(o.status)
  );

  const pastOrders = orders
    .filter((o) => ['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(o.status))
    .slice(0, 3);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
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
      <div className="space-y-6">
        {/* Top Hero: Need water? */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-xs">
          <div>
            <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
              Doorstep Water Supply · Hindupur
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Customer'}
            </h1>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              Need fresh water today? Full tanker (10,000L), half tanker (5,000L), or drums delivered directly to your sump.
            </p>
          </div>

          <Link
            to="/customer/order"
            className="btn-primary h-12 px-6 text-sm font-bold self-start sm:self-auto shrink-0 shadow-md shadow-sky-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>ORDER WATER</span>
          </Link>
        </div>

        {/* Active Order Vertical Timeline */}
        {activeOrder && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Current Water Delivery
              </span>
              <StatusBadge status={activeOrder.status} />
            </div>

            <div className="bg-white border border-sky-300 rounded-2xl p-7 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="text-xs font-mono text-sky-700 font-bold">
                    {activeOrder.orderNumber}
                  </div>
                  <div className="text-lg font-bold text-slate-900 mt-0.5">
                    {activeOrder.items?.[0]?.serviceName || 'Full Tank'}
                    {activeOrder.items?.[0]?.quantity > 1 ? ` × ${activeOrder.items[0].quantity}` : ''}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-slate-900 tabular-nums">
                    ₹{activeOrder.totalAmount}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    {activeOrder.paymentMethod} · {activeOrder.paymentStatus}
                  </div>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div className="p-4.5 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-sky-600" />
                    Delivery Destination
                  </span>
                  <div className="text-slate-800 font-medium leading-relaxed">{activeOrder.deliveryAddress}</div>
                </div>

                <div className="p-4.5 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-sky-600" />
                    Assigned Driver
                  </span>
                  <div className="text-slate-800 font-bold">
                    {activeOrder.driverName ? (
                      <span className="flex items-center justify-between">
                        <span>{activeOrder.driverName}</span>
                        <span className="text-xs text-emerald-600 font-normal">● On Duty</span>
                      </span>
                    ) : (
                      <span className="text-amber-600 font-normal">Assigning tanker driver...</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Real Vertical Timeline */}
              <div className="pt-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                  Delivery Timeline
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
                        <div
                          className={`text-xs font-bold ${
                            step.completed ? 'text-slate-900' : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </div>
                        <div className="text-xs text-slate-500">
                          {step.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Order History */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Recent Deliveries
            </span>
            <Link
              to="/customer/orders"
              className="text-xs font-bold text-sky-600 hover:text-sky-700"
            >
              View all orders →
            </Link>
          </div>

          {loading ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-10 text-center text-slate-500 text-sm shadow-xs">
              Loading orders...
            </div>
          ) : pastOrders.length === 0 ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-10 text-center space-y-2 shadow-xs">
              <div className="text-base font-bold text-slate-800">No past deliveries</div>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                Book your first water tanker or drum delivery above!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {pastOrders.map((o) => (
                <div
                  key={o.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 flex items-center justify-between hover:border-slate-300 shadow-xs transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-slate-900">
                        {o.orderNumber}
                      </span>
                      <StatusBadge status={o.status} />
                    </div>
                    <div className="text-xs text-slate-700 font-medium">
                      {o.items?.[0]?.serviceName || 'Full Tank'} · ₹{o.totalAmount}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {new Date(o.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </div>

                  <Link
                    to="/customer/order"
                    className="btn-secondary text-xs h-10 px-4 font-semibold"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-sky-600" />
                    <span>Reorder</span>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}
