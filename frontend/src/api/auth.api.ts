import api from './axios';
import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from '../types';

export const authApi = {
  register: (data: RegisterRequest) =>
    api.post<ApiResponse<AuthResponse>>('/api/auth/register', data),

  login: (data: LoginRequest) =>
    api.post<ApiResponse<AuthResponse>>('/api/auth/login', data),

  refresh: (refreshToken: string) =>
    api.post<ApiResponse<AuthResponse>>('/api/auth/refresh', { refreshToken }),

  me: () =>
    api.get<ApiResponse<Record<string, unknown>>>('/api/auth/me'),

  forgotPassword: (data: { identifier: string }) =>
    api.post<ApiResponse<{ identifier: string; role: string; name: string; verificationCode?: string; message: string }>>('/api/auth/forgot-password', data),

  resetPassword: (data: { identifier: string; otp: string; newPassword: string }) =>
    api.post<ApiResponse<{ success: boolean; message: string; role: string }>>('/api/auth/reset-password', data),
};
