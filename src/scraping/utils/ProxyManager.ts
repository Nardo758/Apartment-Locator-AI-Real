/**
 * Proxy management for rotating proxies to avoid IP bans
 */

import { ProxyManager } from '../core/types';
import { Logger } from './Logger';

export interface ProxyConfig {
  url: string;
  username?: string;
  password?: string;
  type: 'http' | 'https' | 'socks4' | 'socks5';
  lastUsed?: number;
  failureCount: number;
  isHealthy: boolean;
  responseTime?: number;
}

export class ProxyManagerImpl implements ProxyManager {
  private proxies: ProxyConfig[] = [];
  private currentIndex: number = 0;
  private readonly maxFailures: number = 3;
  private readonly healthCheckInterval: number = 300000; // 5 minutes
  private readonly logger: Logger;
  private healthCheckTimer?: NodeJS.Timeout;

  constructor(proxyUrls: string[] = []) {
    this.logger = new Logger('ProxyManager');
    this.initializeProxies(proxyUrls);
    this.startHealthChecks();
  }

  private initializeProxies(proxyUrls: string[]): void {
    this.proxies = proxyUrls.map(url => ({
      url,
      type: this.detectProxyType(url),
      failureCount: 0,
      isHealthy: true
    }));
    
    this.logger.info(`Initialized ${this.proxies.length} proxies`);
  }

  private detectProxyType(url: string): ProxyConfig['type'] {
    if (url.startsWith('socks5://')) return 'socks5';
    if (url.startsWith('socks4://')) return 'socks4';
    if (url.startsWith('https://')) return 'https';
    return 'http';
  }

  getNextProxy(): string | null {
    const healthyProxies = this.proxies.filter(p => p.isHealthy);
    
    if (healthyProxies.length === 0) {
      this.logger.warn('No healthy proxies available');
      return null;
    }

    // Round-robin selection among healthy proxies
    const proxy = healthyProxies[this.currentIndex % healthyProxies.length];
    this.currentIndex++;
    
    proxy.lastUsed = Date.now();
    
    this.logger.debug(`Selected proxy: ${this.maskProxyUrl(proxy.url)}`);
    return proxy.url;
  }

  markProxyFailed(proxyUrl: string): void {
    const proxy = this.proxies.find(p => p.url === proxyUrl);
    
    if (proxy) {
      proxy.failureCount++;
      
      if (proxy.failureCount >= this.maxFailures) {
        proxy.isHealthy = false;
        this.logger.warn(`Proxy marked as unhealthy: ${this.maskProxyUrl(proxyUrl)}`);
      }
    }
  }

  markProxySuccessful(proxyUrl: string, responseTime?: number): void {
    const proxy = this.proxies.find(p => p.url === proxyUrl);
    
    if (proxy) {
      proxy.failureCount = Math.max(0, proxy.failureCount - 1);
      proxy.responseTime = responseTime;
      
      if (!proxy.isHealthy && proxy.failureCount === 0) {
        proxy.isHealthy = true;
        this.logger.info(`Proxy restored to healthy: ${this.maskProxyUrl(proxyUrl)}`);
      }
    }
  }

  getHealthyProxyCount(): number {
    return this.proxies.filter(p => p.isHealthy).length;
  }

  getTotalProxyCount(): number {
    return this.proxies.length;
  }

  getProxyStats(): {
    total: number;
    healthy: number;
    unhealthy: number;
    averageResponseTime: number;
  } {
    const healthy = this.proxies.filter(p => p.isHealthy);
    const unhealthy = this.proxies.filter(p => !p.isHealthy);
    
    const responseTimes = this.proxies
      .filter(p => p.responseTime !== undefined)
      .map(p => p.responseTime!);
    
    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

    return {
      total: this.proxies.length,
      healthy: healthy.length,
      unhealthy: unhealthy.length,
      averageResponseTime
    };
  }

  addProxy(proxyUrl: string): void {
    if (this.proxies.some(p => p.url === proxyUrl)) {
      this.logger.warn(`Proxy already exists: ${this.maskProxyUrl(proxyUrl)}`);
      return;
    }

    const proxy: ProxyConfig = {
      url: proxyUrl,
      type: this.detectProxyType(proxyUrl),
      failureCount: 0,
      isHealthy: true
    };

    this.proxies.push(proxy);
    this.logger.info(`Added new proxy: ${this.maskProxyUrl(proxyUrl)}`);
  }

  removeProxy(proxyUrl: string): void {
    const index = this.proxies.findIndex(p => p.url === proxyUrl);
    
    if (index !== -1) {
      this.proxies.splice(index, 1);
      this.logger.info(`Removed proxy: ${this.maskProxyUrl(proxyUrl)}`);
    }
  }

  private async startHealthChecks(): Promise<void> {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    this.healthCheckTimer = setInterval(async () => {
      await this.performHealthChecks();
    }, this.healthCheckInterval);
  }

  private async performHealthChecks(): Promise<void> {
    this.logger.info('Starting proxy health checks');
    
    const healthCheckPromises = this.proxies.map(async (proxy) => {
      try {
        const startTime = Date.now();
        
        // Simple health check - try to fetch a lightweight endpoint
        const response = await this.testProxy(proxy.url);
        const responseTime = Date.now() - startTime;
        
        if (response.ok) {
          this.markProxySuccessful(proxy.url, responseTime);
        } else {
          this.markProxyFailed(proxy.url);
        }
      } catch (error) {
        this.markProxyFailed(proxy.url);
      }
    });

    await Promise.allSettled(healthCheckPromises);
    
    const stats = this.getProxyStats();
    this.logger.info(`Health check complete: ${stats.healthy}/${stats.total} proxies healthy`);
  }

  private async testProxy(proxyUrl: string): Promise<Response> {
    // In a real implementation, you would configure the fetch request to use the proxy
    // This is a simplified version
    const testUrl = 'https://httpbin.org/ip';
    
    // Note: This is a placeholder. In a real implementation, you'd need to:
    // 1. Configure your HTTP client to use the proxy
    // 2. Make a test request through the proxy
    // 3. Verify the response indicates the proxy is working
    
    return fetch(testUrl, {
      method: 'GET',
      timeout: 10000
    });
  }

  private maskProxyUrl(url: string): string {
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.username || parsedUrl.password) {
        return `${parsedUrl.protocol}//*:*@${parsedUrl.host}`;
      }
      return `${parsedUrl.protocol}//${parsedUrl.host}`;
    } catch {
      return url.replace(/\/\/.*@/, '//***:***@');
    }
  }

  destroy(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }
  }
}

/**
 * Smart proxy selector that chooses proxies based on performance and location
 */
export class SmartProxySelector extends ProxyManagerImpl {
  private locationPreference: string[] = [];
  private performanceWeights: Map<string, number> = new Map();

  constructor(proxyUrls: string[], locationPreference: string[] = []) {
    super(proxyUrls);
    this.locationPreference = locationPreference;
  }

  getNextProxy(): string | null {
    const healthyProxies = this.proxies.filter(p => p.isHealthy);
    
    if (healthyProxies.length === 0) {
      return null;
    }

    // Score proxies based on performance and location preference
    const scoredProxies = healthyProxies.map(proxy => ({
      proxy,
      score: this.calculateProxyScore(proxy)
    }));

    // Sort by score (higher is better)
    scoredProxies.sort((a, b) => b.score - a.score);

    // Add some randomness to avoid always using the same proxy
    const topProxies = scoredProxies.slice(0, Math.min(3, scoredProxies.length));
    const selectedProxy = topProxies[Math.floor(Math.random() * topProxies.length)];

    selectedProxy.proxy.lastUsed = Date.now();
    return selectedProxy.proxy.url;
  }

  private calculateProxyScore(proxy: ProxyConfig): number {
    let score = 100; // Base score

    // Penalize for failures
    score -= proxy.failureCount * 20;

    // Reward for good response time
    if (proxy.responseTime) {
      score += Math.max(0, 50 - (proxy.responseTime / 100));
    }

    // Reward for location preference (if we had location data)
    // This would require additional proxy metadata

    // Penalize recently used proxies to encourage rotation
    if (proxy.lastUsed) {
      const timeSinceLastUse = Date.now() - proxy.lastUsed;
      const hoursSinceLastUse = timeSinceLastUse / (1000 * 60 * 60);
      score += Math.min(20, hoursSinceLastUse * 2);
    }

    return score;
  }

  updatePerformanceWeight(proxyUrl: string, weight: number): void {
    this.performanceWeights.set(proxyUrl, weight);
  }

  getProxyPerformanceReport(): Array<{
    url: string;
    isHealthy: boolean;
    failureCount: number;
    responseTime?: number;
    lastUsed?: number;
    score: number;
  }> {
    return this.proxies.map(proxy => ({
      url: this.maskProxyUrl(proxy.url),
      isHealthy: proxy.isHealthy,
      failureCount: proxy.failureCount,
      responseTime: proxy.responseTime,
      lastUsed: proxy.lastUsed,
      score: this.calculateProxyScore(proxy)
    }));
  }
}