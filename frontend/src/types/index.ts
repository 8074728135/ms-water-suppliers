// ===== Auth Types =====
export interface LoginRequest {
  mobile: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  mobile: string;
  password: string;
  email?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  role: 'CUSTOMER' | 'DRIVER' | 'OWNER';
  userId: number;
  name: string;
  mobile: string;
}

export interface AuthUser {
  token: string;
  refreshToken: string;
  role: 'CUSTOMER' | 'DRIVER' | 'OWNER';
  userId: number;
  name: string;
  mobile: string;
}

// ===== Water Service Types =====
export interface WaterService {
  id: number;
  name: string;
  displayName: string;
  description: string;
  price: number;
  capacityLitres: number;
  isQuantifiable: boolean;
  minQuantity: number;
  maxQuantity: number;
  isActive: boolean;
  sortOrder: number;
}

// ===== Address Types =====
export interface Address {
  id: number;
  label: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  area?: string;
  city?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

export interface AddressRequest {
  label: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  area?: string;
  city?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

// ===== Order Types =====
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'ON_THE_WAY'
  | 'ARRIVED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'FAILED';

export interface OrderItem {
  id: number;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  source: string;
  customerName: string;
  customerMobile: string;
  customerId: number;
  items: OrderItem[];
  deliveryAddress: string;
  addressLabel?: string;
  deliveryDate: string;
  timeSlot: string;
  instructions?: string;
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  driverName?: string;
  driverId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  waterServiceId: number;
  quantity: number;
  addressId: number;
  deliveryDate: string;
  timeSlot: string;
  instructions?: string;
  paymentMethod: string;
  idempotencyKey?: string;
}

// ===== Driver Types =====
export interface Driver {
  id: number;
  name: string;
  mobile: string;
  status: 'AVAILABLE' | 'BUSY' | 'ON_LEAVE';
  totalDeliveries: number;
  completedDeliveries: number;
  failedDeliveries: number;
}

export interface DriverDelivery {
  deliveryId: number;
  orderId: number;
  orderNumber: string;
  customerName: string;
  customerMobile: string;
  address: string;
  latitude: number | string;
  longitude: number | string;
  items: { service: string; quantity: number; price: number }[];
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  instructions: string;
  status: string;
  orderStatus: string;
}

// ===== Dashboard Types =====
export interface DashboardStats {
  date: string;
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  assignedOrders: number;
  deliveredOrders: number;
  onTheWayOrders: number;
  cancelledOrders: number;
  failedOrders: number;
  unassignedOrders: number;
  revenue: number;
  totalCustomers: number;
}

// ===== Customer Types =====
export interface CustomerProfile {
  id: number;
  name: string;
  mobile: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  outstandingAmount: number;
  memberSince: string;
}

// ===== API Response =====
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string>;
  timestamp: string;
}
