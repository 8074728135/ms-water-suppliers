import { useState, useEffect } from 'react';
import { serviceApi } from '../../api';
import api from '../../api/axios';
import type { WaterService } from '../../types';
import AppShell from '../../components/layout/AppShell';
import {
  Tag,
  Edit2,
  Check,
  AlertTriangle,
  X,
  Droplet,
  ShieldAlert,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function PricingManagement() {
  const [services, setServices] = useState<WaterService[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<WaterService | null>(null);
  const [newPrice, setNewPrice] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      const res = await serviceApi.getAll();
      if (res.data.success && res.data.data) {
        setServices(res.data.data);
      }
    } catch {
      toast.error('Failed to load pricing table');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (s: WaterService) => {
    setEditingService(s);
    setNewPrice(String(s.price));
  };

  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    const priceNum = parseFloat(newPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Please enter a valid price amount');
      return;
    }

    setSaving(true);
    try {
      const res = await api.put(`/api/services/${editingService.id}`, {
        price: priceNum,
        isActive: editingService.isActive,
      });
      if (res.data.success) {
        toast.success(`Price updated for ${editingService.displayName}`);
        setEditingService(null);
        loadServices();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update price');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell breadcrumb="Business / Pricing">
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto space-y-12 sm:space-y-16">
        {/* Header Module */}
        <div className="pb-2">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Water Pricing Configuration</h1>
          <p className="text-base text-slate-500 mt-2 leading-relaxed">
            Authoritative delivery rates for Hindupur. Applied to customer web orders, phone bookings, and driver settlement ledger.
          </p>
        </div>

        {/* Warning Alert Note Module */}
        <div className="bg-sky-50 border border-sky-200/90 rounded-2xl p-6 sm:p-7 flex items-start gap-4 shadow-xs">
          <div className="p-2.5 rounded-xl bg-sky-100 text-sky-700 shrink-0 mt-0.5">
            <Tag className="w-5 h-5" />
          </div>
          <div className="text-sm text-sky-900 leading-relaxed">
            <strong className="font-bold text-sky-950">Backend Authority Rule:</strong> Pricing changes apply immediately to all incoming orders. Active and fulfilled deliveries retain their historical billed rates to protect accounting records in Khata ledgers.
          </div>
        </div>

        {/* Pricing List / Table Module */}
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Standard Capacity</th>
                <th>Unit Price (INR)</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {services.map((svc) => (
                <tr key={svc.id}>
                  <td>
                    <div className="font-bold text-slate-900 text-sm">
                      {svc.displayName}
                    </div>
                    <div className="text-xs text-slate-500 font-normal mt-0.5">
                      {svc.description || 'Water delivery service'}
                    </div>
                  </td>
                  <td>
                    <span className="text-sm text-slate-700 font-medium">
                      {svc.name === 'FULL_TANK'
                        ? '~10,000 Litres (Full Tanker)'
                        : svc.name === 'HALF_TANK'
                        ? '~5,000 Litres (Half Tanker)'
                        : '100 Litres (Per Drum)'}
                    </span>
                  </td>
                  <td>
                    <span className="text-base font-black text-slate-900 tabular-nums">
                      ₹{svc.price}
                    </span>
                  </td>
                  <td>
                    <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => openEditModal(svc)}
                      className="btn-secondary text-xs h-10 px-4.5 font-bold"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-sky-600" />
                      <span>Edit Price</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Price Modal */}
      {editingService && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-9 max-w-md w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Update Service Price
              </h3>
              <button
                onClick={() => setEditingService(null)}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-4.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-amber-900">Price Modification Notice:</strong> Ensure you communicate rate revisions to regular phone customers before updating.
              </div>
            </div>

            <form onSubmit={handleSavePrice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Service Name
                </label>
                <input
                  type="text"
                  disabled
                  value={editingService.displayName}
                  className="input-field text-xs bg-slate-100 text-slate-600 font-medium h-11 px-3.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Price in Rupees (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="input-field text-xs pl-8 h-11 tabular-nums"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="btn-secondary text-xs h-11 px-5 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary text-xs h-11 px-6 font-bold shadow-xs"
                >
                  {saving ? 'Saving...' : 'Save Rate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
