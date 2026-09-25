import api from './axios';
import type { ApiResponse, Order, CreateOrderRequest, WaterService, Address, AddressRequest, CustomerProfile, DashboardStats, DriverDelivery } from '../types';

// ===== Customer APIs =====
export const customerApi = {
  getProfile: () =>
    api.get<ApiResponse<CustomerProfile>>('/api/customers/profile'),

  updateProfile: (data: { name?: string; mobile?: string; email?: string }) =>
    api.put<ApiResponse<CustomerProfile>>('/api/customers/profile', data),

  getAddresses: () =>
    api.get<ApiResponse<Address[]>>('/api/customers/addresses'),

  addAddress: (data: AddressRequest) =>
    api.post<ApiResponse<Address>>('/api/customers/addresses', data),

  updateAddress: (id: number, data: AddressRequest) =>
    api.put<ApiResponse<Address>>(`/api/customers/addresses/${id}`, data),

  deleteAddress: (id: number) =>
    api.delete<ApiResponse<void>>(`/api/customers/addresses/${id}`),
};

// ===== Water Service APIs =====
export const serviceApi = {
  getAll: () =>
    api.get<ApiResponse<WaterService[]>>('/api/services'),
};

// ===== Order APIs (Customer) =====
export const orderApi = {
  create: (data: CreateOrderRequest) =>
    api.post<ApiResponse<Order>>('/api/orders', data),

  getMyOrders: () =>
    api.get<ApiResponse<Order[]>>('/api/orders/my'),

  getById: (id: number) =>
    api.get<ApiResponse<Order>>(`/api/orders/${id}`),

  cancel: (id: number) =>
    api.put<ApiResponse<Order>>(`/api/orders/${id}/cancel`),

  reorder: (id: number, data: CreateOrderRequest) =>
    api.post<ApiResponse<Order>>(`/api/orders/${id}/reorder`, data),
};

// ===== Admin APIs (Owner) =====
export const adminApi = {
  // Dashboard
  getDashboardStats: (date?: string) =>
    api.get<ApiResponse<DashboardStats>>('/api/admin/analytics/dashboard', { params: { date } }),

  // Orders
  getOrders: (params?: { date?: string; status?: string }) =>
    api.get<ApiResponse<Order[]>>('/api/admin/orders', { params }),

  getOrder: (id: number) =>
    api.get<ApiResponse<Order>>(`/api/admin/orders/${id}`),

  createPhoneOrder: (customerId: number, data: CreateOrderRequest) =>
    api.post<ApiResponse<Order>>(`/api/admin/orders?customerId=${customerId}`, data),

  confirmOrder: (id: number) =>
    api.put<ApiResponse<Order>>(`/api/admin/orders/${id}/confirm`),

  assignDriver: (id: number, driverId: number) =>
    api.put<ApiResponse<Order>>(`/api/admin/orders/${id}/assign`, { driverId }),

  cancelOrder: (id: number) =>
    api.put<ApiResponse<Order>>(`/api/admin/orders/${id}/cancel`),

  rescheduleOrder: (id: number, date: string, slot: string) =>
    api.put<ApiResponse<Order>>(`/api/admin/orders/${id}/reschedule`, { date, slot }),

  // Customers
  searchCustomers: (query: string) =>
    api.get<ApiResponse<CustomerProfile[]>>('/api/admin/customers', { params: { q: query } }),

  quickCreateCustomer: (data: { name: string; mobile: string; address?: string }) =>
    api.post<ApiResponse<CustomerProfile>>('/api/admin/customers/quick', data),

  // Drivers
  getDrivers: () =>
    api.get<ApiResponse<{ id: number; name: string; status: string; totalDeliveries: number }[]>>('/api/admin/drivers'),
};

// ===== Driver APIs =====
export const driverApi = {
  getDeliveries: () =>
    api.get<ApiResponse<DriverDelivery[]>>('/api/driver/deliveries'),

  acceptDelivery: (id: number) =>
    api.put<ApiResponse<string>>(`/api/driver/deliveries/${id}/accept`),

  startDelivery: (id: number) =>
    api.put<ApiResponse<string>>(`/api/driver/deliveries/${id}/start`),

  arriveDelivery: (id: number) =>
    api.put<ApiResponse<string>>(`/api/driver/deliveries/${id}/arrive`),

  completeDelivery: (id: number, payment?: { paymentStatus: string; paymentMethod: string }) =>
    api.put<ApiResponse<string>>(`/api/driver/deliveries/${id}/complete`, payment),

  failDelivery: (id: number, reason: string) =>
    api.put<ApiResponse<string>>(`/api/driver/deliveries/${id}/fail`, { reason }),

  updateAvailability: (status: string) =>
    api.put<ApiResponse<string>>('/api/driver/availability', { status }),

  getDutyStatus: () =>
    api.get<ApiResponse<{
      driverId: number;
      status: string;
      isOnLeave: boolean;
      currentLeave: { id: number; fromDate: string; toDate: string; reason: string; status: string } | null;
      allLeaves: { id: number; fromDate: string; toDate: string; reason: string; status: string }[];
    }>>('/api/driver/duty-status'),

  applyLeave: (data: { fromDate: string; toDate: string; reason: string }) =>
    api.post<ApiResponse<{ leaveId: number; status: string; fromDate: string; toDate: string }>>('/api/driver/leave', data),

  resumeDuty: () =>
    api.post<ApiResponse<string>>('/api/driver/resume-duty'),
};
