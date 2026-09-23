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
};
