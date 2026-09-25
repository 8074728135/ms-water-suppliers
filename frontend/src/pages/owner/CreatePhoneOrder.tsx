import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi, serviceApi } from '../../api';
import type { WaterService, Driver, CustomerProfile } from '../../types';
import AppShell from '../../components/layout/AppShell';
import {
  PhoneCall,
  User,
  Minus,
  Plus,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function CreatePhoneOrder() {
  const navigate = useNavigate();
  const [services, setServices] = useState<WaterService[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [searching, setSearching] = useState(false);
  const [foundCustomer, setFoundCustomer] = useState<CustomerProfile | null>(null);

  // Step 2: Water
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [drumQuantity, setDrumQuantity] = useState(1);

  // Step 4: Delivery
  const [deliveryDateOption, setDeliveryDateOption] = useState<'today' | 'tomorrow'>('today');
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('MORNING');
  const [instructions, setInstructions] = useState('');

  // Step 5: Payment
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'PENDING'>('CASH');

  // Step 6: Driver
  const [selectedDriverId, setSelectedDriverId] = useState<number | 'AUTO'>('AUTO');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [servicesRes, driversRes] = await Promise.allSettled([
        serviceApi.getAll(),
        adminApi.getDrivers(),
      ]);

      if (servicesRes.status === 'fulfilled' && servicesRes.value.data.success) {
        const s = servicesRes.value.data.data || [];
        setServices(s);
        // Default to Full Tank
        const full = s.find((item) => item.name === 'FULL_TANK') || s[0];
        if (full) setSelectedServiceId(full.id);
      }

      if (driversRes.status === 'fulfilled' && driversRes.value.data.success) {
        setDrivers(driversRes.value.data.data as any || []);
      }
    } catch {
      toast.error('Failed to load operational configuration');
    } finally {
      setLoading(false);
    }
  };

  // Instant mobile lookup
  useEffect(() => {
    if (customerMobile.trim().length === 10) {
      lookupCustomer(customerMobile.trim());
    } else {
      setFoundCustomer(null);
      setCustomerId(null);
    }
  }, [customerMobile]);

  const lookupCustomer = async (mobile: string) => {
    setSearching(true);
    try {
      const res = await adminApi.searchCustomers(mobile);
      if (res.data.success && res.data.data && res.data.data.length > 0) {
        const c = res.data.data[0];
        setFoundCustomer(c);
        setCustomerId(c.id);
        setCustomerName(c.name);
      } else {
        setFoundCustomer(null);
        setCustomerId(null);
      }
    } catch {
      setFoundCustomer(null);
      setCustomerId(null);
    } finally {
      setSearching(false);
    }
  };

  const selectedService = services.find((s) => s.id === selectedServiceId);
  const isDrum = selectedService?.name === 'DRUM' || selectedService?.displayName.toLowerCase().includes('drum');
  const quantity = isDrum ? drumQuantity : 1;
  const unitPrice = selectedService?.price || 0;
  const estimatedTotal = unitPrice * quantity;

  const actualDate =
    deliveryDateOption === 'today'
      ? new Date().toISOString().split('T')[0]
      : deliveryDateOption === 'tomorrow'
      ? new Date(Date.now() + 86400000).toISOString().split('T')[0]
      : customDate;

  const handleSubmit = async () => {
    if (!customerMobile || customerMobile.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!selectedService) {
      toast.error('Please select a water type');
      return;
    }

    if (!customerAddress.trim() && !foundCustomer) {
      toast.error('Please provide a delivery address');
      return;
    }

    setSubmitting(true);
    try {
      let targetCustomerId = customerId;

      // If new customer, register immediately
      if (!targetCustomerId) {
        const createRes = await adminApi.quickCreateCustomer({
          name: customerName.trim() || `Customer (${customerMobile})`,
          mobile: customerMobile.trim(),
          address: customerAddress.trim() || 'Hindupur',
        });
        if (createRes.data.success && createRes.data.data) {
          targetCustomerId = createRes.data.data.id;
        } else {
          toast.error('Failed to create customer profile');
          return;
        }
      }

      // Create Phone Order
      const res = await adminApi.createPhoneOrder(targetCustomerId, {
        waterServiceId: selectedService.id,
        quantity,
        addressId: 0,
        deliveryDate: actualDate,
        timeSlot,
        instructions: instructions + (customerAddress ? ` | Address: ${customerAddress}` : ''),
        paymentMethod,
      });

      if (res.data.success) {
        const newOrder = res.data.data;
        if (selectedDriverId !== 'AUTO' && newOrder?.id) {
          try {
            await adminApi.assignDriver(newOrder.id, selectedDriverId);
          } catch {
            // Ignored, order still created
          }
        }
        toast.success(`Order ${newOrder.orderNumber} created successfully!`);
        navigate('/owner/orders');
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to place phone order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell breadcrumb="Operations / New Phone Order">
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto space-y-12 sm:space-y-16">
        {/* Header Module */}
        <div className="flex items-center justify-between pb-2">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <PhoneCall className="w-8 h-8 text-sky-600" />
              New Phone Order Terminal
            </h1>
            <p className="text-base text-slate-500 mt-2 leading-relaxed">
              Operator booking interface for incoming customer phone orders across Hindupur.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10">
          {/* Main 6-Step Workflow */}
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Customer */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-7 sm:p-8 space-y-5 shadow-sm">
              <div className="flex items-center gap-3 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <span className="w-6 h-6 rounded-full bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center text-xs font-extrabold shadow-xs">
                  1
                </span>
                Customer Details
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Phone Number (10 digits) *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      maxLength={10}
                      value={customerMobile}
                      onChange={(e) => setCustomerMobile(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 10-digit mobile number"
                      className="input-field text-sm"
                    />
                    {searching && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-sky-600 font-bold">
                        Searching...
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter caller name"
                    className="input-field text-sm"
                  />
                </div>
              </div>

              {foundCustomer && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>Existing Customer: <strong>{foundCustomer.name}</strong> ({foundCustomer.totalOrders} previous orders)</span>
                  </div>
                  {foundCustomer.outstandingAmount > 0 && (
                    <span className="text-amber-700 font-bold tabular-nums">
                      Khata Due: ₹{foundCustomer.outstandingAmount}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Water Selection */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-7 sm:p-8 space-y-5 shadow-xs">
              <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <span className="w-6 h-6 rounded-full bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center text-xs font-extrabold shadow-xs">
                  2
                </span>
                Water Delivery Capacity
              </div>

              <div className="grid grid-cols-3 gap-4 pt-1">
                {services.map((svc) => {
                  const isSelected = selectedServiceId === svc.id;
                  return (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() => setSelectedServiceId(svc.id)}
                      className={`p-6 sm:p-7 rounded-2xl flex flex-col items-center text-center justify-center border transition-all ${
                        isSelected
                          ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-100 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                        {svc.displayName}
                      </div>
                      <div className="text-2xl font-black text-slate-900 my-2 tabular-nums">
                        ₹{svc.price}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        {svc.name === 'FULL_TANK' ? '~10,000L' : svc.name === 'HALF_TANK' ? '~5,000L' : '100L each'}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Drums Quantity Selector */}
              {isDrum && (
                <div className="flex items-center justify-between p-4.5 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Number of Drums</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">100 Litres per drum (₹50 each)</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setDrumQuantity(Math.max(1, drumQuantity - 1))}
                      className="w-9 h-9 rounded-xl bg-white border border-slate-300 flex items-center justify-center text-slate-700 hover:border-sky-500 shadow-xs"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-base font-extrabold text-slate-900 w-8 text-center tabular-nums">
                      {drumQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDrumQuantity(drumQuantity + 1)}
                      className="w-9 h-9 rounded-xl bg-white border border-slate-300 flex items-center justify-center text-slate-700 hover:border-sky-500 shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Address */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-7 sm:p-8 space-y-5 shadow-xs">
              <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <span className="w-6 h-6 rounded-full bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center text-xs font-extrabold shadow-xs">
                  3
                </span>
                Delivery Address (Hindupur)
              </div>

              <div>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Street address, landmark, area in Hindupur"
                  className="input-field text-sm h-12 px-4"
                />
              </div>
            </div>

            {/* Step 4: Delivery Date & Slot */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-7 sm:p-8 space-y-5 shadow-xs">
              <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <span className="w-6 h-6 rounded-full bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center text-xs font-extrabold shadow-xs">
                  4
                </span>
                Delivery Schedule
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <button
                  type="button"
                  onClick={() => setDeliveryDateOption('today')}
                  className={`py-3 px-4 rounded-xl text-xs font-bold border text-center transition-colors ${
                    deliveryDateOption === 'today'
                      ? 'bg-sky-50 border-sky-500 text-sky-800 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  Today ({new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryDateOption('tomorrow')}
                  className={`py-3 px-4 rounded-xl text-xs font-bold border text-center transition-colors ${
                    deliveryDateOption === 'tomorrow'
                      ? 'bg-sky-50 border-sky-500 text-sky-800 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  Tomorrow
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3.5 pt-1">
                {(['MORNING', 'AFTERNOON', 'EVENING'] as const).map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTimeSlot(slot)}
                    className={`py-3 px-4 rounded-xl text-xs font-semibold border text-center capitalize transition-colors ${
                      timeSlot === slot
                        ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {slot.toLowerCase()}
                  </button>
                ))}
              </div>

              <div>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Special delivery instructions for driver"
                  className="input-field text-sm h-11 px-4"
                />
              </div>
            </div>

            {/* Step 5: Payment Mode */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-7 sm:p-8 space-y-5 shadow-xs">
              <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <span className="w-6 h-6 rounded-full bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center text-xs font-extrabold shadow-xs">
                  5
                </span>
                Payment Option
              </div>

              <div className="grid grid-cols-3 gap-3.5">
                {(['CASH', 'UPI', 'PENDING'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentMethod(mode)}
                    className={`py-3.5 px-4 rounded-xl text-xs font-bold border text-center transition-colors ${
                      paymentMethod === mode
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {mode === 'CASH' ? 'Cash on Delivery' : mode === 'UPI' ? 'UPI' : 'Add to Khata'}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 6: Driver Assignment */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-7 sm:p-8 space-y-5 shadow-xs">
              <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <span className="w-6 h-6 rounded-full bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center text-xs font-extrabold shadow-xs">
                  6
                </span>
                Assign Tanker / Driver
              </div>

              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value === 'AUTO' ? 'AUTO' : Number(e.target.value))}
                className="input-field text-sm h-12 px-4 bg-white"
              >
                <option value="AUTO">Auto / Assign Later from Operations Queue</option>
                <option value="999">Owner (Self-Delivery)</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} {d.status === 'AVAILABLE' ? '(Available)' : `(${d.status})`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right Column: Order Confirmation Summary Module */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-9 space-y-7 sticky top-24 shadow-sm">
              <h2 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                Order Summary
              </h2>

              <div className="space-y-4 text-sm text-slate-700 border-y border-slate-100 py-5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Caller:</span>
                  <span className="font-bold text-slate-900">{customerMobile || 'Not entered'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Water Service:</span>
                  <span className="font-bold text-sky-700">
                    {selectedService?.displayName || 'None'}
                    {isDrum ? ` × ${drumQuantity}` : ''}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Schedule:</span>
                  <span className="font-semibold text-slate-900 capitalize">
                    {deliveryDateOption} ({timeSlot.toLowerCase()})
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Payment:</span>
                  <span className="font-semibold text-slate-900">
                    {paymentMethod === 'CASH' ? 'Cash on Delivery' : paymentMethod === 'UPI' ? 'UPI' : 'Khata'}
                  </span>
                </div>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Total Due
                </span>
                <span className="text-3xl font-black text-slate-900 tabular-nums">
                  ₹{estimatedTotal}
                </span>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting || !customerMobile || !selectedService}
                className="btn-primary w-full h-13 text-sm font-bold mt-4 shadow-md shadow-sky-500/20"
              >
                {submitting ? 'Creating Order...' : 'CONFIRM & DISPATCH'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
