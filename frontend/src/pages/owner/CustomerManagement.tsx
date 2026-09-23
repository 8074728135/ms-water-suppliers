import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api';
import type { CustomerProfile } from '../../types';
import AppShell from '../../components/layout/AppShell';
import {
  Users,
  Search,
  Plus,
  Phone,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'KHATA'>('ALL');

  // Modal for adding a new customer
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, [searchQuery]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.searchCustomers(searchQuery);
      if (res.data.success && res.data.data) {
        setCustomers(res.data.data);
      }
    } catch {
      toast.error('Unable to load customer directory');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMobile || newMobile.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setCreating(true);
    try {
      const res = await adminApi.quickCreateCustomer({
        name: newName.trim() || `Customer (${newMobile})`,
        mobile: newMobile.trim(),
        address: newAddress.trim() || 'Hindupur',
      });
      if (res.data.success) {
        toast.success('Customer registered successfully');
        setIsAddModalOpen(false);
        setNewName('');
        setNewMobile('');
        setNewAddress('');
        loadCustomers();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add customer');
    } finally {
      setCreating(false);
    }
  };

  const totalOutstanding = customers.reduce(
    (acc, c) => acc + Number(c.outstandingAmount || 0),
    0
  );

  const customersWithDue = customers.filter(
    (c) => Number(c.outstandingAmount || 0) > 0
  );

  const displayedCustomers =
    activeTab === 'KHATA' ? customersWithDue : customers;

  return (
    <AppShell breadcrumb="Business / Customers & Khata">
      <Toaster position="top-right" />
      <div className="space-y-12 sm:space-y-16">
        {/* Header Module */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-2">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Customers & Khata Ledger
            </h1>
            <p className="text-base text-slate-500 mt-2 leading-relaxed">
              Customer directory, order delivery history, and Khata credit balances in Hindupur.
            </p>
          </div>

          <div className="flex items-center gap-3.5">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-secondary text-sm font-bold h-11 px-5"
            >
              <Plus className="w-4 h-4 text-sky-600" />
              <span>Add Customer</span>
            </button>
            <Link
              to="/owner/orders/create"
              className="btn-primary text-sm font-bold h-11 px-5"
            >
              <Phone className="w-4 h-4" />
              <span>New Phone Order</span>
            </Link>
          </div>
        </div>

        {/* Khata / Financial Metrics Summary Module with Centered Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-9 shadow-xs flex flex-col items-center text-center justify-center min-h-[190px]">
            <div className="text-xs text-slate-500 uppercase font-extrabold tracking-wider mb-2">
              Total Customers
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 my-1 tabular-nums">
              {customers.length}
            </div>
            <div className="text-sm text-slate-500 mt-2 font-medium">
              Registered Hindupur accounts
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-9 shadow-xs flex flex-col items-center text-center justify-center min-h-[190px]">
            <div className="text-xs text-slate-500 uppercase font-extrabold tracking-wider mb-2">
              Total Khata Outstanding
            </div>
            <div className="text-3xl sm:text-4xl font-black text-amber-600 my-1 tabular-nums">
              ₹{totalOutstanding.toLocaleString('en-IN')}
            </div>
            <div className="text-sm text-amber-700 mt-2 font-semibold">
              Credit pending across {customersWithDue.length} customers
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-9 shadow-xs flex flex-col items-center text-center justify-center min-h-[190px]">
            <div className="text-xs text-slate-500 uppercase font-extrabold tracking-wider mb-2">
              Accounts in Good Standing
            </div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-600 my-1 tabular-nums">
              {customers.length - customersWithDue.length}
            </div>
            <div className="text-sm text-emerald-700 mt-2 font-semibold">
              Zero outstanding balance
            </div>
          </div>
        </div>

        {/* Navigation Tabs & Search Toolbar Module */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-5">
          {/* Tabs */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${
                activeTab === 'ALL'
                  ? 'bg-sky-50 text-sky-800 border border-sky-200/90 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              All Directory ({customers.length})
            </button>
            <button
              onClick={() => setActiveTab('KHATA')}
              className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${
                activeTab === 'KHATA'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200/90 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Khata Due Only ({customersWithDue.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer or phone..."
              className="input-field pl-11 text-sm h-12"
            />
          </div>
        </div>

        {/* Customer Directory Table Module */}
        {loading ? (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-16 text-center text-slate-500 text-sm shadow-sm">
            Loading customer records...
          </div>
        ) : displayedCustomers.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-16 text-center space-y-3 shadow-sm">
            <div className="text-base font-bold text-slate-800">No customers found</div>
            <div className="text-sm text-slate-500">
              {activeTab === 'KHATA'
                ? 'Great news: No customers currently have outstanding balances!'
                : 'No customer matching this search query.'}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Phone Number</th>
                  <th>Completed Orders</th>
                  <th>Total Billed</th>
                  <th>Outstanding Khata</th>
                  <th>Member Since</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedCustomers.map((c) => {
                  const hasDue = Number(c.outstandingAmount || 0) > 0;
                  return (
                    <tr key={c.id}>
                      <td>
                        <div className="font-bold text-slate-900 text-sm">
                          {c.name}
                        </div>
                      </td>
                      <td>
                        <div className="text-sm text-slate-700 tabular-nums font-semibold">
                          {c.mobile}
                        </div>
                      </td>
                      <td>
                        <span className="text-sm text-slate-800 tabular-nums font-bold">
                          {c.totalOrders || 0}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-slate-900 tabular-nums font-extrabold">
                          ₹{Number(c.totalSpent || 0).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td>
                        {hasDue ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-lg tabular-nums">
                            ₹{Number(c.outstandingAmount).toLocaleString('en-IN')} Due
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-lg">
                            Clear
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="text-sm text-slate-500">
                          {c.memberSince
                            ? new Date(c.memberSince).toLocaleDateString('en-IN', {
                                month: 'short',
                                year: 'numeric',
                              })
                            : '2026'}
                        </span>
                      </td>
                      <td className="text-right">
                        <Link
                          to="/owner/orders/create"
                          className="btn-secondary text-xs h-10 px-4.5 font-bold"
                        >
                          Book Order
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Customer Modal with Generous 4-Sided Padding */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-9 max-w-md w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Register New Customer
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Ramesh Reddy"
                  className="input-field text-sm h-11 px-3.5"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Mobile Number (10 digits) *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={newMobile}
                  onChange={(e) => setNewMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 9876543210"
                  className="input-field text-sm h-11 px-3.5"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Primary Delivery Address
                </label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Street / Area in Hindupur"
                  className="input-field text-sm h-11 px-3.5"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-secondary text-xs h-11 px-5 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary text-xs h-11 px-6 font-bold"
                >
                  {creating ? 'Saving...' : 'Register Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
