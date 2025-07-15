import type {
  WebSocketMessage,
  TicketUpdateEvent,
  TransactionCompletedEvent,
  SystemNotificationEvent,
  PrintStatusEvent,
} from '@/types/api';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

// WebSocket connection states
type ConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'failed';

// WebSocket event types
type WebSocketEventType =
  | 'ticket_update'
  | 'transaction_completed'
  | 'system_notification'
  | 'print_status'
  | 'staff_auth_required'
  | 'session_warning'
  | 'system_maintenance';

// WebSocket configuration
interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  connectionTimeout: number;
}

// Event listener callback type
type EventListener<T = unknown> = (data: T) => void;

// WebSocket service class
class WebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private connectionState: ConnectionState = 'disconnected';
  private reconnectAttempts = 0;
  private listeners: Map<WebSocketEventType, Set<EventListener>> = new Map();
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<WebSocketConfig> = {}) {
    this.config = {
      url: import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws',
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      connectionTimeout: 10000,
      ...config,
    };

    // Initialize event listener maps
    this.initializeEventListeners();
  }

  private initializeEventListeners(): void {
    const eventTypes: WebSocketEventType[] = [
      'ticket_update',
      'transaction_completed',
      'system_notification',
      'print_status',
      'staff_auth_required',
      'session_warning',
      'system_maintenance',
    ];

    eventTypes.forEach(eventType => {
      this.listeners.set(eventType, new Set());
    });
  }

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    if (
      this.connectionState === 'connected' ||
      this.connectionState === 'connecting'
    ) {
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        this.connectionState = 'connecting';
        this.updateConnectionStatus();

        const authStore = useAuthStore.getState();
        const wsUrl = new URL(this.config.url);

        // Add authentication token to connection
        if (authStore.token) {
          wsUrl.searchParams.set('token', authStore.token);
        }

        this.ws = new WebSocket(wsUrl.toString());

        const connectionTimer = setTimeout(() => {
          this.ws?.close();
          this.connectionState = 'failed';
          this.updateConnectionStatus();
          reject(new Error('Connection timeout'));
        }, this.config.connectionTimeout);

        this.ws.onopen = () => {
          clearTimeout(connectionTimer);
          this.connectionState = 'connected';
          this.reconnectAttempts = 0;
          this.updateConnectionStatus();
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = event => {
          this.handleMessage(event);
        };

        this.ws.onclose = event => {
          clearTimeout(connectionTimer);
          this.handleClose(event);
        };

        this.ws.onerror = error => {
          clearTimeout(connectionTimer);
          this.handleError(error);
          reject(error);
        };
      } catch (error) {
        this.connectionState = 'failed';
        this.updateConnectionStatus();
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Normal closure');
      this.ws = null;
    }

    this.connectionState = 'disconnected';
    this.updateConnectionStatus();
    this.stopHeartbeat();
    this.clearReconnectTimer();
  }

  /**
   * Send message to server
   */
  send(message: WebSocketMessage): void {
    if (this.connectionState !== 'connected' || !this.ws) {
      throw new Error('WebSocket not connected');
    }

    this.ws.send(JSON.stringify(message));
  }

  /**
   * Subscribe to events
   */
  on<T = unknown>(
    eventType: WebSocketEventType,
    callback: EventListener<T>
  ): () => void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.add(callback as EventListener);
    }

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        listeners.delete(callback as EventListener);
      }
    };
  }

  /**
   * Unsubscribe from events
   */
  off<T = unknown>(
    eventType: WebSocketEventType,
    callback?: EventListener<T>
  ): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      if (callback) {
        listeners.delete(callback as EventListener);
      } else {
        listeners.clear();
      }
    }
  }

  /**
   * Get connection state
   */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connectionState === 'connected';
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);

      switch (message.type) {
        case 'ticket_update':
          this.emit('ticket_update', message.payload as TicketUpdateEvent);
          break;
        case 'transaction_completed':
          this.emit(
            'transaction_completed',
            message.payload as TransactionCompletedEvent
          );
          break;
        case 'system_notification':
          this.emit(
            'system_notification',
            message.payload as SystemNotificationEvent
          );
          this.handleSystemNotification(
            message.payload as SystemNotificationEvent
          );
          break;
        case 'print_status':
          this.emit('print_status', message.payload as PrintStatusEvent);
          break;
        case 'staff_auth_required':
          this.emit('staff_auth_required', message.payload);
          break;
        case 'session_warning':
          this.emit('session_warning', message.payload);
          this.handleSessionWarning(message.payload as { expiresIn: number });
          break;
        case 'system_maintenance':
          this.emit('system_maintenance', message.payload);
          this.handleSystemMaintenance(
            message.payload as {
              scheduledAt: string;
              duration: number;
              message: string;
            }
          );
          break;
        case 'pong':
          // Heartbeat response
          break;
        default:
          console.warn('Unknown WebSocket message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  private handleClose(event: CloseEvent): void {
    this.connectionState = 'disconnected';
    this.updateConnectionStatus();
    this.stopHeartbeat();

    // Auto-reconnect if not a normal closure
    if (
      event.code !== 1000 &&
      this.reconnectAttempts < this.config.maxReconnectAttempts
    ) {
      this.scheduleReconnect();
    }
  }

  private handleError(error: Event): void {
    console.error('WebSocket error:', error);
    this.connectionState = 'failed';
    this.updateConnectionStatus();
  }

  private scheduleReconnect(): void {
    this.connectionState = 'reconnecting';
    this.updateConnectionStatus();
    this.reconnectAttempts++;

    const delay =
      this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
        if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
          this.scheduleReconnect();
        } else {
          this.connectionState = 'failed';
          this.updateConnectionStatus();
        }
      });
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.connectionState === 'connected') {
        this.send({
          type: 'ping',
          payload: null,
          timestamp: new Date().toISOString(),
          id: `ping_${Date.now()}`,
        });
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private emit<T = unknown>(eventType: WebSocketEventType, data: T): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(
            `Error in WebSocket event listener for ${eventType}:`,
            error
          );
        }
      });
    }
  }

  private updateConnectionStatus(): void {
    const uiStore = useUIStore.getState();

    switch (this.connectionState) {
      case 'connected':
        uiStore.clearError('websocket');
        break;
      case 'connecting':
        uiStore.setLoading('websocket', true, 'Connecting to server...');
        break;
      case 'reconnecting':
        uiStore.setLoading('websocket', true, 'Reconnecting...');
        break;
      case 'failed':
        uiStore.clearLoading('websocket');
        uiStore.setError('websocket', 'Connection failed', 'CONNECTION_FAILED');
        break;
      case 'disconnected':
        uiStore.clearLoading('websocket');
        uiStore.clearError('websocket');
        break;
    }
  }

  private handleSystemNotification(
    notification: SystemNotificationEvent
  ): void {
    const uiStore = useUIStore.getState();

    uiStore.addToast({
      type:
        notification.level === 'error'
          ? 'error'
          : notification.level === 'warning'
            ? 'warning'
            : 'info',
      title: notification.title,
      message: notification.message,
      duration: notification.level === 'error' ? 10000 : 5000,
      action: notification.action
        ? {
            label: notification.action.label,
            onClick: () => window.open(notification.action!.url, '_blank'),
          }
        : undefined,
    });
  }

  private handleSessionWarning(warning: { expiresIn: number }): void {
    const uiStore = useUIStore.getState();

    uiStore.addToast({
      type: 'warning',
      title: 'Session Expiring',
      message: `Your session will expire in ${Math.ceil(warning.expiresIn / 60)} minutes.`,
      duration: 30000,
      persistent: true,
    });
  }

  private handleSystemMaintenance(maintenance: {
    scheduledAt: string;
    duration: number;
    message: string;
  }): void {
    const uiStore = useUIStore.getState();

    uiStore.addToast({
      type: 'info',
      title: 'Scheduled Maintenance',
      message: maintenance.message,
      duration: 60000,
      persistent: true,
    });
  }
}

// Create singleton instance
export const webSocketService = new WebSocketService();

// Export types
export type {
  WebSocketService,
  ConnectionState,
  WebSocketEventType,
  EventListener,
};
