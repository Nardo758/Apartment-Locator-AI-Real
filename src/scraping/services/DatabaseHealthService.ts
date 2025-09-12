/**
 * Database Health Monitoring Service for Hetzner PostgreSQL
 * Monitors database performance, connections, and provides alerts
 */

import { Pool } from 'pg';
import { scrapingLogger } from '../utils/Logger';
import { 
  HEALTH_CHECK_CONFIG, 
  MONITORING_QUERIES, 
  getEnvironmentConfig 
} from '../config/hetzner-database';

export interface DatabaseHealth {
  isHealthy: boolean;
  timestamp: Date;
  responseTime: number;
  connections: {
    total: number;
    active: number;
    idle: number;
  };
  database: {
    size: string;
    activeProperties: number;
    runningJobs: number;
    recentUpdates: number;
  };
  performance: {
    slowQueries: Array<{
      query: string;
      meanTime: number;
      calls: number;
      hitPercent: number;
    }>;
    topTables: Array<{
      table: string;
      size: string;
      operations: number;
    }>;
  };
  errors: string[];
}

export class DatabaseHealthService {
  private pool: Pool;
  private logger = scrapingLogger;
  private healthCheckInterval?: NodeJS.Timeout;
  private lastHealthCheck?: DatabaseHealth;
  private consecutiveFailures = 0;

  constructor() {
    const config = getEnvironmentConfig();
    this.pool = new Pool(config);
    
    this.pool.on('error', (err) => {
      this.logger.error('Database health check pool error', err);
    });
  }

  /**
   * Start continuous health monitoring
   */
  startMonitoring(): void {
    if (this.healthCheckInterval) {
      this.stopMonitoring();
    }

    this.logger.info('Starting database health monitoring', {
      interval: HEALTH_CHECK_CONFIG.checkInterval,
      timeout: HEALTH_CHECK_CONFIG.timeout,
      failureThreshold: HEALTH_CHECK_CONFIG.failureThreshold
    });

    // Run initial check
    this.performHealthCheck();

    // Schedule periodic checks
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, HEALTH_CHECK_CONFIG.checkInterval);
  }

  /**
   * Stop health monitoring
   */
  stopMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
      this.logger.info('Stopped database health monitoring');
    }
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(): Promise<DatabaseHealth> {
    const startTime = Date.now();
    const errors: string[] = [];
    
    let health: Partial<DatabaseHealth> = {
      timestamp: new Date(),
      isHealthy: true,
      errors: []
    };

    try {
      // Basic connectivity test
      const client = await this.pool.connect();
      
      try {
        // Test basic query
        await client.query(HEALTH_CHECK_CONFIG.query);
        health.responseTime = Date.now() - startTime;

        // Get connection statistics
        const connResult = await client.query(MONITORING_QUERIES.activeConnections);
        health.connections = {
          total: parseInt(connResult.rows[0].total_connections),
          active: parseInt(connResult.rows[0].active_connections),
          idle: parseInt(connResult.rows[0].idle_connections)
        };

        // Get database statistics
        const dbResult = await client.query(MONITORING_QUERIES.databaseStats);
        health.database = {
          size: dbResult.rows[0].database_size,
          activeProperties: parseInt(dbResult.rows[0].active_properties || '0'),
          runningJobs: parseInt(dbResult.rows[0].running_jobs || '0'),
          recentUpdates: parseInt(dbResult.rows[0].recent_price_updates || '0')
        };

        // Get performance metrics
        try {
          const tableResult = await client.query(MONITORING_QUERIES.tableStats);
          health.performance = {
            topTables: tableResult.rows.map(row => ({
              table: row.tablename,
              size: row.size,
              operations: parseInt(row.total_operations || '0')
            })),
            slowQueries: [] // Will be populated if pg_stat_statements is available
          };

          // Try to get slow queries (requires pg_stat_statements extension)
          try {
            const slowResult = await client.query(MONITORING_QUERIES.slowQueries);
            health.performance!.slowQueries = slowResult.rows.map(row => ({
              query: row.query.substring(0, 100) + '...', // Truncate for readability
              meanTime: parseFloat(row.mean_exec_time || '0'),
              calls: parseInt(row.calls || '0'),
              hitPercent: parseFloat(row.hit_percent || '0')
            }));
          } catch (slowQueryError) {
            // pg_stat_statements not available, skip slow query monitoring
            this.logger.debug('pg_stat_statements not available for slow query monitoring');
          }
        } catch (perfError) {
          errors.push(`Performance metrics error: ${perfError.message}`);
        }

      } finally {
        client.release();
      }

      // Reset failure counter on successful check
      this.consecutiveFailures = 0;

    } catch (error) {
      this.consecutiveFailures++;
      health.isHealthy = false;
      health.responseTime = Date.now() - startTime;
      errors.push(`Database connection failed: ${error.message}`);

      this.logger.error('Database health check failed', {
        error: error.message,
        consecutiveFailures: this.consecutiveFailures,
        threshold: HEALTH_CHECK_CONFIG.failureThreshold
      });

      // Set default values for failed check
      health.connections = { total: 0, active: 0, idle: 0 };
      health.database = { size: 'Unknown', activeProperties: 0, runningJobs: 0, recentUpdates: 0 };
      health.performance = { topTables: [], slowQueries: [] };
    }

    // Check if we've exceeded failure threshold
    if (this.consecutiveFailures >= HEALTH_CHECK_CONFIG.failureThreshold) {
      health.isHealthy = false;
      errors.push(`Exceeded failure threshold (${this.consecutiveFailures}/${HEALTH_CHECK_CONFIG.failureThreshold})`);
    }

    health.errors = errors;
    this.lastHealthCheck = health as DatabaseHealth;

    // Log health status
    if (health.isHealthy) {
      this.logger.debug('Database health check passed', {
        responseTime: health.responseTime,
        connections: health.connections,
        database: health.database
      });
    } else {
      this.logger.warn('Database health check failed', {
        errors,
        consecutiveFailures: this.consecutiveFailures
      });
    }

    return this.lastHealthCheck;
  }

  /**
   * Get last health check result
   */
  getLastHealthCheck(): DatabaseHealth | undefined {
    return this.lastHealthCheck;
  }

  /**
   * Check if database is currently healthy
   */
  isHealthy(): boolean {
    return this.lastHealthCheck?.isHealthy ?? false;
  }

  /**
   * Get database connection pool statistics
   */
  getPoolStats(): {
    totalConnections: number;
    idleConnections: number;
    waitingClients: number;
  } {
    return {
      totalConnections: this.pool.totalCount,
      idleConnections: this.pool.idleCount,
      waitingClients: this.pool.waitingCount
    };
  }

  /**
   * Force a health check and return result
   */
  async checkNow(): Promise<DatabaseHealth> {
    return await this.performHealthCheck();
  }

  /**
   * Get health summary for monitoring endpoints
   */
  getHealthSummary(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    uptime: number;
    lastCheck: Date | null;
    responseTime: number | null;
    errors: string[];
  } {
    const health = this.lastHealthCheck;
    
    if (!health) {
      return {
        status: 'unhealthy',
        uptime: 0,
        lastCheck: null,
        responseTime: null,
        errors: ['No health checks performed']
      };
    }

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (!health.isHealthy) {
      status = 'unhealthy';
    } else if (health.responseTime > 1000 || health.errors.length > 0) {
      status = 'degraded';
    }

    return {
      status,
      uptime: Date.now() - health.timestamp.getTime(),
      lastCheck: health.timestamp,
      responseTime: health.responseTime,
      errors: health.errors
    };
  }

  /**
   * Generate health report for monitoring dashboards
   */
  async generateHealthReport(): Promise<{
    timestamp: Date;
    overall: 'healthy' | 'degraded' | 'unhealthy';
    details: DatabaseHealth;
    recommendations: string[];
  }> {
    const health = await this.checkNow();
    const recommendations: string[] = [];

    // Analyze health and generate recommendations
    if (health.connections.active > health.connections.total * 0.8) {
      recommendations.push('High connection usage detected. Consider increasing pool size.');
    }

    if (health.responseTime > 1000) {
      recommendations.push('Slow database response times. Check for long-running queries.');
    }

    if (health.performance.slowQueries.length > 0) {
      const slowest = health.performance.slowQueries[0];
      if (slowest.meanTime > 5000) {
        recommendations.push(`Very slow query detected: ${slowest.meanTime}ms average`);
      }
    }

    if (health.database.runningJobs > 10) {
      recommendations.push('High number of running scraping jobs. Monitor for stuck jobs.');
    }

    const overall = health.isHealthy ? 
      (recommendations.length > 0 ? 'degraded' : 'healthy') : 
      'unhealthy';

    return {
      timestamp: new Date(),
      overall,
      details: health,
      recommendations
    };
  }

  /**
   * Clean up resources
   */
  async close(): Promise<void> {
    this.stopMonitoring();
    await this.pool.end();
    this.logger.info('Database health service closed');
  }
}

// Create singleton instance
export const databaseHealthService = new DatabaseHealthService();