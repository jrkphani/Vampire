import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { systemService } from '@/services/api';
import { webSocketService } from '@/services/websocket';
import { apiClient } from '@/services/api/client';

// System health status types
type SystemHealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
type ServiceStatus = 'up' | 'down' | 'degraded' | 'unknown';

// Service health information
interface ServiceHealth {
  name: string;
  status: ServiceStatus;
  responseTime?: number;
  lastCheck: string;
  errorCount: number;
  uptime: number;
  message?: string;
}

// System metrics
interface SystemMetrics {
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  activeConnections: number;
  requestsPerMinute: number;
  averageResponseTime: number;
  errorRate: number;
  throughput: number;
  peakMemory: number;
  peakCpu: number;
}

// Health check result
interface HealthCheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  duration: number;
  timestamp: string;
}

// Performance alert
interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  metric: string;
  threshold: number;
  currentValue: number;
  timestamp: string;
  acknowledged: boolean;
}

// System configuration
interface SystemConfig {
  currency: string;
  lostReportFee: number;
  interestCalculationMethod: 'simple' | 'compound';
  maxTicketsPerTransaction: number;
  sessionTimeout: number;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
}

// Monitoring configuration
interface MonitoringConfig {
  healthCheckInterval: number;
  metricsCollectionInterval: number;
  alertThresholds: {
    memoryUsage: number;
    cpuUsage: number;
    diskUsage: number;
    responseTime: number;
    errorRate: number;
  };
  enableRealTimeMonitoring: boolean;
  retentionPeriod: number;
}

// System health store state
interface SystemHealthState {
  // System status
  overallHealth: SystemHealthStatus;
  services: ServiceHealth[];
  lastHealthCheck: string | null;

  // System metrics
  currentMetrics: SystemMetrics | null;
  metricsHistory: Array<{
    timestamp: string;
    metrics: SystemMetrics;
  }>;

  // Health checks
  healthChecks: HealthCheckResult[];

  // Performance alerts
  alerts: PerformanceAlert[];
  unacknowledgedAlerts: number;

  // System configuration
  systemConfig: SystemConfig | null;

  // Monitoring configuration
  monitoringConfig: MonitoringConfig;

  // Connection states
  apiConnectionState: 'connected' | 'disconnected' | 'error';
  webSocketConnectionState: 'connected' | 'disconnected' | 'error';

  // Monitoring state
  isMonitoring: boolean;
  monitoringError: string | null;
  lastUpdate: string | null;

  // Circuit breaker state
  circuitBreakerState: {
    isOpen: boolean;
    failureCount: number;
    lastFailureTime: number | null;
  };

  // Actions
  startMonitoring: () => void;
  stopMonitoring: () => void;
  performHealthCheck: () => Promise<void>;
  fetchSystemMetrics: () => Promise<void>;
  fetchSystemConfig: () => Promise<void>;
  updateMonitoringConfig: (config: Partial<MonitoringConfig>) => void;
  acknowledgeAlert: (alertId: string) => void;
  dismissAlert: (alertId: string) => void;
  clearAllAlerts: () => void;
  generateAlert: (
    type: 'warning' | 'error' | 'info',
    title: string,
    message: string,
    metric: string
  ) => void;

  // Getters
  getHealthSummary: () => {
    healthy: number;
    degraded: number;
    unhealthy: number;
    total: number;
  };
  getAverageResponseTime: () => number;
  getSystemUptime: () => number;
  getCriticalAlerts: () => PerformanceAlert[];
  isSystemHealthy: () => boolean;
}

// Default monitoring configuration
const DEFAULT_MONITORING_CONFIG: MonitoringConfig = {
  healthCheckInterval: 30000, // 30 seconds
  metricsCollectionInterval: 10000, // 10 seconds
  alertThresholds: {
    memoryUsage: 80, // 80%
    cpuUsage: 75, // 75%
    diskUsage: 85, // 85%
    responseTime: 2000, // 2 seconds
    errorRate: 5, // 5%
  },
  enableRealTimeMonitoring: true,
  retentionPeriod: 86400000, // 24 hours in milliseconds
};

export const useSystemHealthStore = create<SystemHealthState>()(
  devtools(
    (set, get) => ({
      // Initial state
      overallHealth: 'unknown',
      services: [],
      lastHealthCheck: null,
      currentMetrics: null,
      metricsHistory: [],
      healthChecks: [],
      alerts: [],
      unacknowledgedAlerts: 0,
      systemConfig: null,
      monitoringConfig: DEFAULT_MONITORING_CONFIG,
      apiConnectionState: 'disconnected',
      webSocketConnectionState: 'disconnected',
      isMonitoring: false,
      monitoringError: null,
      lastUpdate: null,
      circuitBreakerState: {
        isOpen: false,
        failureCount: 0,
        lastFailureTime: null,
      },

      // Actions
      startMonitoring: () => {
        const state = get();
        if (state.isMonitoring) return;

        set({ isMonitoring: true, monitoringError: null });

        // Start health check interval
        setInterval(() => {
          get().performHealthCheck();
        }, state.monitoringConfig.healthCheckInterval);

        // Start metrics collection interval
        setInterval(() => {
          get().fetchSystemMetrics();
        }, state.monitoringConfig.metricsCollectionInterval);

        // Monitor API connection state
        const apiState = apiClient.getCircuitBreakerState();
        set({
          apiConnectionState: apiState.isOpen ? 'error' : 'connected',
          circuitBreakerState: apiState,
        });

        // Monitor WebSocket connection
        const wsState = webSocketService.getConnectionState();
        set({
          webSocketConnectionState:
            wsState === 'connected'
              ? 'connected'
              : wsState === 'failed'
                ? 'error'
                : 'disconnected',
        });

        // Clean up intervals when component unmounts
        // Note: In a real implementation, you'd want to store these interval IDs
        // and clear them in stopMonitoring

        // Monitor WebSocket connection state
        // Note: Using direct state monitoring instead of event subscription
        // since 'connection_state_change' is not in the WebSocketEventType union
        const checkWebSocketState = () => {
          const isConnected = webSocketService.isConnected();
          set({
            webSocketConnectionState: isConnected
              ? 'connected'
              : 'disconnected',
          });
        };

        // Initial check and periodic monitoring
        checkWebSocketState();
        setInterval(checkWebSocketState, 5000); // Check every 5 seconds

        // Perform initial health check
        get().performHealthCheck();
        get().fetchSystemMetrics();
        get().fetchSystemConfig();
      },

      stopMonitoring: () => {
        set({
          isMonitoring: false,
          monitoringError: null,
        });

        // In a real implementation, clear intervals here
        // Note: No WebSocket event subscription to clean up
      },

      performHealthCheck: async () => {
        try {
          const response = await systemService.performHealthCheck();

          set({
            overallHealth: response.overall,
            healthChecks: response.checks.map(check => ({
              ...check,
              timestamp: new Date().toISOString(),
            })),
            lastHealthCheck: new Date().toISOString(),
            lastUpdate: new Date().toISOString(),
          });

          // Check for service-specific health
          const serviceHealthMap = new Map<string, ServiceHealth>();
          response.checks.forEach(check => {
            serviceHealthMap.set(check.name, {
              name: check.name,
              status:
                check.status === 'pass'
                  ? 'up'
                  : check.status === 'warn'
                    ? 'degraded'
                    : 'down',
              responseTime: check.duration,
              lastCheck: new Date().toISOString(),
              errorCount: check.status === 'fail' ? 1 : 0,
              uptime: check.status === 'pass' ? 100 : 0,
              message: check.message,
            });
          });

          set({
            services: Array.from(serviceHealthMap.values()),
          });

          // Generate alerts based on health status
          const store = get();
          if (response.overall === 'unhealthy') {
            store.generateAlert(
              'error',
              'System Health Critical',
              'System health is critical',
              'overall_health'
            );
          } else if (response.overall === 'degraded') {
            store.generateAlert(
              'warning',
              'System Health Degraded',
              'System performance is degraded',
              'overall_health'
            );
          }
        } catch (error) {
          set({
            overallHealth: 'unknown',
            monitoringError:
              error instanceof Error ? error.message : 'Health check failed',
            lastUpdate: new Date().toISOString(),
          });
        }
      },

      fetchSystemMetrics: async () => {
        try {
          const apiMetrics = await systemService.getSystemMetrics();

          // Complete the metrics object with missing fields
          const state = get();
          const metrics: SystemMetrics = {
            ...apiMetrics,
            // Add missing fields with calculated or default values
            throughput: apiMetrics.requestsPerMinute * 60, // Convert RPM to requests per hour
            peakMemory: Math.max(
              state.currentMetrics?.peakMemory || 0,
              apiMetrics.memoryUsage
            ),
            peakCpu: Math.max(
              state.currentMetrics?.peakCpu || 0,
              apiMetrics.cpuUsage
            ),
          };

          set(state => {
            const newMetricsHistory = [
              ...state.metricsHistory,
              {
                timestamp: new Date().toISOString(),
                metrics,
              },
            ].slice(-100); // Keep last 100 entries

            return {
              currentMetrics: metrics,
              metricsHistory: newMetricsHistory,
              lastUpdate: new Date().toISOString(),
            };
          });

          // Check for threshold violations and generate alerts
          const store = get();
          const config = store.monitoringConfig;

          if (metrics.memoryUsage > config.alertThresholds.memoryUsage) {
            store.generateAlert(
              'warning',
              'High Memory Usage',
              `Memory usage is ${metrics.memoryUsage}%`,
              'memory_usage'
            );
          }

          if (metrics.cpuUsage > config.alertThresholds.cpuUsage) {
            store.generateAlert(
              'warning',
              'High CPU Usage',
              `CPU usage is ${metrics.cpuUsage}%`,
              'cpu_usage'
            );
          }

          if (metrics.diskUsage > config.alertThresholds.diskUsage) {
            store.generateAlert(
              'error',
              'High Disk Usage',
              `Disk usage is ${metrics.diskUsage}%`,
              'disk_usage'
            );
          }

          if (
            metrics.averageResponseTime > config.alertThresholds.responseTime
          ) {
            store.generateAlert(
              'warning',
              'High Response Time',
              `Average response time is ${metrics.averageResponseTime}ms`,
              'response_time'
            );
          }

          if (metrics.errorRate > config.alertThresholds.errorRate) {
            store.generateAlert(
              'error',
              'High Error Rate',
              `Error rate is ${metrics.errorRate}%`,
              'error_rate'
            );
          }
        } catch (error) {
          set({
            monitoringError:
              error instanceof Error
                ? error.message
                : 'Failed to fetch metrics',
            lastUpdate: new Date().toISOString(),
          });
        }
      },

      fetchSystemConfig: async () => {
        try {
          const config = await systemService.getSystemConfig();
          set({ systemConfig: config });
        } catch (error) {
          set({
            monitoringError:
              error instanceof Error
                ? error.message
                : 'Failed to fetch system config',
          });
        }
      },

      updateMonitoringConfig: config => {
        set(state => ({
          monitoringConfig: { ...state.monitoringConfig, ...config },
        }));
      },

      acknowledgeAlert: alertId => {
        set(state => ({
          alerts: state.alerts.map(alert =>
            alert.id === alertId ? { ...alert, acknowledged: true } : alert
          ),
          unacknowledgedAlerts: Math.max(0, state.unacknowledgedAlerts - 1),
        }));
      },

      dismissAlert: alertId => {
        set(state => ({
          alerts: state.alerts.filter(alert => alert.id !== alertId),
          unacknowledgedAlerts: state.alerts.some(
            alert => alert.id === alertId && !alert.acknowledged
          )
            ? Math.max(0, state.unacknowledgedAlerts - 1)
            : state.unacknowledgedAlerts,
        }));
      },

      clearAllAlerts: () => {
        set({
          alerts: [],
          unacknowledgedAlerts: 0,
        });
      },

      generateAlert: (
        type: 'warning' | 'error' | 'info',
        title: string,
        message: string,
        metric: string
      ) => {
        const alert: PerformanceAlert = {
          id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type,
          title,
          message,
          metric,
          threshold:
            (get().monitoringConfig.alertThresholds as any)[metric] || 0,
          currentValue: 0, // Would be calculated based on metric
          timestamp: new Date().toISOString(),
          acknowledged: false,
        };

        set(state => ({
          alerts: [...state.alerts, alert],
          unacknowledgedAlerts: state.unacknowledgedAlerts + 1,
        }));
      },

      // Getters
      getHealthSummary: () => {
        const { services } = get();
        const summary = {
          healthy: services.filter(s => s.status === 'up').length,
          degraded: services.filter(s => s.status === 'degraded').length,
          unhealthy: services.filter(s => s.status === 'down').length,
          total: services.length,
        };

        return summary;
      },

      getAverageResponseTime: () => {
        const { services } = get();
        if (services.length === 0) return 0;

        const totalResponseTime = services.reduce(
          (sum, service) => sum + (service.responseTime || 0),
          0
        );

        return Math.round(totalResponseTime / services.length);
      },

      getSystemUptime: () => {
        const { currentMetrics } = get();
        return currentMetrics?.uptime || 0;
      },

      getCriticalAlerts: () => {
        const { alerts } = get();
        return alerts.filter(
          alert => alert.type === 'error' && !alert.acknowledged
        );
      },

      isSystemHealthy: () => {
        const { overallHealth } = get();
        return overallHealth === 'healthy';
      },
    }),
    {
      name: 'system-health-store',
    }
  )
);

// Export types for external usage
export type {
  SystemHealthStatus,
  ServiceHealth,
  SystemMetrics,
  PerformanceAlert,
  SystemConfig,
  MonitoringConfig,
};
