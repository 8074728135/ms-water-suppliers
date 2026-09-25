import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { customerApi } from '../../api';
import CustomerLayout from '../../components/layout/CustomerLayout';
import EditPhoneModal from '../../components/customer/EditPhoneModal';
import toast, { Toaster } from 'react-hot-toast';
import {
  User,
  Phone,
  Mail,
  ShieldCheck,
  Calendar,
  Package,
  CreditCard,
  Edit2,
  CheckCircle2,
  Sparkles,
  MapPin,
  Clock,
} from 'lucide-react';
import type { CustomerProfile as CustomerProfileType } from '../../types';

export default function CustomerProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CustomerProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await customerApi.getProfile();
      if (res.data.success) {
        setProfile(res.data.data);
      }
    } catch {
      toast.error('Unable to load customer profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomerLayout>
      <Toaster position="top-center" />
      <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Customer Account & Phone Details
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage your delivery contact phone number and residential profile in Hindupur.
            </p>
          </div>

          <button
            onClick={() => setShowEditModal(true)}
            className="btn-primary text-xs h-10 px-5 self-start sm:self-auto font-bold shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Update Phone & Profile</span>
          </button>
        </div>

        {/* Contact Phone Number Hero Card */}
        <div className="bg-gradient-to-tr from-sky-600 to-blue-700 rounded-3xl p-7 sm:p-9 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-sky-100 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                Active Delivery Contact
              </span>
              <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white flex items-center gap-3">
                <Phone className="w-8 h-8 text-sky-200" />
                <span>+91 {profile?.mobile || user?.mobile || 'Not Configured'}</span>
              </div>
              <p className="text-xs sm:text-sm text-sky-100 max-w-lg leading-relaxed pt-1">
                This phone number is called by Hindupur water tanker drivers when arriving near your gate or sump location.
              </p>
            </div>

            <button
              onClick={() => setShowEditModal(true)}
              className="px-5 py-3 rounded-xl bg-white text-sky-900 hover:bg-sky-50 font-bold text-xs shadow-md shrink-0 self-start sm:self-auto transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              Change Phone Number
            </button>
          </div>
        </div>

        {/* Profile Information Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Resident Details */}
          <div className="bg-white rounded-3xl p-7 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Personal Information</h2>
                  <p className="text-xs text-slate-500">Account identity</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(true)}
                className="text-xs font-bold text-sky-600 hover:underline"
              >
                Edit
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 font-medium block uppercase text-[10px] tracking-wider">
                  Full Name
                </span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                  {profile?.name || user?.name || 'Customer'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-medium block uppercase text-[10px] tracking-wider">
                  Registered Mobile / Username
                </span>
                <span className="text-sm font-mono font-bold text-slate-900 mt-0.5 block">
                  {profile?.mobile || user?.mobile}
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-medium block uppercase text-[10px] tracking-wider">
                  Email Address
                </span>
                <span className="text-sm font-medium text-slate-700 mt-0.5 block">
                  {profile?.email || 'Not provided (Optional for digital receipts)'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-medium block uppercase text-[10px] tracking-wider">
                  Service Area
                </span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-600" />
                  Hindupur Municipality, Andhra Pradesh
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Water Supply Summary */}
          <div className="bg-white rounded-3xl p-7 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Delivery Account Stats</h2>
                <p className="text-xs text-slate-500">Water booking history</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-medium block">Total Water Orders</span>
                <span className="text-2xl font-black text-slate-900 tabular-nums block">
                  {profile?.totalOrders || 0}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold">● Active Resident</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-medium block">Total Spent</span>
                <span className="text-2xl font-black text-slate-900 tabular-nums block">
                  ₹{profile?.totalSpent || '0.00'}
                </span>
                <span className="text-[10px] text-slate-400">Cash / UPI verified</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200 text-xs text-slate-700 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-sky-600 shrink-0" />
              <span>
                You are enrolled in priority doorstep water dispatch in Hindupur.
              </span>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        <EditPhoneModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => loadProfile()}
        />
      </div>
    </CustomerLayout>
  );
}
