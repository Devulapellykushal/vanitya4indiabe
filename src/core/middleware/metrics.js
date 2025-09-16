/**
 * Metrics collection middleware for monitoring and observability
 */
class MetricsMiddleware {
  constructor() {
    this.requestCounts = new Map();
    this.responseTimes = new Map();
    this.errorCounts = new Map();
    this.activeConnections = 0;
  }

  collect() {
    return (req, res, next) => {
      const startTime = Date.now();
      const route = this.getRoutePattern(req);
      
      this.activeConnections++;
      
      // Track request count
      this.incrementCounter(this.requestCounts, route);
      
      // Override res.end to capture metrics
      const originalEnd = res.end;
      res.end = (...args) => {
        const responseTime = Date.now() - startTime;
        
        // Track response time
        this.recordResponseTime(route, responseTime);
        
        // Track errors
        if (res.statusCode >= 400) {
          this.incrementCounter(this.errorCounts, `${route}:${res.statusCode}`);
        }
        
        this.activeConnections--;
        
        // Log metrics for this request
        this.logRequestMetrics(req, res, responseTime);
        
        originalEnd.apply(res, args);
      };
      
      next();
    };
  }

  getRoutePattern(req) {
    // Extract route pattern (remove dynamic segments)
    let route = req.route?.path || req.url;
    if (req.baseUrl) {
      route = req.baseUrl + route;
    }
    
    // Normalize dynamic segments
    route = route.replace(/\/:\w+/g, '/:id');
    
    return `${req.method} ${route}`;
  }

  incrementCounter(map, key) {
    map.set(key, (map.get(key) || 0) + 1);
  }

  recordResponseTime(route, responseTime) {
    if (!this.responseTimes.has(route)) {
      this.responseTimes.set(route, []);
    }
    
    const times = this.responseTimes.get(route);
    times.push(responseTime);
    
    // Keep only last 100 measurements per route
    if (times.length > 100) {
      times.splice(0, times.length - 100);
    }
  }

  logRequestMetrics(req, res, responseTime) {
    const shouldLog = responseTime > 1000 || res.statusCode >= 400;
    
    if (shouldLog) {
      console.log(`Request metrics:`, {
        requestId: req.id,
        method: req.method,
        url: req.url,
        status: res.statusCode,
        responseTime: `${responseTime}ms`,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
        timestamp: new Date().toISOString()
      });
    }
  }

  getMetrics() {
    const metrics = {
      timestamp: new Date().toISOString(),
      activeConnections: this.activeConnections,
      requests: Object.fromEntries(this.requestCounts),
      errors: Object.fromEntries(this.errorCounts),
      responseTimes: {}
    };

    // Calculate response time statistics
    for (const [route, times] of this.responseTimes.entries()) {
      if (times.length > 0) {
        const sorted = [...times].sort((a, b) => a - b);
        metrics.responseTimes[route] = {
          count: times.length,
          min: Math.min(...times),
          max: Math.max(...times),
          avg: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
          p50: sorted[Math.floor(sorted.length * 0.5)],
          p95: sorted[Math.floor(sorted.length * 0.95)],
          p99: sorted[Math.floor(sorted.length * 0.99)]
        };
      }
    }

    return metrics;
  }

  resetMetrics() {
    this.requestCounts.clear();
    this.responseTimes.clear();
    this.errorCounts.clear();
  }

  healthCheck() {
    return (req, res) => {
      const metrics = this.getMetrics();
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        metrics: {
          activeConnections: metrics.activeConnections,
          totalRequests: Object.values(metrics.requests).reduce((a, b) => a + b, 0),
          totalErrors: Object.values(metrics.errors).reduce((a, b) => a + b, 0)
        }
      };

      res.status(200).json(health);
    };
  }
}

// Export singleton instance
module.exports = new MetricsMiddleware();