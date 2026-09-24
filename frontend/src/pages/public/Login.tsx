import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth.api';
import toast, { Toaster } from 'react-hot-toast';
import {
  Droplets,
  Lock,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  X,
  UserCheck,
} from 'lucide-react';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = identifier.trim();
    if (!cleanId || !password) {
      toast.error('Please enter your mobile number / email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.login({ mobile: cleanId, password });
      if (response.data.success) {
        login(response.data.data);
        toast.success(`Welcome back, ${response.data.data.name}! 💧`);

        const role = response.data.data.role;
        if (role === 'OWNER') navigate('/owner');
        else if (role === 'DRIVER') navigate('/driver');
        else navigate('/customer');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Invalid credentials. Please verify and try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = forgotIdentifier.trim();
    if (!cleanId) {
      toast.error('Please enter your registered mobile or email');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await authApi.forgotPassword({ identifier: cleanId });
      if (res.data.success) {
        const code = res.data.data?.verificationCode || '123456';
        setSimulatedOtp(code);
        setForgotStep(2);
        toast.success(`Verification OTP generated: ${code}`, { duration: 6000 });
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Account not found. Please verify your mobile or email.';
      toast.error(msg);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotOtp.trim()) {
      toast.error('Please enter the 6-digit verification OTP');
      return;
    }
    if (newPassword.length < 4) {
      toast.error('Password must be at least 4 characters');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await authApi.resetPassword({
        identifier: forgotIdentifier.trim(),
        otp: forgotOtp.trim(),
        newPassword: newPassword.trim(),
      });

      if (res.data.success) {
        toast.success('Password reset successfully! Please sign in now.');
        setIdentifier(forgotIdentifier.trim());
        setShowForgotModal(false);
        setForgotStep(1);
        setForgotIdentifier('');
        setForgotOtp('');
        setNewPassword('');
        setConfirmNewPassword('');
        setSimulatedOtp(null);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Invalid OTP code. Please try again.';
      toast.error(msg);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/70 via-slate-50 to-slate-100 text-slate-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <Toaster position="top-center" />

      {/* Ambient Radial Highlights */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-sky-200/35 blur-3xl -top-28 -right-28 pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-blue-200/25 blur-3xl -bottom-28 -left-28 pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fade-in my-auto">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/25 group-hover:scale-105 transition-transform">
              <Droplets className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-black text-slate-900 tracking-wider">
                MS WATER <span className="text-sky-600">SUPPLIERS</span>
              </h1>
              <span className="text-[11px] text-slate-500 font-bold tracking-widest block uppercase">
                Hindupur Official Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-200 shadow-xl space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign In to Your Account</h2>
            <p className="text-xs sm:text-sm text-slate-500">Access Customer, Driver, or Owner management</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Identifier input: Mobile or Email */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Mobile Number or Email
                </label>
              </div>
              <div className="relative">
                <input
                  id="login-identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. 9876543210 or gowrish2006m@gmail.com"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:border-sky-600 focus:ring-2 focus:ring-sky-100 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotIdentifier(identifier);
                    setShowForgotModal(true);
                  }}
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative flex items-center">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter account password"
                  className="w-full pl-4 pr-11 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:border-sky-600 focus:ring-2 focus:ring-sky-100 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl btn-primary text-sm font-bold shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Security & Access Info */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              Secure Encrypted Portal
            </span>
            <div className="text-right">
              <span>New Customer? </span>
              <Link to="/register" className="font-bold text-sky-600 hover:text-sky-700 transition-colors">
                Register →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal (Universal for Customer, Owner & Driver) */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-7 sm:p-9 max-w-md w-full border border-slate-200 shadow-2xl space-y-6 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Reset Password</h3>
                  <p className="text-xs text-slate-500">Customer · Driver · Owner recovery</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotStep(1);
                  setSimulatedOtp(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotStep === 1 ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Registered Mobile or Email
                  </label>
                  <input
                    type="text"
                    required
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    placeholder="e.g. 9876543210 or gowrish2006m@gmail.com"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:border-sky-600 focus:ring-2 focus:ring-sky-100 transition-all"
                  />
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    A 6-digit verification code will be sent to verify your identity.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="btn-secondary text-xs h-11 px-5 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="btn-primary text-xs h-11 px-6 font-bold"
                  >
                    {forgotLoading ? 'Verifying...' : 'Send Verification Code'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {simulatedOtp && (
                  <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-sky-900 block">Verification OTP Code</span>
                      <span className="font-mono text-base font-black text-sky-700">{simulatedOtp}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForgotOtp(simulatedOtp)}
                      className="px-3 py-1.5 bg-white border border-sky-300 text-sky-700 rounded-lg font-bold hover:bg-sky-100 text-xs shadow-xs transition-colors"
                    >
                      Auto-fill Code
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Enter 6-Digit OTP *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:border-sky-600 focus:ring-2 focus:ring-sky-100 transition-all font-mono tracking-widest text-center text-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    New Password *
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 4 characters"
                      className="w-full pl-4 pr-11 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:border-sky-600 focus:ring-2 focus:ring-sky-100 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:border-sky-600 focus:ring-2 focus:ring-sky-100 transition-all"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="btn-primary text-xs h-11 px-6 font-bold"
                  >
                    {forgotLoading ? 'Updating...' : 'Set New Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
