/**
 * Structured logging utility for the scraping framework
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  logger: string;
  message: string;
  metadata?: Record<string, any>;
  error?: Error;
}

export class Logger {
  private readonly name: string;
  private readonly minLevel: LogLevel;

  private static readonly LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };

  constructor(name: string, minLevel: LogLevel = 'info') {
    this.name = name;
    this.minLevel = minLevel;
  }

  debug(message: string, metadata?: Record<string, any>): void {
    this.log('debug', message, metadata);
  }

  info(message: string, metadata?: Record<string, any>): void {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: Record<string, any>): void {
    this.log('warn', message, metadata);
  }

  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    this.log('error', message, metadata, error);
  }

  private log(
    level: LogLevel, 
    message: string, 
    metadata?: Record<string, any>, 
    error?: Error
  ): void {
    if (Logger.LEVELS[level] < Logger.LEVELS[this.minLevel]) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      logger: this.name,
      message,
      metadata,
      error
    };

    this.output(entry);
  }

  private output(entry: LogEntry): void {
    // In a production environment, you might send logs to a service like
    // Winston, Bunyan, or a cloud logging service
    
    const logMessage = this.formatLogEntry(entry);
    
    switch (entry.level) {
      case 'debug':
        console.debug(logMessage);
        break;
      case 'info':
        console.info(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      case 'error':
        console.error(logMessage);
        if (entry.error) {
          console.error(entry.error.stack);
        }
        break;
    }
  }

  private formatLogEntry(entry: LogEntry): string {
    const { timestamp, level, logger, message, metadata } = entry;
    
    let formatted = `[${timestamp}] ${level.toUpperCase()} [${logger}] ${message}`;
    
    if (metadata && Object.keys(metadata).length > 0) {
      formatted += ` ${JSON.stringify(metadata)}`;
    }
    
    return formatted;
  }

  // Create child logger with additional context
  child(context: Record<string, any>): Logger {
    return new ContextLogger(this.name, this.minLevel, context);
  }
}

class ContextLogger extends Logger {
  private readonly context: Record<string, any>;

  constructor(name: string, minLevel: LogLevel, context: Record<string, any>) {
    super(name, minLevel);
    this.context = context;
  }

  protected log(
    level: LogLevel, 
    message: string, 
    metadata?: Record<string, any>, 
    error?: Error
  ): void {
    const combinedMetadata = { ...this.context, ...metadata };
    super['log'](level, message, combinedMetadata, error);
  }
}

// Performance logging utility
export class PerformanceLogger extends Logger {
  private timers: Map<string, number> = new Map();

  startTimer(name: string): void {
    this.timers.set(name, Date.now());
    this.debug(`Timer started: ${name}`);
  }

  endTimer(name: string, metadata?: Record<string, any>): number {
    const startTime = this.timers.get(name);
    
    if (!startTime) {
      this.warn(`Timer '${name}' was not started`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(name);

    this.info(`Timer completed: ${name}`, {
      duration: `${duration}ms`,
      ...metadata
    });

    return duration;
  }

  measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startTimer(name);
    
    return fn()
      .then(result => {
        this.endTimer(name, { status: 'success' });
        return result;
      })
      .catch(error => {
        this.endTimer(name, { status: 'error', error: error.message });
        throw error;
      });
  }

  measure<T>(name: string, fn: () => T): T {
    this.startTimer(name);
    
    try {
      const result = fn();
      this.endTimer(name, { status: 'success' });
      return result;
    } catch (error) {
      this.endTimer(name, { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }
}

// Scraping-specific logger with additional context
export class ScrapingLogger extends PerformanceLogger {
  private scrapingContext: {
    source?: string;
    city?: string;
    state?: string;
    sessionId?: string;
  } = {};

  setScrapingContext(context: Partial<typeof this.scrapingContext>): void {
    this.scrapingContext = { ...this.scrapingContext, ...context };
  }

  logScrapingStart(source: string, city: string, state: string): void {
    this.setScrapingContext({ source, city, state, sessionId: this.generateSessionId() });
    this.info('Scraping session started', this.scrapingContext);
  }

  logScrapingEnd(
    propertiesFound: number, 
    propertiesProcessed: number, 
    errors: number
  ): void {
    this.info('Scraping session completed', {
      ...this.scrapingContext,
      propertiesFound,
      propertiesProcessed,
      errors,
      successRate: propertiesProcessed / Math.max(propertiesFound, 1)
    });
  }

  logPageScraping(page: number, totalPages: number, propertiesFound: number): void {
    this.debug('Page scraped', {
      ...this.scrapingContext,
      page,
      totalPages,
      propertiesFound,
      progress: `${page}/${totalPages}`
    });
  }

  logPropertyValidation(propertyId: string, isValid: boolean, errors: string[]): void {
    this.debug('Property validated', {
      ...this.scrapingContext,
      propertyId,
      isValid,
      errorCount: errors.length,
      errors: errors.slice(0, 3) // Limit to first 3 errors to avoid log spam
    });
  }

  logRateLimit(waitTime: number): void {
    this.debug('Rate limit applied', {
      ...this.scrapingContext,
      waitTime: `${waitTime}ms`
    });
  }

  logProxySwitch(oldProxy: string | null, newProxy: string | null): void {
    this.debug('Proxy switched', {
      ...this.scrapingContext,
      oldProxy: this.maskProxy(oldProxy),
      newProxy: this.maskProxy(newProxy)
    });
  }

  logRetry(attempt: number, maxAttempts: number, error: string): void {
    this.warn('Retrying request', {
      ...this.scrapingContext,
      attempt,
      maxAttempts,
      error
    });
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private maskProxy(proxy: string | null): string | null {
    if (!proxy) return null;
    
    try {
      const url = new URL(proxy);
      return `${url.protocol}//${url.hostname}:${url.port}`;
    } catch {
      return proxy.replace(/\/\/.*@/, '//***:***@');
    }
  }
}

// Global logger instances
export const globalLogger = new Logger('Global');
export const scrapingLogger = new ScrapingLogger('Scraping');

// Utility function to create domain-specific loggers
export function createLogger(name: string, level: LogLevel = 'info'): Logger {
  return new Logger(name, level);
}