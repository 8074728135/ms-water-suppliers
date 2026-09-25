import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { customerApi } from '../../api';
import toast from 'react-hot-toast';
import { Phone, User, Mail, X, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface EditPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newMobile: string) => void;
}

export default function EditPhoneModal({ isOpen, onClose, onSuccess }: EditPhoneModalProps) {
  const { user, updateUser } = useAuth();
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMobile = mobile.trim().replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const res = await customerApi.updateProfile({
        name: name.trim(),
        mobile: cleanMobile,
        email: email.trim() || undefined,
        password: password.trim() || undefined,
      });

      if (res.data.success) {
        updateUser({
          name: name.trim(),
          mobile: cleanMobile,
        });
        toast.success('Customer phone number & credentials updated successfully! 💧');
        onSuccess?.(cleanMobile);
        onClose();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update phone number. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-9 max-w-md w-full space-y-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Customer Credentials & Phone</h3>
              <p className="text-xs text-slate-500">Delivery contact number and account credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Primary Phone Number (10 Digits) *
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 10-digit mobile number"
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:border-sky-600 focus:ring-2 focus:ring-sky-100 transition-all font-mono font-bold"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Used for delivery coordination, driver call alerts, and portal sign-in.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Customer Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:border-sky-600 focus:ring-2 focus:ring-sky-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Update Password (Leave blank to keep unchanged)
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password (optional)"
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:border-sky-600 focus:ring-2 focus:ring-sky-100 transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address (Optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Optional email for invoices"
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:border-sky-600 focus:ring-2 focus:ring-sky-100 transition-all"
            />
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Your phone number is kept private and only shared with the assigned tanker driver during active delivery hours in Hindupur.
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs h-11 px-5 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-xs h-11 px-6 font-bold cursor-pointer"
            >
              {loading ? 'Saving Number...' : 'Save Phone Number'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
