import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { serviceApi, customerApi, orderApi } from '../../api';
import type { WaterService, Address } from '../../types';
import CustomerLayout from '../../components/layout/CustomerLayout';
import EditPhoneModal from '../../components/customer/EditPhoneModal';
import {
  MapPin,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Phone,
  Edit2,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function OrderWater() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [services, setServices] = useState<WaterService[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Water selection
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [drumQuantity, setDrumQuantity] = useState(1);

  // Step 2: Address
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newLabel, setNewLabel] = useState('Home');
  const [newAddressLine, setNewAddressLine] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);

  // Step 3: Schedule & Payment
  const [deliveryDateOption, setDeliveryDateOption] = useState<'today' | 'tomorrow'>('today');
  const [timeSlot, setTimeSlot] = useState('MORNING');
  const [instructions, setInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI'>('CASH');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [srvRes, addrRes] = await Promise.allSettled([
        serviceApi.getAll(),
        customerApi.getAddresses(),
      ]);

      if (srvRes.status === 'fulfilled' && srvRes.value.data.success) {
        const s = srvRes.value.data.data || [];
        setServices(s);
        const full = s.find((item) => item.name === 'FULL_TANK') || s[0];
        if (full) setSelectedServiceId(full.id);
      }

      if (addrRes.status === 'fulfilled' && addrRes.value.data.success) {
        const addrs = addrRes.value.data.data || [];
        setAddresses(addrs);
        const def = addrs.find((a) => a.isDefault) || addrs[0];
        if (def) setSelectedAddressId(def.id);
      }
    } catch {
      toast.error('Failed to load order configuration');
    } finally {
      setLoading(false);
    }
  };

  const selectedService = services.find((s) => s.id === selectedServiceId);
  const isDrum = selectedService?.name === 'DRUM' || selectedService?.displayName.toLowerCase().includes('drum');
  const quantity = isDrum ? drumQuantity : 1;
  const unitPrice = selectedService?.price || 0;
  const totalAmount = unitPrice * quantity;

  const actualDate =
    deliveryDateOption === 'today'
      ? new Date().toISOString().split('T')[0]
      : new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressLine.trim()) {
      toast.error('Please enter the street address');
      return;
    }

    setSavingAddress(true);
    try {
      const res = await customerApi.addAddress({
        label: newLabel,
        addressLine1: newAddressLine.trim(),
        city: 'Hindupur',
        isDefault: addresses.length === 0,
      });
      if (res.data.success) {
        const added = res.data.data;
        setAddresses([...addresses, added]);
        setSelectedAddressId(added.id);
        setShowNewAddress(false);
        setNewAddressLine('');
        toast.success('Address saved successfully');
      }
    } catch {
      toast.error('Failed to save address');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!selectedService || !selectedAddressId) {
      toast.error('Please complete all order steps');
      return;
    }

    setSubmitting(true);
    try {
      const res = await orderApi.create({
        waterServiceId: selectedService.id,
        quantity,
        addressId: selectedAddressId,
        deliveryDate: actualDate,
        timeSlot,
        instructions: instructions || undefined,
        paymentMethod,
        idempotencyKey: crypto.randomUUID?.() || Date.now().toString(),
      });

      if (res.data.success) {
        toast.success('Water order confirmed! Tanker scheduled.');
        navigate('/customer');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CustomerLayout>
      <Toaster position="top-center" />
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Book Water Delivery</h1>
          <p className="text-sm text-slate-600 mt-1">
            Doorstep water tanker or drum supply across Hindupur.
          </p>
        </div>

        {/* Visible Progress Indicator */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 flex items-center justify-between shadow-xs">
          <div
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 text-xs font-bold cursor-pointer transition-colors ${
              step >= 1 ? 'text-sky-700' : 'text-slate-400'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step >= 1 ? 'bg-sky-50 text-sky-700 border border-sky-200 font-extrabold' : 'bg-slate-100 text-slate-400'
              }`}
            >
              1
            </span>
            <span>1. Capacity</span>
          </div>

          <span className="text-slate-300">→</span>

          <div
            onClick={() => {
              if (selectedService) setStep(2);
            }}
            className={`flex items-center gap-2 text-xs font-bold cursor-pointer transition-colors ${
              step >= 2 ? 'text-sky-700' : 'text-slate-400'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step >= 2 ? 'bg-sky-50 text-sky-700 border border-sky-200 font-extrabold' : 'bg-slate-100 text-slate-400'
              }`}
            >
              2
            </span>
            <span>2. Address</span>
          </div>

          <span className="text-slate-300">→</span>

          <div
            onClick={() => {
              if (selectedService && selectedAddressId) setStep(3);
            }}
            className={`flex items-center gap-2 text-xs font-bold cursor-pointer transition-colors ${
              step === 3 ? 'text-sky-700' : 'text-slate-400'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step === 3 ? 'bg-sky-50 text-sky-700 border border-sky-200 font-extrabold' : 'bg-slate-100 text-slate-400'
              }`}
            >
              3
            </span>
            <span>3. Confirm</span>
          </div>
        </div>

        {/* Step 1: Choose Water */}
        {step === 1 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-9 space-y-7 shadow-xs animate-in fade-in">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Step 1: Choose Water Capacity
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Select between full tanker, half tanker, or individual 100-litre drums.
              </p>
            </div>

            <div className="space-y-3.5">
              {services.map((svc) => {
                const isSelected = selectedServiceId === svc.id;
                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => setSelectedServiceId(svc.id)}
                    className={`w-full p-5 sm:p-6 rounded-2xl text-left border flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-100 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {svc.displayName}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {svc.name === 'FULL_TANK'
                          ? 'Standard Tanker (~10,000 Litres) for houses and sumps'
                          : svc.name === 'HALF_TANK'
                          ? 'Half Tanker (~5,000 Litres)'
                          : '100 Litres per Drum'}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xl font-black text-slate-900 tabular-nums">
                        ₹{svc.price}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {svc.name === 'DRUM' ? 'per drum' : 'per trip'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Drum counter */}
            {isDrum && (
              <div className="flex items-center justify-between p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-xs font-bold text-slate-900">Number of Drums</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">100L each · ₹50 per drum</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setDrumQuantity(Math.max(1, drumQuantity - 1))}
                    className="w-9 h-9 rounded-lg bg-white border border-slate-300 flex items-center justify-center text-slate-700 hover:border-sky-500 shadow-xs"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-base font-extrabold text-slate-900 w-8 text-center tabular-nums">
                    {drumQuantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDrumQuantity(drumQuantity + 1)}
                    className="w-9 h-9 rounded-lg bg-white border border-slate-300 flex items-center justify-center text-slate-700 hover:border-sky-500 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="text-xs text-slate-500">
                Total Estimate: <strong className="text-slate-900 font-extrabold text-base tabular-nums">₹{totalAmount}</strong>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-primary text-xs h-11 px-6 font-bold shadow-xs"
              >
                <span>Continue to Address</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Choose Address */}
        {step === 2 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-9 space-y-7 shadow-xs animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Step 2: Choose Delivery Address
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Select your home or commercial address in Hindupur.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewAddress(!showNewAddress)}
                className="btn-secondary text-xs h-10 px-4 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Address</span>
              </button>
            </div>

            {/* New address inline form */}
            {showNewAddress && (
              <form onSubmit={handleSaveNewAddress} className="p-5 sm:p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <div className="text-xs font-bold text-slate-900">
                  New Delivery Location
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Label</label>
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="Address label (Home, Shop, Construction)"
                    className="input-field text-xs h-9"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address *</label>
                  <input
                    type="text"
                    required
                    value={newAddressLine}
                    onChange={(e) => setNewAddressLine(e.target.value)}
                    placeholder="House no., street, landmark in Hindupur"
                    className="input-field text-xs h-9"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowNewAddress(false)}
                    className="btn-secondary text-xs h-8 px-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingAddress}
                    className="btn-primary text-xs h-8 px-4 font-bold"
                  >
                    {savingAddress ? 'Saving...' : 'Save & Select'}
                  </button>
                </div>
              </form>
            )}

            {/* Address list */}
            {addresses.length === 0 && !showNewAddress ? (
              <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-300 rounded-xl space-y-2">
                <p>No addresses saved yet.</p>
                <button
                  type="button"
                  onClick={() => setShowNewAddress(true)}
                  className="btn-primary text-xs h-9 px-4 font-bold"
                >
                  Add First Address
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`w-full p-5 sm:p-6 rounded-2xl text-left border flex items-start gap-3 transition-all ${
                        isSelected
                          ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-100 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <MapPin className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-sky-600' : 'text-slate-400'}`} />
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {addr.label}
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          {addr.addressLine1} {addr.landmark ? `(${addr.landmark})` : ''}, Hindupur
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-secondary text-xs h-11 px-5 font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                disabled={!selectedAddressId}
                onClick={() => setStep(3)}
                className="btn-primary text-xs h-11 px-6 font-bold shadow-xs"
              >
                <span>Continue to Confirm</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Schedule, Payment & Confirm */}
        {step === 3 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-9 space-y-7 shadow-xs animate-in fade-in">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Step 3: Confirm Water Delivery
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Review your delivery slot and preferred payment method.
              </p>
            </div>

            {/* Summary Review */}
            <div className="p-5 sm:p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Water Package:</span>
                <span className="font-bold text-slate-900">
                  {selectedService?.displayName} {isDrum ? `× ${drumQuantity}` : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Destination:</span>
                <span className="text-slate-800 font-semibold text-right max-w-xs truncate">
                  {addresses.find((a) => a.id === selectedAddressId)?.addressLine1}, Hindupur
                </span>
              </div>
            </div>

            {/* Schedule Slot */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Delivery Schedule
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setDeliveryDateOption('today')}
                  className={`py-3 px-3 rounded-xl text-xs font-bold border transition-colors ${
                    deliveryDateOption === 'today'
                      ? 'bg-sky-50 border-sky-500 text-sky-800'
                      : 'bg-white border-slate-300 text-slate-600'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryDateOption('tomorrow')}
                  className={`py-3 px-3 rounded-xl text-xs font-bold border transition-colors ${
                    deliveryDateOption === 'tomorrow'
                      ? 'bg-sky-50 border-sky-500 text-sky-800'
                      : 'bg-white border-slate-300 text-slate-600'
                  }`}
                >
                  Tomorrow
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2.5 pt-1">
                {(['MORNING', 'AFTERNOON', 'EVENING'] as const).map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTimeSlot(slot)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border capitalize transition-colors ${
                      timeSlot === slot
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    {slot.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Payment Option
              </label>
              <div className="grid grid-cols-2 gap-3.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`p-4.5 sm:p-5 rounded-2xl text-left border transition-colors ${
                    paymentMethod === 'CASH'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="text-xs font-bold">Cash on Delivery</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Pay cash upon tanker arrival</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-4.5 sm:p-5 rounded-2xl text-left border transition-colors ${
                    paymentMethod === 'UPI'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="text-xs font-bold">UPI / QR Code</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Scan driver QR on delivery</div>
                </button>
              </div>
            </div>

            {/* Delivery Contact Phone Number */}
            <div className="p-4.5 bg-sky-50/80 border border-sky-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white text-sky-600 flex items-center justify-center shadow-xs shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">
                    Driver Delivery Contact Phone
                  </span>
                  <span className="font-mono text-xs font-bold text-sky-800">
                    +91 {user?.mobile || 'Not set'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPhoneModal(true)}
                className="text-xs font-bold text-sky-700 hover:text-sky-900 underline flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>{user?.mobile ? 'Change Number' : 'Add Number'}</span>
              </button>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Notes / Sump Instructions (Optional)
              </label>
              <input
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Underground sump location or driver delivery notes"
                className="input-field text-xs h-11 px-3.5"
              />
            </div>

            {/* Final Total Amount */}
            <div className="flex items-baseline justify-between p-5 sm:p-6 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Payable Amount
              </span>
              <span className="text-3xl font-black text-slate-900 tabular-nums">
                ₹{totalAmount}
              </span>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-secondary text-xs h-11 px-5 font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmOrder}
                className="btn-primary text-xs h-11 px-7 font-bold shadow-md shadow-sky-500/20"
              >
                {submitting ? 'Confirming Order...' : 'CONFIRM WATER ORDER'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Edit Phone Modal */}
      <EditPhoneModal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
      />
    </CustomerLayout>
  );
}
