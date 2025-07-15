// Performance monitoring utilities for ValueMax Vampire Frontend
import React from 'react';

// Performance metric types
interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'mb' | 'count' | 'score';
  timestamp: number;
  category: 'load' | 'interaction' | 'memory' | 'network' | 'custom';
}

interface WebVitals {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

interface PerformanceReport {
  pageLoad: {
    domReady: number;
    windowLoad: number;
    firstPaint: number;
    firstContentfulPaint: number;
  };
  webVitals: WebVitals;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  networkMetrics: {
    requestCount: number;
    averageResponseTime: number;
    slowRequestCount: number;
    errorCount: number;
  };
  customMetrics: PerformanceMetric[];
  recommendations: string[];
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();
  private isMonitoring = false;
  private webVitals: WebVitals = {};

  constructor() {
    this.setupWebVitalsObserver();
    this.setupNavigationObserver();
    this.setupResourceObserver();
    this.setupMemoryMonitoring();
  }

  // Start performance monitoring
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.startObservers();

    // Monitor page load performance
    this.measurePageLoad();

    // Set up periodic memory monitoring
    this.scheduleMemoryCheck();

    console.log('📊 Performance monitoring started');
  }

  // Stop performance monitoring
  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    this.stopObservers();

    console.log('📊 Performance monitoring stopped');
  }

  // Record custom performance metric
  recordMetric(
    name: string,
    value: number,
    unit: PerformanceMetric['unit'] = 'ms',
    category: PerformanceMetric['category'] = 'custom'
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      category,
    };

    this.metrics.push(metric);

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Log in development
    if (import.meta.env.DEV) {
      console.log(`⚡ Performance metric: ${name} = ${value}${unit}`);
    }
  }

  // Measure function execution time
  measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const startTime = performance.now();

    return fn()
      .then(result => {
        const duration = performance.now() - startTime;
        this.recordMetric(name, duration, 'ms', 'custom');
        return result;
      })
      .catch(error => {
        const duration = performance.now() - startTime;
        this.recordMetric(`${name}_error`, duration, 'ms', 'custom');
        throw error;
      });
  }

  // Measure synchronous function execution time
  measureSync<T>(name: string, fn: () => T): T {
    const startTime = performance.now();

    try {
      const result = fn();
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration, 'ms', 'custom');
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordMetric(`${name}_error`, duration, 'ms', 'custom');
      throw error;
    }
  }

  // Get performance report
  getPerformanceReport(): PerformanceReport {
    const pageLoadMetrics = this.getPageLoadMetrics();
    const memoryUsage = this.getCurrentMemoryUsage();
    const networkMetrics = this.getNetworkMetrics();
    const recommendations = this.generateRecommendations();

    return {
      pageLoad: pageLoadMetrics,
      webVitals: this.webVitals,
      memoryUsage,
      networkMetrics,
      customMetrics: [...this.metrics],
      recommendations,
    };
  }

  // Get metrics by category
  getMetricsByCategory(
    category: PerformanceMetric['category']
  ): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.category === category);
  }

  // Get average metric value
  getAverageMetric(name: string): number {
    const metrics = this.metrics.filter(m => m.name === name);
    if (metrics.length === 0) return 0;

    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  }

  // Clear all metrics
  clearMetrics(): void {
    this.metrics = [];
    this.webVitals = {};
  }

  private setupWebVitalsObserver(): void {
    // Observe First Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const fcpObserver = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              this.webVitals.fcp = entry.startTime;
              this.recordMetric('fcp', entry.startTime, 'ms', 'load');
            }
          }
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.set('fcp', fcpObserver);
      } catch (error) {
        console.warn('Failed to setup FCP observer:', error);
      }
    }

    // Observe Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            this.webVitals.lcp = (entry as any).startTime;
            this.recordMetric('lcp', (entry as any).startTime, 'ms', 'load');
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (error) {
        console.warn('Failed to setup LCP observer:', error);
      }
    }

    // Observe First Input Delay
    if ('PerformanceObserver' in window) {
      try {
        const fidObserver = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            this.webVitals.fid =
              (entry as any).processingStart - entry.startTime;
            this.recordMetric('fid', this.webVitals.fid, 'ms', 'interaction');
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('fid', fidObserver);
      } catch (error) {
        console.warn('Failed to setup FID observer:', error);
      }
    }

    // Observe Cumulative Layout Shift
    if ('PerformanceObserver' in window) {
      try {
        let clsScore = 0;
        const clsObserver = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsScore += (entry as any).value;
            }
          }
          this.webVitals.cls = clsScore;
          this.recordMetric('cls', clsScore, 'score', 'load');
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('cls', clsObserver);
      } catch (error) {
        console.warn('Failed to setup CLS observer:', error);
      }
    }
  }

  private setupNavigationObserver(): void {
    if ('PerformanceObserver' in window) {
      try {
        const navObserver = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            const navEntry = entry as PerformanceNavigationTiming;

            // Time to First Byte
            const ttfb = navEntry.responseStart - navEntry.requestStart;
            this.webVitals.ttfb = ttfb;
            this.recordMetric('ttfb', ttfb, 'ms', 'network');

            // DOM Ready
            const domReady =
              navEntry.domContentLoadedEventEnd - navEntry.startTime;
            this.recordMetric('dom_ready', domReady, 'ms', 'load');

            // Window Load
            const windowLoad = navEntry.loadEventEnd - navEntry.startTime;
            this.recordMetric('window_load', windowLoad, 'ms', 'load');
          }
        });
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.set('navigation', navObserver);
      } catch (error) {
        console.warn('Failed to setup navigation observer:', error);
      }
    }
  }

  private setupResourceObserver(): void {
    if ('PerformanceObserver' in window) {
      try {
        const resourceObserver = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            const resourceEntry = entry as PerformanceResourceTiming;

            // Track slow resources
            const duration =
              resourceEntry.responseEnd - resourceEntry.startTime;
            if (duration > 1000) {
              // Resources taking more than 1 second
              this.recordMetric(
                `slow_resource_${resourceEntry.name.split('/').pop()}`,
                duration,
                'ms',
                'network'
              );
            }

            // Track failed resources
            if (
              resourceEntry.transferSize === 0 &&
              resourceEntry.decodedBodySize === 0
            ) {
              this.recordMetric(`failed_resource`, 1, 'count', 'network');
            }
          }
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.set('resource', resourceObserver);
      } catch (error) {
        console.warn('Failed to setup resource observer:', error);
      }
    }
  }

  private setupMemoryMonitoring(): void {
    // Monitor memory usage if available
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      if (memoryInfo) {
        this.recordMetric(
          'memory_used',
          memoryInfo.usedJSHeapSize / 1024 / 1024,
          'mb',
          'memory'
        );
        this.recordMetric(
          'memory_total',
          memoryInfo.totalJSHeapSize / 1024 / 1024,
          'mb',
          'memory'
        );
      }
    }
  }

  private startObservers(): void {
    // Observers are automatically started when created
  }

  private stopObservers(): void {
    this.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (error) {
        console.warn('Failed to disconnect observer:', error);
      }
    });
    this.observers.clear();
  }

  private measurePageLoad(): void {
    // Measure page load metrics when DOM is ready
    if (document.readyState === 'complete') {
      this.recordPageLoadMetrics();
    } else {
      window.addEventListener('load', () => {
        this.recordPageLoadMetrics();
      });
    }
  }

  private recordPageLoadMetrics(): void {
    const navigation = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming;

    if (navigation) {
      // DOM Ready
      const domReady =
        navigation.domContentLoadedEventEnd - navigation.startTime;
      this.recordMetric('page_dom_ready', domReady, 'ms', 'load');

      // Window Load
      const windowLoad = navigation.loadEventEnd - navigation.startTime;
      this.recordMetric('page_window_load', windowLoad, 'ms', 'load');

      // First Paint
      const paintEntries = performance.getEntriesByType('paint');
      const firstPaint = paintEntries.find(
        entry => entry.name === 'first-paint'
      );
      if (firstPaint) {
        this.recordMetric(
          'page_first_paint',
          firstPaint.startTime,
          'ms',
          'load'
        );
      }
    }
  }

  private scheduleMemoryCheck(): void {
    if (!this.isMonitoring) return;

    this.setupMemoryMonitoring();

    // Schedule next check
    setTimeout(() => {
      this.scheduleMemoryCheck();
    }, 30000); // Check every 30 seconds
  }

  private getPageLoadMetrics() {
    const domReady = this.getAverageMetric('page_dom_ready');
    const windowLoad = this.getAverageMetric('page_window_load');
    const firstPaint = this.getAverageMetric('page_first_paint');
    const firstContentfulPaint = this.webVitals.fcp || 0;

    return {
      domReady,
      windowLoad,
      firstPaint,
      firstContentfulPaint,
    };
  }

  private getCurrentMemoryUsage() {
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      if (memoryInfo) {
        const used = memoryInfo.usedJSHeapSize;
        const total = memoryInfo.totalJSHeapSize;
        const percentage = (used / total) * 100;

        return {
          used: Math.round(used / 1024 / 1024), // MB
          total: Math.round(total / 1024 / 1024), // MB
          percentage: Math.round(percentage),
        };
      }
    }

    return {
      used: 0,
      total: 0,
      percentage: 0,
    };
  }

  private getNetworkMetrics() {
    const networkMetrics = this.getMetricsByCategory('network');
    const requestCount = networkMetrics.filter(m =>
      m.name.includes('request')
    ).length;
    const responseTimes = networkMetrics
      .filter(m => m.name.includes('response_time'))
      .map(m => m.value);

    const averageResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0;

    const slowRequestCount = networkMetrics.filter(m =>
      m.name.includes('slow')
    ).length;

    const errorCount = networkMetrics.filter(
      m => m.name.includes('error') || m.name.includes('failed')
    ).length;

    return {
      requestCount,
      averageResponseTime: Math.round(averageResponseTime),
      slowRequestCount,
      errorCount,
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const report = {
      webVitals: this.webVitals,
      memoryUsage: this.getCurrentMemoryUsage(),
      networkMetrics: this.getNetworkMetrics(),
    };

    // FCP recommendations
    if (report.webVitals.fcp && report.webVitals.fcp > 2000) {
      recommendations.push(
        'First Contentful Paint is slow. Consider optimizing critical CSS and JavaScript.'
      );
    }

    // LCP recommendations
    if (report.webVitals.lcp && report.webVitals.lcp > 2500) {
      recommendations.push(
        'Largest Contentful Paint is slow. Consider optimizing images and server response times.'
      );
    }

    // FID recommendations
    if (report.webVitals.fid && report.webVitals.fid > 100) {
      recommendations.push(
        'First Input Delay is high. Consider breaking up long JavaScript tasks.'
      );
    }

    // CLS recommendations
    if (report.webVitals.cls && report.webVitals.cls > 0.1) {
      recommendations.push(
        'Cumulative Layout Shift is high. Consider adding size attributes to images and videos.'
      );
    }

    // Memory recommendations
    if (report.memoryUsage.percentage > 80) {
      recommendations.push(
        'Memory usage is high. Consider implementing memory optimization techniques.'
      );
    }

    // Network recommendations
    if (report.networkMetrics.averageResponseTime > 1000) {
      recommendations.push(
        'Average response time is high. Consider API optimization or caching.'
      );
    }

    if (report.networkMetrics.errorCount > 0) {
      recommendations.push(
        'Network errors detected. Consider implementing better error handling and retry logic.'
      );
    }

    return recommendations;
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  const [report, setReport] = React.useState<PerformanceReport | null>(null);

  React.useEffect(() => {
    performanceMonitor.startMonitoring();

    const interval = setInterval(() => {
      setReport(performanceMonitor.getPerformanceReport());
    }, 5000); // Update every 5 seconds

    return () => {
      clearInterval(interval);
      performanceMonitor.stopMonitoring();
    };
  }, []);

  return {
    report,
    recordMetric: performanceMonitor.recordMetric.bind(performanceMonitor),
    measureAsync: performanceMonitor.measureAsync.bind(performanceMonitor),
    measureSync: performanceMonitor.measureSync.bind(performanceMonitor),
    clearMetrics: performanceMonitor.clearMetrics.bind(performanceMonitor),
  };
};

// Higher-order component for measuring component render time
export const withPerformanceTracking = <P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) => {
  const WrappedComponent = (props: P) => {
    const renderStart = React.useRef<number>();

    // Measure render start
    renderStart.current = performance.now();

    React.useEffect(() => {
      // Measure render completion
      if (renderStart.current) {
        const renderTime = performance.now() - renderStart.current;
        const name =
          componentName || Component.displayName || Component.name || 'Unknown';
        performanceMonitor.recordMetric(
          `component_render_${name}`,
          renderTime,
          'ms',
          'custom'
        );
      }
    });

    return React.createElement(Component, props);
  };

  WrappedComponent.displayName = `withPerformanceTracking(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

// Utility to measure API call performance
export const measureApiCall = async <T>(
  name: string,
  apiCall: () => Promise<T>
): Promise<T> => {
  return performanceMonitor.measureAsync(`api_${name}`, apiCall);
};

// Export types
export type { PerformanceMetric, PerformanceReport, WebVitals };
export { PerformanceMonitor };

// Auto-start monitoring in production
if (import.meta.env.PROD) {
  performanceMonitor.startMonitoring();
}
