import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Public pages
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// Customer pages
import CustomerHome from './pages/customer/CustomerHome';
import OrderWater from './pages/customer/OrderWater';
import MyOrders from './pages/customer/MyOrders';
import MyAddresses from './pages/customer/MyAddresses';

// Owner pages
import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerOrders from './pages/owner/OwnerOrders';
import CreatePhoneOrder from './pages/owner/CreatePhoneOrder';
import DispatchBoard from './pages/owner/DispatchBoard';
import CustomerManagement from './pages/owner/CustomerManagement';
import DriverManagement from './pages/owner/DriverManagement';
import PricingManagement from './pages/owner/PricingManagement';
import Expenses from './pages/owner/Expenses';
import Analytics from './pages/owner/Analytics';

// Driver pages
import DriverDashboard from './pages/driver/DriverDashboard';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 rounded-full border-3 border-sky-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    if (user.role === 'CUSTOMER') return <Navigate to="/customer" replace />;
    if (user.role === 'OWNER') return <Navigate to="/owner" replace />;
    if (user.role === 'DRIVER') return <Navigate to="/driver" replace />;
  }

  return <>{children}</>;
}

function RedirectToDashboard() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'CUSTOMER') return <Navigate to="/customer" replace />;
  if (user.role === 'OWNER') return <Navigate to="/owner" replace />;
  if (user.role === 'DRIVER') return <Navigate to="/driver" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/water-packages" element={<Landing />} />
      <Route path="/coverage-areas" element={<Landing />} />
      <Route path="/price-estimator" element={<Landing />} />
      <Route path="/quality" element={<Landing />} />
      <Route path="/faqs" element={<Landing />} />
      <Route path="/contact" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Authenticated redirect */}
      <Route path="/dashboard" element={<RedirectToDashboard />} />

      {/* Customer Routes */}
      <Route path="/customer" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CustomerHome /></ProtectedRoute>} />
      <Route path="/customer/order" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><OrderWater /></ProtectedRoute>} />
      <Route path="/customer/orders" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><MyOrders /></ProtectedRoute>} />
      <Route path="/customer/addresses" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><MyAddresses /></ProtectedRoute>} />

      {/* Owner Routes */}
      <Route path="/owner" element={<ProtectedRoute allowedRoles={['OWNER']}><OwnerDashboard /></ProtectedRoute>} />
      <Route path="/owner/orders" element={<ProtectedRoute allowedRoles={['OWNER']}><OwnerOrders /></ProtectedRoute>} />
      <Route path="/owner/orders/create" element={<ProtectedRoute allowedRoles={['OWNER']}><CreatePhoneOrder /></ProtectedRoute>} />
      <Route path="/owner/dispatch" element={<ProtectedRoute allowedRoles={['OWNER']}><DispatchBoard /></ProtectedRoute>} />
      <Route path="/owner/customers" element={<ProtectedRoute allowedRoles={['OWNER']}><CustomerManagement /></ProtectedRoute>} />
      <Route path="/owner/khata" element={<ProtectedRoute allowedRoles={['OWNER']}><CustomerManagement /></ProtectedRoute>} />
      <Route path="/owner/payments" element={<ProtectedRoute allowedRoles={['OWNER']}><CustomerManagement /></ProtectedRoute>} />
      <Route path="/owner/drivers" element={<ProtectedRoute allowedRoles={['OWNER']}><DriverManagement /></ProtectedRoute>} />
      <Route path="/owner/pricing" element={<ProtectedRoute allowedRoles={['OWNER']}><PricingManagement /></ProtectedRoute>} />
      <Route path="/owner/expenses" element={<ProtectedRoute allowedRoles={['OWNER']}><Expenses /></ProtectedRoute>} />
      <Route path="/owner/vehicles" element={<ProtectedRoute allowedRoles={['OWNER']}><DriverManagement /></ProtectedRoute>} />
      <Route path="/owner/analytics" element={<ProtectedRoute allowedRoles={['OWNER']}><Analytics /></ProtectedRoute>} />
      <Route path="/owner/reports" element={<ProtectedRoute allowedRoles={['OWNER']}><Analytics /></ProtectedRoute>} />
      <Route path="/owner/settings" element={<ProtectedRoute allowedRoles={['OWNER']}><PricingManagement /></ProtectedRoute>} />

      {/* Driver Routes */}
      <Route path="/driver" element={<ProtectedRoute allowedRoles={['DRIVER']}><DriverDashboard /></ProtectedRoute>} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
