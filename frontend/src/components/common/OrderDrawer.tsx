import { useState } from 'react';
import { X, Phone, MapPin, CheckCircle2, Circle, Clock, User, Truck, AlertTriangle } from 'lucide-react';
import { Order, Driver } from '../../types';
import StatusBadge from './StatusBadge';

interface OrderDrawerProps {
  order: Order | null;
  drivers?: Driver[];
  isOpen: boolean;
  onClose: () => void;
  onAssignDriver?: (orderId: number, driverId: number) => Promise<void>;
  onCancelOrder?: (orderId: number, reason: string) => Promise<void>;
}

export default function OrderDrawer({
  order,
  drivers = [],
  isOpen,
  onClose,
  onAssignDriver,
  onCancelOrder,
}: OrderDrawerProps) {
  const [selectedDriverId, setSelectedDriverId] = useState<number | ''>('');
  const [assigning, setAssigning] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  if (!isOpen || !order) return null;

  const handleAssign = async () => {
    if (!selectedDriverId || !onAssignDriver) return;
    setAssigning(true);
    try {
      await onAssignDriver(order.id, Number(selectedDriverId));
    } finally {
      setAssigning(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm(`Cancel order ${order.orderNumber}?`)) return;
    if (!onCancelOrder) return;
    setCancelling(true);
    try {
      await onCancelOrder(order.id, 'Cancelled by owner');
    } finally {
      setCancelling(false);
    }
  };

  // Timeline steps
  const steps = [
    { label: 'Order Created', completed: true },
    {
      label: 'Confirmed',
      completed: ['CONFIRMED', 'ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'DELIVERING', 'ARRIVED', 'DELIVERED', 'COMPLETED'].includes(order.status),
    },
    {
      label: 'Driver Assigned',
      completed: ['ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'DELIVERING', 'ARRIVED', 'DELIVERED', 'COMPLETED'].includes(order.status) || Boolean(order.driverName),
    },
    {
      label: 'Accepted',
      completed: ['ACCEPTED', 'ON_THE_WAY', 'DELIVERING', 'ARRIVED', 'DELIVERED', 'COMPLETED'].includes(order.status),
    },
    {
      label: 'On The Way',
      completed: ['ON_THE_WAY', 'DELIVERING', 'ARRIVED', 'DELIVERED', 'COMPLETED'].includes(order.status),
    },
    {
      label: 'Delivered',
      completed: ['DELIVERED', 'COMPLETED'].includes(order.status),
    },
  ];

  const primaryItem = order.items && order.items.length > 0 ? order.items[0] : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 z-50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl sm:max-w-2xl bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between bg-white">
          <div>
            <div className="flex items-center gap-3.5">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                {order.orderNumber}
              </h2>
              <StatusBadge status={order.status} />
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              Created on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-8 py-7 space-y-7">
          {/* Water Details & Billing Card */}
          <div className="p-6 sm:p-7 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">
                  Water Service
                </div>
                <div className="text-base font-black text-slate-900 mt-1.5">
                  {primaryItem?.serviceName || 'Full Tank'}
                  {primaryItem && primaryItem.quantity > 1 ? ` × ${primaryItem.quantity}` : ''}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">
                  Total Amount
                </div>
                <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
                  ₹{order.totalAmount}
                </div>
                <div className="text-xs text-slate-500 font-medium mt-1">
                  {order.paymentMethod || 'Cash'} · <span className={order.paymentStatus === 'PAID' ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>{order.paymentStatus || 'Pending'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Section */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Customer Details
            </div>
            <div className="p-6 sm:p-7 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-bold text-slate-900">{order.customerName}</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5 tabular-nums">{order.customerMobile}</div>
                </div>
              </div>
              <a
                href={`tel:${order.customerMobile}`}
                className="p-3 text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-xl border border-sky-200 transition-colors flex items-center gap-2 font-bold text-xs"
                title="Call Customer"
              >
                <Phone className="w-4 h-4" />
                <span>Call</span>
              </a>
            </div>
          </div>

          {/* Delivery Address & Slot */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Delivery Destination
            </div>
            <div className="p-6 sm:p-7 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div className="text-sm text-slate-800 leading-relaxed font-medium">
                  {order.deliveryAddress}
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 pt-3 border-t border-slate-200">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Slot: <strong className="text-slate-800 font-semibold">{order.timeSlot || 'Morning'}</strong></span>
                <span>·</span>
                <span>Date: <strong className="text-slate-800 font-semibold">{order.deliveryDate || 'Today'}</strong></span>
              </div>
              {order.instructions && (
                <div className="text-xs text-slate-600 italic pt-1 bg-white p-3 rounded-xl border border-slate-100">
                  Note: "{order.instructions}"
                </div>
              )}
            </div>
          </div>

          {/* Driver Assignment Section */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Driver Assignment
            </div>
            <div className="p-6 sm:p-7 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-sm text-slate-700">
                  <Truck className="w-5 h-5 text-slate-400" />
                  <span>Assigned Driver:</span>
                  <span className={`font-bold ${order.driverName ? 'text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-200' : 'text-amber-700 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200'}`}>
                    {order.driverName || 'Unassigned (Auto-Assign Pending)'}
                  </span>
                </div>
              </div>

              {onAssignDriver && !['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(order.status) && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3 border-t border-slate-200">
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value ? Number(e.target.value) : '')}
                    className="flex-1 input-field text-sm h-12 px-4 bg-white"
                  >
                    <option value="">Choose Driver to Assign / Reassign...</option>
                    <option value="999">👑 Owner (Self-Delivery)</option>
                    {drivers.map((d) => {
                      const isOnLeave = d.status === 'ON_LEAVE';
                      const label = isOnLeave
                        ? `${d.name} (On Leave - Absent)`
                        : `${d.name} (${d.status === 'AVAILABLE' ? 'Available' : d.status})`;
                      return (
                        <option key={d.id} value={d.id} disabled={isOnLeave}>
                          {isOnLeave ? `🚫 ${label}` : `🚚 ${label}`}
                        </option>
                      );
                    })}
                  </select>
                  <button
                    onClick={handleAssign}
                    disabled={!selectedDriverId || assigning}
                    className="btn-primary text-sm h-12 px-6 shrink-0 font-bold shadow-md shadow-sky-600/10"
                  >
                    {assigning ? 'Assigning...' : 'Assign Driver'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Timeline Section */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Order Timeline
            </div>
            <div className="p-6 sm:p-7 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="relative pl-7 space-y-5">
                {/* Vertical connecting line */}
                <div className="absolute top-2 bottom-2 left-[11px] w-0.5 bg-slate-200" />

                {steps.map((step, idx) => (
                  <div key={idx} className="relative flex items-center gap-3.5">
                    <div className="absolute -left-7 flex items-center justify-center">
                      {step.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 bg-slate-50" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 bg-slate-50" />
                      )}
                    </div>
                    <span
                      className={`text-xs sm:text-sm font-semibold ${
                        step.completed ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 sm:p-7 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
          {onCancelOrder && !['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(order.status) && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-bold px-4.5 py-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 flex items-center gap-2 transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              Cancel Order
            </button>
          )}
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={onClose}
              className="btn-secondary text-xs sm:text-sm h-12 px-6 font-bold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
