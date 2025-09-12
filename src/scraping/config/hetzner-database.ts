/**
 * Hetzner Database Configuration for Apartment Scraper
 * Production-ready database connection settings
 */

import { DatabaseConfig } from '../services/DatabaseService';

// Environment variables for Hetzner production database
const HETZNER_DB_CONFIG: DatabaseConfig = {
  host: process.env.HETZNER_DB_HOST || process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.HETZNER_DB_PORT || process.env.DB_PORT || '5432'),
  database: process.env.HETZNER_DB_NAME || process.env.DB_NAME || 'apartment_scraper',
  user: process.env.HETZNER_DB_USER || process.env.DB_USER || 'scraper_user',
  password: process.env.HETZNER_DB_PASSWORD || process.env.DB_PASSWORD || '',
  
  // Production SSL settings
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false, // Set to true with proper certificates
    ca: process.env.DB_SSL_CA,
    cert: process.env.DB_SSL_CERT,
    key: process.env.DB_SSL_KEY,
  } : false,
  
  // Connection pool settings optimized for scraping workloads
  max: parseInt(process.env.DB_POOL_SIZE || '20'), // Maximum number of clients
  min: parseInt(process.env.DB_POOL_MIN || '5'), // Minimum number of clients
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'), // 30 seconds
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000'), // 5 seconds
  
  // Query timeout for long-running operations
  query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT || '60000'), // 60 seconds
  
  // Application name for database monitoring
  application_name: process.env.DB_APPLICATION_NAME || 'apartment-scraper',
};

// Validation function to ensure all required config is present
export function validateHetznerConfig(): boolean {
  const required = ['host', 'database', 'user', 'password'];
  
  for (const field of required) {
    if (!HETZNER_DB_CONFIG[field as keyof DatabaseConfig]) {
      console.error(`❌ Missing required database configuration: ${field}`);
      return false;
    }
  }
  
  return true;
}

// Connection string builder for external tools
export function getHetznerConnectionString(): string {
  const config = HETZNER_DB_CONFIG;
  const ssl = config.ssl ? '?sslmode=require' : '';
  
  return `postgresql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}${ssl}`;
}

// Health check configuration
export const HEALTH_CHECK_CONFIG = {
  // How often to check database health (milliseconds)
  checkInterval: 30000, // 30 seconds
  
  // Maximum time to wait for health check response
  timeout: 5000, // 5 seconds
  
  // Number of failed checks before marking as unhealthy
  failureThreshold: 3,
  
  // Health check query
  query: 'SELECT 1 as health_check',
};

// Database monitoring queries
export const MONITORING_QUERIES = {
  // Active connections
  activeConnections: `
    SELECT 
      count(*) as total_connections,
      count(*) FILTER (WHERE state = 'active') as active_connections,
      count(*) FILTER (WHERE state = 'idle') as idle_connections
    FROM pg_stat_activity 
    WHERE datname = current_database()
  `,
  
  // Database size and statistics
  databaseStats: `
    SELECT 
      pg_size_pretty(pg_database_size(current_database())) as database_size,
      (SELECT count(*) FROM properties WHERE is_active = true) as active_properties,
      (SELECT count(*) FROM scraping_jobs WHERE status = 'running') as running_jobs,
      (SELECT count(*) FROM price_history WHERE date_recorded >= NOW() - INTERVAL '24 hours') as recent_price_updates
  `,
  
  // Top tables by size
  tableStats: `
    SELECT 
      schemaname,
      tablename,
      pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
      n_tup_ins + n_tup_upd + n_tup_del as total_operations
    FROM pg_tables 
    LEFT JOIN pg_stat_user_tables USING (schemaname, tablename)
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    LIMIT 10
  `,
  
  // Slow queries (if logging is enabled)
  slowQueries: `
    SELECT 
      query,
      mean_exec_time,
      calls,
      total_exec_time,
      rows,
      100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
    FROM pg_stat_statements 
    ORDER BY mean_exec_time DESC 
    LIMIT 10
  `,
};

// Export default configuration
export default HETZNER_DB_CONFIG;

// Environment-specific configurations
export const ENVIRONMENT_CONFIGS = {
  development: {
    ...HETZNER_DB_CONFIG,
    ssl: false,
    max: 10,
    idleTimeoutMillis: 10000,
  },
  
  staging: {
    ...HETZNER_DB_CONFIG,
    max: 15,
    application_name: 'apartment-scraper-staging',
  },
  
  production: {
    ...HETZNER_DB_CONFIG,
    ssl: process.env.DB_SSL_ENABLED === 'true',
    max: 25,
    application_name: 'apartment-scraper-production',
  },
};

// Get configuration based on environment
export function getEnvironmentConfig(): DatabaseConfig {
  const env = process.env.NODE_ENV || 'development';
  return ENVIRONMENT_CONFIGS[env as keyof typeof ENVIRONMENT_CONFIGS] || HETZNER_DB_CONFIG;
}

// Database migration settings
export const MIGRATION_CONFIG = {
  // Directory containing migration files
  migrationsDir: './migrations',
  
  // Table to store migration history
  migrationsTable: 'schema_migrations',
  
  // Lock timeout for migrations (milliseconds)
  lockTimeout: 300000, // 5 minutes
  
  // Whether to run migrations automatically on startup
  autoMigrate: process.env.AUTO_MIGRATE === 'true',
};

// Backup configuration
export const BACKUP_CONFIG = {
  // S3 bucket for remote backups (optional)
  s3Bucket: process.env.BACKUP_S3_BUCKET,
  s3Region: process.env.BACKUP_S3_REGION,
  s3AccessKey: process.env.BACKUP_S3_ACCESS_KEY,
  s3SecretKey: process.env.BACKUP_S3_SECRET_KEY,
  
  // Local backup directory
  localBackupDir: process.env.BACKUP_LOCAL_DIR || './backups',
  
  // Backup retention (days)
  retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '7'),
  
  // Backup schedule (cron format)
  schedule: process.env.BACKUP_SCHEDULE || '0 2 * * *', // Daily at 2 AM
  
  // Compression level (0-9)
  compressionLevel: parseInt(process.env.BACKUP_COMPRESSION || '6'),
};

// Performance tuning settings
export const PERFORMANCE_CONFIG = {
  // Connection pool settings
  poolSize: {
    min: parseInt(process.env.DB_POOL_MIN || '5'),
    max: parseInt(process.env.DB_POOL_MAX || '20'),
    acquire: parseInt(process.env.DB_POOL_ACQUIRE_TIMEOUT || '30000'),
    idle: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '10000'),
  },
  
  // Query optimization
  queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT || '60000'),
  statementTimeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '300000'),
  
  // Batch processing
  batchSize: parseInt(process.env.DB_BATCH_SIZE || '1000'),
  maxConcurrentQueries: parseInt(process.env.DB_MAX_CONCURRENT_QUERIES || '10'),
  
  // Cache settings
  cacheEnabled: process.env.DB_CACHE_ENABLED === 'true',
  cacheTTL: parseInt(process.env.DB_CACHE_TTL || '300'), // 5 minutes
};

// Logging configuration
export const LOGGING_CONFIG = {
  // Log level for database operations
  level: process.env.DB_LOG_LEVEL || 'info',
  
  // Log slow queries (milliseconds)
  slowQueryThreshold: parseInt(process.env.DB_SLOW_QUERY_THRESHOLD || '1000'),
  
  // Log all queries in development
  logQueries: process.env.DB_LOG_QUERIES === 'true' || process.env.NODE_ENV === 'development',
  
  // Log connection events
  logConnections: process.env.DB_LOG_CONNECTIONS === 'true',
  
  // Log file path
  logFile: process.env.DB_LOG_FILE || './logs/database.log',
};