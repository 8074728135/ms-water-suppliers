import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth.api';
import toast from 'react-hot-toast';
import { Droplets, Phone, Lock, Sparkles, Shield, Truck, User, ArrowRight, HelpCircle } from 'lucide-react';

export default function Login() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemoHelp, setShowDemoHelp] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleFillDemo = (role: 'CUSTOMER' | 'DRIVER' | 'OWNER') => {
    if (role === 'CUSTOMER') {
      setMobile('9876543210');
      setPassword('password123');
      toast.success('Customer demo credentials filled');
    } else if (role === 'DRIVER') {
      setMobile('8888888888');
      setPassword('driver123');
      toast.success('Driver demo credentials filled');
    } else {
      setMobile('9999999999');
      setPassword('admin123');
      toast.success('Owner demo credentials filled');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile || !password) {
      toast.error('Please enter mobile number and password');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.login({ mobile, password });
      if (response.data.success) {
        login(response.data.data);
        toast.success(`Welcome back, ${response.data.data.name}! 💧`);

        const role = response.data.data.role;
        if (role === 'OWNER') navigate('/owner');
        else if (role === 'DRIVER') navigate('/driver');
        else navigate('/customer');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Login failed. Please check credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/60 via-slate-50 to-slate-100 text-slate-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Soft Decorative Ambient Background */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-sky-200/30 blur-3xl -top-24 -right-24 pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-blue-200/20 blur-3xl -bottom-24 -left-24 pointer-events-none" />

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
                Hindupur Express Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Clean Light Login Card */}
        <div className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-200 shadow-xl space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign In to Your Account</h2>
            <p className="text-xs sm:text-sm text-slate-500">Enter your registered mobile number and password</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sky-600">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="login-mobile"
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                  maxLength={10}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:border-sky-600 focus:ring-2 focus:ring-sky-100 transition-all font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sky-600">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:border-sky-600 focus:ring-2 focus:ring-sky-100 transition-all"
                  required
                />
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl btn-primary text-sm font-bold shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing In...
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

          {/* Quick Demo Helper (Collapsible) */}
          <div className="pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowDemoHelp(!showDemoHelp)}
              className="text-xs font-semibold text-slate-500 hover:text-sky-600 flex items-center justify-center gap-1.5 w-full text-center py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showDemoHelp ? 'Hide Demo Accounts' : 'Need demo account quick fill?'}</span>
            </button>

            {showDemoHelp && (
              <div className="grid grid-cols-3 gap-2.5 mt-3 p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 animate-fade-in">
                <button
                  type="button"
                  onClick={() => handleFillDemo('CUSTOMER')}
                  className="py-3 px-3 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:border-sky-400 hover:text-sky-600 shadow-xs transition-all flex flex-col items-center gap-1.5"
                >
                  <User className="w-4 h-4 text-sky-600" />
                  <span>Customer</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFillDemo('DRIVER')}
                  className="py-3 px-3 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:border-amber-400 hover:text-amber-700 shadow-xs transition-all flex flex-col items-center gap-1.5"
                >
                  <Truck className="w-4 h-4 text-amber-600" />
                  <span>Driver</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFillDemo('OWNER')}
                  className="py-3 px-3 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:border-purple-400 hover:text-purple-700 shadow-xs transition-all flex flex-col items-center gap-1.5"
                >
                  <Shield className="w-4 h-4 text-purple-600" />
                  <span>Owner</span>
                </button>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-500 flex items-center justify-between">
            <span>Don't have an account?</span>
            <Link to="/register" className="font-bold text-sky-600 hover:text-sky-700 transition-colors">
              Create Account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
