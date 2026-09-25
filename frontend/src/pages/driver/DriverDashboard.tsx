import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { driverApi } from '../../api';
import type { DriverDelivery } from '../../types';
import {
  Truck,
  Phone,
  MapPin,
  CheckCircle2,
  Navigation,
  Clock,
  AlertTriangle,
  X,
  LogOut,
  CreditCard,
  Calendar,
  Check,
  Palmtree,
  FileText,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function DriverDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<DriverDelivery[]>([]);
  const [loading, setLoading] = useState(true);

  // Duty & Leave Status state
  const [isOnLeave, setIsOnLeave] = useState(false);
  const [driverStatus, setDriverStatus] = useState('AVAILABLE');
  const [currentLeave, setCurrentLeave] = useState<{ id: number; fromDate: string; toDate: string; reason: string; status: string } | null>(null);
  const [loadingDuty, setLoadingDuty] = useState(false);

  // Leave Modal state
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveFromDate, setLeaveFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [leaveToDate, setLeaveToDate] = useState(new Date().toISOString().split('T')[0]);
  const [leaveReason, setLeaveReason] = useState('Personal Work');
  const [customLeaveReason, setCustomLeaveReason] = useState('');
  const [submittingLeave, setSubmittingLeave] = useState(false);

  // Failed delivery modal
  const [failingDeliveryId, setFailingDeliveryId] = useState<number | null>(null);
  const [failReason, setFailReason] = useState('Customer unavailable');
  const [failNotes, setFailNotes] = useState('');
  const [submittingFail, setSubmittingFail] = useState(false);

  // Payment confirmation modal
  const [completingDelivery, setCompletingDelivery] = useState<DriverDelivery | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'PENDING'>('PAID');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI'>('CASH');
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    loadDeliveries();
    loadDutyStatus();
  }, []);

  const loadDutyStatus = async () => {
    try {
      const res = await driverApi.getDutyStatus();
      if (res.data.success && res.data.data) {
        setIsOnLeave(res.data.data.isOnLeave);
        setDriverStatus(res.data.data.status);
        setCurrentLeave(res.data.data.currentLeave);
      }
    } catch {
      // ignore
    }
  };

  const loadDeliveries = async () => {
    setLoading(true);
    try {
      const res = await driverApi.getDeliveries();
      if (res.data.success) {
        setDeliveries(res.data.data || []);
      }
    } catch {
      toast.error('Unable to load assigned deliveries');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingLeave(true);
    try {
      const finalReason = customLeaveReason ? `${leaveReason}: ${customLeaveReason}` : leaveReason;
      const res = await driverApi.applyLeave({
        fromDate: leaveFromDate,
        toDate: leaveToDate,
        reason: finalReason,
      });
      if (res.data.success) {
        toast.success('Leave applied successfully. You are marked On Leave.');
        setShowLeaveModal(false);
        setCustomLeaveReason('');
        await loadDutyStatus();
        await loadDeliveries();
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to apply for leave');
    } finally {
      setSubmittingLeave(false);
    }
  };

  const handleResumeDuty = async () => {
    setLoadingDuty(true);
    try {
      const res = await driverApi.resumeDuty();
      if (res.data.success) {
        toast.success(res.data.message || 'You are now marked On Duty (Available)!');
        await loadDutyStatus();
        await loadDeliveries();
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to resume duty');
    } finally {
      setLoadingDuty(false);
    }
  };

  const activeDeliveries = deliveries.filter(
    (d) => !['DELIVERED', 'COMPLETED', 'FAILED', 'CANCELLED'].includes(d.status)
  );

  const completedDeliveries = deliveries.filter(
    (d) => ['DELIVERED', 'COMPLETED'].includes(d.status)
  );

  const nextDelivery = activeDeliveries[0] || null;

  const handleStepAction = async (delivery: DriverDelivery) => {
    const { status, deliveryId } = delivery;
    try {
      if (status === 'ASSIGNED') {
        await driverApi.acceptDelivery(deliveryId);
        toast.success('Order accepted. Tanker ready for departure.');
      } else if (status === 'ACCEPTED') {
        await driverApi.startDelivery(deliveryId);
        toast.success('Trip started. Customer notified: On The Way.');
      } else if (status === 'ON_THE_WAY' || status === 'DELIVERING') {
        await driverApi.arriveDelivery(deliveryId);
        toast.success('Arrived at customer location.');
      } else if (status === 'ARRIVED') {
        // Open payment modal
        setCompletingDelivery(delivery);
        return;
      }
      loadDeliveries();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Action failed');
    }
  };

  const handleConfirmComplete = async () => {
    if (!completingDelivery) return;
    setCompleting(true);
    try {
      await driverApi.completeDelivery(completingDelivery.deliveryId, {
        paymentStatus,
        paymentMethod,
      });
      toast.success('Delivery completed successfully');
      setCompletingDelivery(null);
      loadDeliveries();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to complete delivery');
    } finally {
      setCompleting(false);
    }
  };

  const handleSubmitFail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!failingDeliveryId) return;
    setSubmittingFail(true);
    try {
      const reasonText = failNotes ? `${failReason} - ${failNotes}` : failReason;
      await driverApi.failDelivery(failingDeliveryId, reasonText);
      toast.error('Delivery marked as failed');
      setFailingDeliveryId(null);
      setFailNotes('');
      loadDeliveries();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to update delivery');
    } finally {
      setSubmittingFail(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <Toaster position="top-center" />

      {/* Driver Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-black text-slate-900 tracking-tight">
              MS WATER DRIVER
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Hindupur Delivery Unit
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isOnLeave ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-800 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              On Leave (Absent)
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              On Duty (Available)
            </span>
          )}
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-5 sm:p-6 max-w-xl mx-auto w-full space-y-6">
        {/* Driver Greeting Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 flex items-center justify-between shadow-xs">
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {getGreeting()}, {user?.name || 'Driver'}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              <strong className="text-sky-700 font-bold tabular-nums">{activeDeliveries.length}</strong> pending · <strong className="text-emerald-700 font-bold tabular-nums">{completedDeliveries.length}</strong> delivered today
            </p>
          </div>
        </div>

        {/* Attendance & Duty Control Module */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold ${isOnLeave ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
                {isOnLeave ? <Palmtree className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                  Driver Attendance & Status
                </div>
                <div className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                  {isOnLeave ? 'You are currently ON LEAVE' : 'You are ON DUTY (Working)'}
                </div>
              </div>
            </div>
            <div>
              {isOnLeave ? (
                <button
                  onClick={handleResumeDuty}
                  disabled={loadingDuty}
                  className="btn-primary text-xs h-11 px-5 font-bold flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 border-emerald-600 w-full sm:w-auto"
                >
                  <Check className="w-4 h-4" />
                  <span>{loadingDuty ? 'Reporting...' : 'Report for Work'}</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowLeaveModal(true)}
                  className="text-xs h-11 px-5 font-bold rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <Palmtree className="w-4 h-4" />
                  <span>Apply for Leave</span>
                </button>
              )}
            </div>
          </div>

          {isOnLeave ? (
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
              <div className="font-bold flex items-center gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>Active Leave Status: Work is NOT assigned to you</span>
              </div>
              <p className="text-amber-800 leading-relaxed font-medium">
                You have marked yourself absent / on leave. The system will automatically bypass your profile and will not assign any new water tanker orders to you. When you return to work, click <strong>"Report for Work"</strong>.
              </p>
              {currentLeave && (
                <div className="pt-3 border-t border-amber-200/60 flex flex-wrap gap-3 font-semibold text-amber-900">
                  <span>📅 From: {currentLeave.fromDate}</span>
                  <span>📅 To: {currentLeave.toDate}</span>
                  <span>📝 Reason: {currentLeave.reason}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed font-medium">
              💡 <span className="font-bold text-slate-800">Automatic Dispatch Active:</span> Incoming orders in Hindupur are automatically assigned to you when you are free. If you cannot work today or are going on leave, click <strong>Apply for Leave</strong> so orders go to other free drivers.
            </div>
          )}
        </div>

        {/* Next Delivery Card */}
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-xs text-slate-400">
            Syncing driver schedule...
          </div>
        ) : nextDelivery ? (
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              Active Priority Delivery
            </div>

            <div className="bg-white border-2 border-sky-300 rounded-2xl p-6 sm:p-7 space-y-5 shadow-sm">
              {/* Order # and Status */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-sky-800 bg-sky-50 border border-sky-200 px-3.5 py-1.5 rounded-lg">
                  {nextDelivery.orderNumber}
                </span>
                <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-lg">
                  {nextDelivery.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Customer Info */}
              <div>
                <div className="text-lg font-bold text-slate-900">
                  {nextDelivery.customerName}
                </div>
                <div className="text-sm font-semibold text-sky-700 mt-0.5">
                  {nextDelivery.items?.[0]?.service || 'Full Tank'} · ₹{nextDelivery.totalAmount}
                </div>
              </div>

              {/* Address */}
              <div className="p-5 sm:p-5.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-start gap-2.5 text-xs text-slate-800 font-medium">
                  <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{nextDelivery.address}</span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2 pt-2 border-t border-slate-200">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Time slot: Morning (10:00–12:00)</span>
                </div>
                {nextDelivery.instructions && (
                  <div className="text-xs text-amber-800 italic pt-1">
                    Note: "{nextDelivery.instructions}"
                  </div>
                )}
              </div>

              {/* Action Buttons: Open Map & Call Customer */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(
                    nextDelivery.address + ', Hindupur'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary h-12 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4 text-sky-600" />
                  <span>OPEN MAP</span>
                </a>

                <a
                  href={`tel:${nextDelivery.customerMobile}`}
                  className="btn-secondary h-12 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>CALL CUSTOMER</span>
                </a>
              </div>

              {/* Sequential Dispatch Action Button */}
              <div>
                {nextDelivery.status === 'ASSIGNED' && (
                  <button
                    onClick={() => handleStepAction(nextDelivery)}
                    className="btn-primary w-full h-12 text-sm font-bold tracking-wide"
                  >
                    ACCEPT ORDER
                  </button>
                )}

                {nextDelivery.status === 'ACCEPTED' && (
                  <button
                    onClick={() => handleStepAction(nextDelivery)}
                    className="btn-primary w-full h-12 text-sm font-bold tracking-wide"
                  >
                    START DELIVERY (ON THE WAY)
                  </button>
                )}

                {(nextDelivery.status === 'ON_THE_WAY' || nextDelivery.status === 'DELIVERING') && (
                  <button
                    onClick={() => handleStepAction(nextDelivery)}
                    className="btn-primary w-full h-12 text-sm font-bold tracking-wide"
                  >
                    ARRIVED AT CUSTOMER LOCATION
                  </button>
                )}

                {nextDelivery.status === 'ARRIVED' && (
                  <button
                    onClick={() => handleStepAction(nextDelivery)}
                    className="btn-primary w-full h-12 text-sm font-bold tracking-wide"
                  >
                    MARK DELIVERED & COLLECT PAYMENT
                  </button>
                )}
              </div>

              {/* Report Failure Button */}
              <div className="text-center pt-1">
                <button
                  onClick={() => setFailingDeliveryId(nextDelivery.deliveryId)}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
                >
                  Report delivery issue / unable to deliver
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-2 shadow-xs">
            <CheckCircle2 className="w-9 h-9 text-emerald-600 mx-auto" />
            <div className="text-sm font-bold text-slate-900">All Deliveries Complete!</div>
            <div className="text-xs text-slate-500">
              No more assigned tanker deliveries in your queue for Hindupur.
            </div>
          </div>
        )}

        {/* Up Next Deliveries List */}
        {activeDeliveries.length > 1 && (
          <div className="space-y-2.5 pt-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              Upcoming in Queue ({activeDeliveries.length - 1})
            </div>
            <div className="space-y-2">
              {activeDeliveries.slice(1).map((del) => (
                <div
                  key={del.deliveryId}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 flex items-center justify-between shadow-xs hover:border-sky-300 transition-all"
                >
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-slate-900">
                      {del.customerName}
                    </div>
                    <div className="text-xs text-slate-500 truncate max-w-[260px] sm:max-w-md">
                      {del.address}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900 tabular-nums">
                      ₹{del.totalAmount}
                    </span>
                    <div className="text-[10px] text-slate-400">
                      {del.items?.[0]?.service || 'Tanker'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Payment Collection Modal */}
      {completingDelivery && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-9 max-w-md w-full space-y-6 shadow-2xl">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 border border-emerald-200 shadow-xs">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Record Payment
              </h3>
              <p className="text-xs text-slate-500">
                Order {completingDelivery.orderNumber} for {completingDelivery.customerName}
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                Bill Amount
              </div>
              <div className="text-3xl font-black text-slate-900 tabular-nums mt-1">
                ₹{completingDelivery.totalAmount}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700">
                Payment Status
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentStatus('PAID')}
                  className={`py-3 px-3 rounded-xl text-xs font-bold border transition-colors ${
                    paymentStatus === 'PAID'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  PAID (Received)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentStatus('PENDING')}
                  className={`py-3 px-3 rounded-xl text-xs font-bold border transition-colors ${
                    paymentStatus === 'PENDING'
                      ? 'bg-amber-50 border-amber-500 text-amber-800'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  PENDING (Khata)
                </button>
              </div>
            </div>

            {paymentStatus === 'PAID' && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700">
                  Payment Mode
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH')}
                    className={`py-3 px-3 rounded-xl text-xs font-bold border transition-colors ${
                      paymentMethod === 'CASH'
                        ? 'bg-sky-50 border-sky-500 text-sky-800'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`py-3 px-3 rounded-xl text-xs font-bold border transition-colors ${
                      paymentMethod === 'UPI'
                        ? 'bg-sky-50 border-sky-500 text-sky-800'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    UPI / PhonePe
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCompletingDelivery(null)}
                className="btn-secondary text-xs h-11 px-5 font-bold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmComplete}
                disabled={completing}
                className="btn-primary text-xs h-11 px-5 font-bold"
              >
                {completing ? 'Completing...' : 'COMPLETE'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Failed Delivery Modal */}
      {failingDeliveryId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-9 max-w-md w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-rose-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Report Delivery Failure
              </h3>
              <button
                onClick={() => setFailingDeliveryId(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitFail} className="space-y-4">
              <div className="space-y-2">
                {[
                  'Customer unavailable',
                  'Wrong address',
                  'Road inaccessible',
                  'Vehicle issue',
                  'Customer cancelled',
                  'Other',
                ].map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                      failReason === reason
                        ? 'bg-rose-50 border-rose-300 text-rose-800 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="failReason"
                      value={reason}
                      checked={failReason === reason}
                      onChange={() => setFailReason(reason)}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Additional Notes
                </label>
                <input
                  type="text"
                  value={failNotes}
                  onChange={(e) => setFailNotes(e.target.value)}
                  placeholder="Reason for delivery issue (Gate locked, customer unavailable, etc.)"
                  className="input-field text-xs h-11 px-3.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setFailingDeliveryId(null)}
                  className="btn-secondary text-xs h-11 px-5 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingFail}
                  className="h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  {submittingFail ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Driver Leave Application Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-9 max-w-lg w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                  <Palmtree className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Apply for Leave / Mark Absent
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Orders will not be auto-assigned while on leave
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLeaveModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-5">
              {/* Date Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    From Date
                  </label>
                  <input
                    type="date"
                    required
                    value={leaveFromDate}
                    onChange={(e) => setLeaveFromDate(e.target.value)}
                    className="input-field text-sm h-12 px-4 font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    To Date
                  </label>
                  <input
                    type="date"
                    required
                    value={leaveToDate}
                    min={leaveFromDate}
                    onChange={(e) => setLeaveToDate(e.target.value)}
                    className="input-field text-sm h-12 px-4 font-semibold"
                  />
                </div>
              </div>

              {/* Reason Radios */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Reason for Leave
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    'Personal Work',
                    'Sick / Medical',
                    'Family Function',
                    'Vehicle Maintenance',
                    'Weekly Rest',
                    'Other Reason',
                  ].map((reason) => (
                    <label
                      key={reason}
                      className={`flex items-center gap-2.5 p-3.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                        leaveReason === reason
                          ? 'bg-amber-50 border-amber-400 text-amber-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="leaveReason"
                        value={reason}
                        checked={leaveReason === reason}
                        onChange={() => setLeaveReason(reason)}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Custom notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Remarks / Notes (Optional)
                </label>
                <input
                  type="text"
                  value={customLeaveReason}
                  onChange={(e) => setCustomLeaveReason(e.target.value)}
                  placeholder="Reason for leave request (personal, out of town, etc.)"
                  className="input-field text-xs sm:text-sm h-12 px-4"
                />
              </div>

              {/* Notice */}
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900">
                ⚠️ <span className="font-bold">Confirmation:</span> Once submitted, your profile will immediately transition to <strong>On Leave</strong>. The dispatch algorithm will not assign any tanker deliveries to you until you return and tap "Report for Work".
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="btn-secondary text-xs sm:text-sm h-12 px-5 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingLeave}
                  className="h-12 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-amber-600/10 transition-colors"
                >
                  {submittingLeave ? 'Saving Leave...' : 'Submit & Mark On Leave'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
