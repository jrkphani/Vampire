import { apiClient } from './client';
import type {
  LoginResponse,
  RefreshTokenResponse,
  ApiResponse,
} from '@/types/api';

export class AuthService {
  /**
   * Staff login with credentials (form-based)
   */
  async login(staffId: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      { staffCode: staffId, pin: password }
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Login failed');
    }

    return response.data;
  }

  /**
   * Mock login for development (one-click staff selection)
   */
  async mockLogin(staffCode: string): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      { staffCode, pin: '1234' }
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Mock login failed');
    }

    return response.data;
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<ApiResponse<RefreshTokenResponse>>(
      '/auth/refresh',
      { refreshToken }
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Token refresh failed');
    }

    return response.data;
  }

  /**
   * Logout current session
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Logout should succeed even if API call fails
      console.warn('Logout API call failed:', error);
    }
  }

  /**
   * Validate staff authentication for transactions
   */
  async validateStaffAuth(staffCode: string, pin: string): Promise<boolean> {
    const response = await apiClient.post<ApiResponse<{ valid: boolean }>>(
      '/auth/validate',
      { staffCode, pin }
    );

    return response.success && response.data?.valid === true;
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<LoginResponse['staff']> {
    const response =
      await apiClient.get<ApiResponse<LoginResponse['staff']>>('/auth/profile');

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch profile');
    }

    return response.data;
  }
}

export const authService = new AuthService();
