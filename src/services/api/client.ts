import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { ApiResponse, ApiError } from '@/types/api';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

// Circuit breaker configuration
interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
}

// Request retry configuration
interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  exponentialBackoff: boolean;
}

// API client configuration
interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  enableRetry: boolean;
  retryConfig: RetryConfig;
  circuitBreaker: CircuitBreakerConfig;
}

// Circuit breaker state
interface CircuitBreakerState {
  isOpen: boolean;
  failureCount: number;
  lastFailureTime: number | null;
  successCount: number;
}

// Default configuration
const DEFAULT_CONFIG: ApiClientConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  enableRetry: true,
  retryConfig: {
    maxRetries: 3,
    retryDelay: 1000,
    exponentialBackoff: true,
  },
  circuitBreaker: {
    failureThreshold: 5,
    resetTimeout: 60000,
    monitoringPeriod: 120000,
  },
};

// Check for production misconfiguration
if (!import.meta.env.DEV && !import.meta.env.VITE_API_BASE_URL) {
  console.error('🚨 PRODUCTION MISCONFIGURATION DETECTED');
  console.error('API calls will fail because no backend URL is configured');
  console.error('Set VITE_API_BASE_URL in your Amplify environment variables');
}

// Circuit breaker implementation
class CircuitBreaker {
  private state: CircuitBreakerState = {
    isOpen: false,
    failureCount: 0,
    lastFailureTime: null,
    successCount: 0,
  };

  constructor(private config: CircuitBreakerConfig) {}

  canExecute(): boolean {
    if (!this.state.isOpen) return true;

    const now = Date.now();
    const timeSinceLastFailure = this.state.lastFailureTime
      ? now - this.state.lastFailureTime
      : 0;

    if (timeSinceLastFailure > this.config.resetTimeout) {
      this.state.isOpen = false;
      this.state.failureCount = 0;
      return true;
    }

    return false;
  }

  recordSuccess(): void {
    this.state.successCount++;
    this.state.failureCount = 0;
    this.state.isOpen = false;
  }

  recordFailure(): void {
    this.state.failureCount++;
    this.state.lastFailureTime = Date.now();

    if (this.state.failureCount >= this.config.failureThreshold) {
      this.state.isOpen = true;
    }
  }

  getState(): CircuitBreakerState {
    return { ...this.state };
  }
}

// Professional API client class
class ApiClient {
  private axiosInstance: AxiosInstance;
  private config: ApiClientConfig;
  private circuitBreaker: CircuitBreaker;

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.circuitBreaker = new CircuitBreaker(this.config.circuitBreaker);
    this.axiosInstance = this.createAxiosInstance();
    this.setupInterceptors();
  }

  private createAxiosInstance(): AxiosInstance {
    return axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      config => this.requestInterceptor(config),
      error => this.requestErrorInterceptor(error)
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      response => this.responseInterceptor(response),
      error => this.responseErrorInterceptor(error)
    );
  }

  private requestInterceptor(
    config: InternalAxiosRequestConfig
  ): InternalAxiosRequestConfig {
    const startTime = Date.now();

    // Add timestamp to track request duration using headers for metadata
    config.headers = config.headers || {};
    (config as any).metadata = { startTime };

    // Add authentication token
    const authStore = useAuthStore.getState();
    if (authStore.token && authStore.isSessionValid()) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${authStore.token}`;
    }

    // Add request ID for tracing
    config.headers = config.headers || {};
    config.headers['X-Request-ID'] = this.generateRequestId();

    // Update UI loading state
    const uiStore = useUIStore.getState();
    uiStore.setLoading('api', true, 'Processing request...');

    return config;
  }

  private requestErrorInterceptor(error: AxiosError): Promise<AxiosError> {
    const uiStore = useUIStore.getState();
    uiStore.clearLoading('api');
    uiStore.setError('api', 'Request failed to send', 'REQUEST_ERROR');

    return Promise.reject(error);
  }

  private responseInterceptor(response: AxiosResponse): AxiosResponse {
    const duration =
      Date.now() - ((response.config as any).metadata?.startTime || 0);

    // Update UI performance metrics
    const uiStore = useUIStore.getState();
    uiStore.setLastApiCallTime(duration);
    uiStore.clearLoading('api');

    // Record success for circuit breaker
    this.circuitBreaker.recordSuccess();

    return response;
  }

  private async responseErrorInterceptor(error: AxiosError): Promise<never> {
    const uiStore = useUIStore.getState();
    uiStore.clearLoading('api');

    // Record failure for circuit breaker
    this.circuitBreaker.recordFailure();

    // Handle different error types
    if (error.response) {
      // Server responded with error status
      await this.handleServerError(error);
    } else if (error.request) {
      // Network error
      await this.handleNetworkError(error);
    } else {
      // Request configuration error
      await this.handleRequestError(error);
    }

    return Promise.reject(error);
  }

  private async handleServerError(error: AxiosError): Promise<void> {
    const response = error.response!;
    const uiStore = useUIStore.getState();

    switch (response.status) {
      case 401:
        await this.handleUnauthorizedError();
        break;
      case 403:
        uiStore.setError('api', 'Access denied', 'FORBIDDEN');
        break;
      case 404:
        uiStore.setError('api', 'Resource not found', 'NOT_FOUND');
        break;
      case 422:
        const apiResponse = response.data as ApiResponse;
        if (apiResponse.errors) {
          this.handleValidationErrors(apiResponse.errors);
        }
        break;
      case 500:
        uiStore.setError('api', 'Internal server error', 'SERVER_ERROR');
        break;
      default:
        uiStore.setError(
          'api',
          'An unexpected error occurred',
          'UNKNOWN_ERROR'
        );
    }
  }

  private async handleNetworkError(error: AxiosError): Promise<void> {
    const uiStore = useUIStore.getState();

    if (error.code === 'ECONNABORTED') {
      uiStore.setError('api', 'Request timed out', 'TIMEOUT');
    } else if (error.code === 'ERR_NETWORK') {
      uiStore.setError('api', 'Network connection failed', 'NETWORK_ERROR');
    } else {
      uiStore.setError('api', 'Connection error', 'CONNECTION_ERROR');
    }
  }

  private async handleRequestError(error: AxiosError): Promise<void> {
    const uiStore = useUIStore.getState();
    const errorMessage = error.message || 'Request configuration error';
    uiStore.setError('api', errorMessage, 'REQUEST_CONFIG_ERROR');
  }

  private async handleUnauthorizedError(): Promise<void> {
    const authStore = useAuthStore.getState();
    const uiStore = useUIStore.getState();

    if (authStore.refreshToken) {
      try {
        // Attempt to refresh token
        await this.refreshToken();
      } catch (refreshError) {
        // Refresh failed, logout user
        authStore.logout();
        uiStore.setError(
          'auth',
          'Session expired. Please login again.',
          'SESSION_EXPIRED'
        );
      }
    } else {
      authStore.logout();
      uiStore.setError(
        'auth',
        'Authentication required',
        'AUTHENTICATION_REQUIRED'
      );
    }
  }

  private async refreshToken(): Promise<void> {
    const authStore = useAuthStore.getState();

    const response = await this.axiosInstance.post<
      ApiResponse<{
        token: string;
        expiresIn: number;
      }>
    >('/auth/refresh', {
      refreshToken: authStore.refreshToken,
    });

    if (response.data.success && response.data.data) {
      authStore.updateToken(
        response.data.data.token,
        response.data.data.expiresIn
      );
    } else {
      throw new Error('Token refresh failed');
    }
  }

  private handleValidationErrors(errors: ApiError[]): void {
    const uiStore = useUIStore.getState();

    errors.forEach(error => {
      const key = error.field || 'validation';
      uiStore.setError(key, error.message, error.code);
    });
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Retry logic with exponential backoff
  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    retryCount = 0
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      if (retryCount >= this.config.retryConfig.maxRetries) {
        throw error;
      }

      const delay = this.config.retryConfig.exponentialBackoff
        ? this.config.retryConfig.retryDelay * Math.pow(2, retryCount)
        : this.config.retryConfig.retryDelay;

      await new Promise(resolve => setTimeout(resolve, delay));
      return this.retryRequest(requestFn, retryCount + 1);
    }
  }

  // Public API methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    if (!this.circuitBreaker.canExecute()) {
      throw new Error('Circuit breaker is open');
    }

    const requestFn = () =>
      this.axiosInstance.get<T>(url, config).then(response => response.data);

    return this.config.enableRetry ? this.retryRequest(requestFn) : requestFn();
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    if (!this.circuitBreaker.canExecute()) {
      throw new Error('Circuit breaker is open');
    }

    const requestFn = () =>
      this.axiosInstance
        .post<T>(url, data, config)
        .then(response => response.data);

    return this.config.enableRetry ? this.retryRequest(requestFn) : requestFn();
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    if (!this.circuitBreaker.canExecute()) {
      throw new Error('Circuit breaker is open');
    }

    const requestFn = () =>
      this.axiosInstance
        .put<T>(url, data, config)
        .then(response => response.data);

    return this.config.enableRetry ? this.retryRequest(requestFn) : requestFn();
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    if (!this.circuitBreaker.canExecute()) {
      throw new Error('Circuit breaker is open');
    }

    const requestFn = () =>
      this.axiosInstance.delete<T>(url, config).then(response => response.data);

    return this.config.enableRetry ? this.retryRequest(requestFn) : requestFn();
  }

  // Utility methods
  getCircuitBreakerState(): CircuitBreakerState {
    return this.circuitBreaker.getState();
  }

  updateConfig(config: Partial<ApiClientConfig>): void {
    this.config = { ...this.config, ...config };
    this.circuitBreaker = new CircuitBreaker(this.config.circuitBreaker);
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export types
export type { ApiClient, ApiClientConfig, CircuitBreakerState, RetryConfig };
