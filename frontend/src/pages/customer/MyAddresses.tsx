import { useState, useEffect } from 'react';
import { customerApi } from '../../api';
import type { Address, AddressRequest } from '../../types';
import CustomerLayout from '../../components/layout/CustomerLayout';
import {
  MapPin,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function MyAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<AddressRequest>({
    label: 'Home',
    addressLine1: '',
    landmark: '',
    city: 'Hindupur',
    pincode: '515201',
    isDefault: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const res = await customerApi.getAddresses();
      if (res.data.success) {
        setAddresses(res.data.data || []);
      }
    } catch {
      toast.error('Unable to load saved addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.addressLine1.trim()) {
      toast.error('Address is required');
      return;
    }

    setSaving(true);
    try {
      const res = await customerApi.addAddress(form);
      if (res.data.success) {
        toast.success('Delivery address saved');
        setShowModal(false);
        setForm({
          label: 'Home',
          addressLine1: '',
          landmark: '',
          city: 'Hindupur',
          pincode: '515201',
          isDefault: false,
        });
        loadAddresses();
      }
    } catch {
      toast.error('Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this delivery address?')) return;
    try {
      await customerApi.deleteAddress(id);
      toast.success('Address removed');
      loadAddresses();
    } catch {
      toast.error('Failed to delete address');
    }
  };

  return (
    <CustomerLayout>
      <Toaster position="top-center" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Saved Delivery Addresses</h1>
            <p className="text-sm text-slate-600 mt-1">
              Locations where water tankers and drums can be delivered in Hindupur.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="btn-primary text-xs h-10 px-4 self-start sm:self-auto font-bold shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Address</span>
          </button>
        </div>

        {/* Addresses Grid */}
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs">
            Loading saved addresses...
          </div>
        ) : addresses.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
            <div className="text-base font-bold text-slate-900">No addresses saved</div>
            <p className="text-xs text-slate-500">
              Save your house or site address for faster 1-click water orders.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary text-xs h-9 px-4 inline-flex mt-2 font-bold"
            >
              Add First Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-4 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-sky-600" />
                      {addr.label}
                    </span>
                    {addr.isDefault && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {addr.addressLine1}
                    {addr.landmark ? ` (Landmark: ${addr.landmark})` : ''}
                  </div>
                  <div className="text-xs text-slate-500">
                    Hindupur, Andhra Pradesh - 515201
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Address Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-9 max-w-md w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Add Delivery Address
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Location Label
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Home', 'Shop / Office', 'Site'].map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setForm({ ...form, label: l })}
                      className={`py-3 px-3 rounded-xl text-xs font-bold border text-center transition-colors ${
                        form.label === l
                          ? 'bg-sky-50 border-sky-500 text-sky-800'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Address Line (House / Street) *
                </label>
                <input
                  type="text"
                  required
                  value={form.addressLine1}
                  onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
                  placeholder="Door number, street name, locality in Hindupur"
                  className="input-field text-xs h-11 px-3.5"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Landmark
                </label>
                <input
                  type="text"
                  value={form.landmark}
                  onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                  placeholder="Nearby landmark (temple, school, junction, etc.)"
                  className="input-field text-xs h-11 px-3.5"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary text-xs h-11 px-5 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary text-xs h-11 px-6 font-bold shadow-xs"
                >
                  {saving ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
}
