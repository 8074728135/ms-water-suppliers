import { useState, useEffect } from 'react';
import { adminApi } from '../../api';
import api from '../../api/axios';
import AppShell from '../../components/layout/AppShell';
import {
  Users,
  Plus,
  Truck,
  Phone,
  CheckCircle2,
  AlertTriangle,
  X,
  KeyRound,
  Shield,
  Edit2,
  Trash2,
  Sparkles,
  Lock,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function DriverManagement() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Driver Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [license, setLicense] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('AP 04 XX 1024');
  const [password, setPassword] = useState('driver123');
  const [submitting, setSubmitting] = useState(false);

  // Password Reset Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<any | null>(null);
  const [newDriverPassword, setNewDriverPassword] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getDrivers();
      if (res.data.success && res.data.data) {
        setDrivers(res.data.data);
      }
    } catch {
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (driverId: number, status: string) => {
    try {
      const res = await api.put(`/api/admin/drivers/${driverId}/status`, { status });
      if (res.data.success) {
        toast.success(`Driver status updated to ${status}`);
        loadDrivers();
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to update status');
    }
  };

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) {
      toast.error('Name and Mobile number are required');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(mobile.trim())) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/api/admin/drivers', {
        name: name.trim(),
        mobile: mobile.trim(),
        licenseNumber: license.trim() || 'AP-DL-2024-001',
        password: password.trim() || 'driver123',
      });

      if (res.data.success) {
        toast.success(`Driver ${name} created with login mobile: ${mobile}`);
        setShowAddModal(false);
        setName('');
        setMobile('');
        setLicense('');
        setPassword('driver123');
        loadDrivers();
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to add driver');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetDriverPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriver) return;
    if (newDriverPassword.length < 4) {
      toast.error('Password must be at least 4 characters');
      return;
    }

    setResettingPassword(true);
    try {
      const res = await api.put(`/api/admin/drivers/${selectedDriver.id}/reset-password`, {
        password: newDriverPassword.trim(),
      });

      if (res.data.success) {
        toast.success(`Password for ${selectedDriver.name} updated successfully!`);
        setShowPasswordModal(false);
        setSelectedDriver(null);
        setNewDriverPassword('');
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to reset password');
    } finally {
      setResettingPassword(false);
    }
  };

  const availableCount = drivers.filter((d) => d.status === 'AVAILABLE').length;
  const busyCount = drivers.filter((d) => d.status === 'BUSY').length;
  const onLeaveCount = drivers.filter((d) => d.status === 'ON_LEAVE').length;

  return (
    <AppShell breadcrumb="Operations / Drivers">
      <Toaster position="top-right" />
      <div className="space-y-12 sm:space-y-16">
        {/* Header Module */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-2">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Drivers & Fleet Management</h1>
            <p className="text-base text-slate-500 mt-2 leading-relaxed">
              Create driver accounts, set driver login credentials, and monitor tanker availability across Hindupur.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary text-sm h-11 px-6 self-start sm:self-auto font-bold shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Driver Account</span>
          </button>
        </div>

        {/* Fleet KPI Metric Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-9 shadow-xs flex flex-col items-center text-center justify-center min-h-[190px]">
            <div className="text-xs text-slate-500 uppercase font-extrabold tracking-wider mb-2">
              Available for Dispatch
            </div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-600 my-1 tabular-nums flex items-center justify-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              {availableCount}
            </div>
            <div className="text-sm text-slate-500 mt-2 font-medium">
              Ready to take new water tanker deliveries
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-9 shadow-xs flex flex-col items-center text-center justify-center min-h-[190px]">
            <div className="text-xs text-slate-500 uppercase font-extrabold tracking-wider mb-2">
              Currently Delivering
            </div>
            <div className="text-3xl sm:text-4xl font-black text-sky-600 my-1 tabular-nums flex items-center justify-center gap-3">
              <span className="w-3 h-3 rounded-full bg-sky-500" />
              {busyCount}
            </div>
            <div className="text-sm text-slate-500 mt-2 font-medium">
              On the road with active customer loads
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-9 shadow-xs flex flex-col items-center text-center justify-center min-h-[190px]">
            <div className="text-xs text-slate-500 uppercase font-extrabold tracking-wider mb-2">
              On Leave / Inactive
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-700 my-1 tabular-nums flex items-center justify-center gap-3">
              <span className="w-3 h-3 rounded-full bg-slate-400" />
              {onLeaveCount}
            </div>
            <div className="text-sm text-slate-500 mt-2 font-medium">
              Owner can self-assign any priority order
            </div>
          </div>
        </div>

        {/* Drivers Table Module */}
        {loading ? (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-16 text-center text-slate-500 text-sm shadow-sm">
            Loading drivers roster...
          </div>
        ) : drivers.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-16 text-center space-y-3 shadow-sm">
            <div className="text-base font-bold text-slate-800">No drivers configured</div>
            <div className="text-sm text-slate-500">
              Register drivers to assign water deliveries to tankers.
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary text-xs h-10 px-5 font-bold mt-2"
            >
              Add First Driver
            </button>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>Driver Name</th>
                  <th>Username / Mobile</th>
                  <th>Tanker Vehicle</th>
                  <th>Deliveries</th>
                  <th>Status</th>
                  <th>Availability Toggle</th>
                  <th>Driver Credentials</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver) => {
                  const isAvailable = driver.status === 'AVAILABLE';
                  const isBusy = driver.status === 'BUSY';
                  const isLeave = driver.status === 'ON_LEAVE';

                  return (
                    <tr key={driver.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-xs font-bold text-sky-700">
                            {driver.name ? driver.name[0] : 'D'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-xs block">
                              {driver.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ID: #{driver.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-xs text-slate-700 tabular-nums font-mono font-bold">
                          {driver.mobile}
                        </div>
                        <span className="text-[10px] text-slate-400">Driver Login ID</span>
                      </td>
                      <td>
                        <div className="text-xs text-slate-700 font-mono font-semibold">
                          {driver.vehicleNumber || 'AP 04 XX 1024'}
                        </div>
                      </td>
                      <td>
                        <span className="text-xs font-bold text-slate-800 tabular-nums">
                          {driver.totalDeliveries || 0}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold border ${
                            isAvailable
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isBusy
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : isLeave
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isAvailable
                                ? 'bg-emerald-500 animate-pulse'
                                : isBusy
                                ? 'bg-sky-500'
                                : isLeave
                                ? 'bg-amber-500'
                                : 'bg-slate-400'
                            }`}
                          />
                          {isLeave ? 'ON LEAVE' : driver.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleUpdateStatus(driver.id, 'AVAILABLE')}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                              isAvailable
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            Available
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(driver.id, 'BUSY')}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                              isBusy
                                ? 'bg-sky-100 text-sky-800 border-sky-300'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            Busy
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(driver.id, 'ON_LEAVE')}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                              isLeave
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            Leave
                          </button>
                        </div>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDriver(driver);
                            setNewDriverPassword('');
                            setShowPasswordModal(true);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-sky-600 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-sky-600" />
                          <span>Reset Password</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Driver Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-9 max-w-md w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Add New Tanker Driver</h3>
                  <p className="text-xs text-slate-500">Owner sets driver login credentials</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDriver} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Driver Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter driver full name"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:border-sky-600 focus:ring-2 focus:ring-sky-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Mobile Number (Driver Login Username) *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:border-sky-600 focus:ring-2 focus:ring-sky-100 transition-all font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  The driver will use this 10-digit number to log into their driver portal.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Assigned Tanker / Vehicle Number
                </label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="Vehicle registration number (AP 04 XX 1234)"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:border-sky-600 focus:ring-2 focus:ring-sky-100 transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Driver Initial Password *
                </label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set login password for driver"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:border-sky-600 focus:ring-2 focus:ring-sky-100 transition-all font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Share this password with the driver for their first login.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary text-xs h-11 px-5 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-xs h-11 px-6 font-bold cursor-pointer"
                >
                  {submitting ? 'Creating Driver...' : 'Create Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Driver Password Modal */}
      {showPasswordModal && selectedDriver && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-9 max-w-md w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Set Driver Password</h3>
                  <p className="text-xs text-slate-500">
                    {selectedDriver.name} · ({selectedDriver.mobile})
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setSelectedDriver(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetDriverPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  New Password for {selectedDriver.name} *
                </label>
                <input
                  type="text"
                  required
                  value={newDriverPassword}
                  onChange={(e) => setNewDriverPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:border-sky-600 focus:ring-2 focus:ring-sky-100 transition-all font-mono"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setNewDriverPassword('driver' + Math.floor(100 + Math.random() * 900))}
                  className="text-xs text-sky-600 font-bold hover:underline"
                >
                  Generate Random Password
                </button>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setSelectedDriver(null);
                  }}
                  className="btn-secondary text-xs h-11 px-5 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resettingPassword}
                  className="btn-primary text-xs h-11 px-6 font-bold cursor-pointer"
                >
                  {resettingPassword ? 'Updating...' : 'Save New Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
