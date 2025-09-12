/**
 * Rate limiter implementation to prevent overwhelming target websites
 */

import { RateLimiter } from '../core/types';

export class RateLimiterImpl implements RateLimiter {
  private requestTimes: number[] = [];
  private readonly maxRequestsPerSecond: number;
  private readonly windowSizeMs: number = 1000; // 1 second window

  constructor(requestsPerSecond: number) {
    this.maxRequestsPerSecond = requestsPerSecond;
  }

  async canProceed(): Promise<boolean> {
    const now = Date.now();
    
    // Remove old requests outside the time window
    this.requestTimes = this.requestTimes.filter(
      time => now - time < this.windowSizeMs
    );

    // Check if we can make another request
    if (this.requestTimes.length < this.maxRequestsPerSecond) {
      return true;
    }

    // Need to wait
    const waitTime = await this.waitTime();
    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    return true;
  }

  async waitTime(): Promise<number> {
    const now = Date.now();
    
    // Remove old requests
    this.requestTimes = this.requestTimes.filter(
      time => now - time < this.windowSizeMs
    );

    if (this.requestTimes.length < this.maxRequestsPerSecond) {
      return 0;
    }

    // Calculate wait time based on oldest request in the window
    const oldestRequest = Math.min(...this.requestTimes);
    const waitTime = this.windowSizeMs - (now - oldestRequest);
    
    return Math.max(0, waitTime);
  }

  recordRequest(): void {
    this.requestTimes.push(Date.now());
  }

  // Additional methods for monitoring
  getCurrentRequestCount(): number {
    const now = Date.now();
    return this.requestTimes.filter(time => now - time < this.windowSizeMs).length;
  }

  getRemainingRequests(): number {
    return Math.max(0, this.maxRequestsPerSecond - this.getCurrentRequestCount());
  }

  reset(): void {
    this.requestTimes = [];
  }
}

/**
 * Token bucket rate limiter for more sophisticated rate limiting
 */
export class TokenBucketRateLimiter implements RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly capacity: number;
  private readonly refillRate: number; // tokens per second
  private readonly refillInterval: number = 100; // ms

  constructor(capacity: number, refillRate: number) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  async canProceed(): Promise<boolean> {
    this.refillTokens();

    if (this.tokens >= 1) {
      return true;
    }

    const waitTime = await this.waitTime();
    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.canProceed();
    }

    return false;
  }

  async waitTime(): Promise<number> {
    this.refillTokens();
    
    if (this.tokens >= 1) {
      return 0;
    }

    // Calculate time needed to get at least 1 token
    const tokensNeeded = 1 - this.tokens;
    const timeNeeded = (tokensNeeded / this.refillRate) * 1000; // convert to ms
    
    return Math.ceil(timeNeeded);
  }

  recordRequest(): void {
    this.refillTokens();
    this.tokens = Math.max(0, this.tokens - 1);
  }

  private refillTokens(): void {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000; // convert to seconds
    const tokensToAdd = timePassed * this.refillRate;
    
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  getTokenCount(): number {
    this.refillTokens();
    return this.tokens;
  }

  reset(): void {
    this.tokens = this.capacity;
    this.lastRefill = Date.now();
  }
}

/**
 * Adaptive rate limiter that adjusts based on response times and errors
 */
export class AdaptiveRateLimiter implements RateLimiter {
  private baseLimiter: RateLimiterImpl;
  private currentRate: number;
  private readonly minRate: number;
  private readonly maxRate: number;
  private recentErrors: number = 0;
  private recentRequests: number = 0;
  private lastAdjustment: number = Date.now();
  private readonly adjustmentInterval: number = 30000; // 30 seconds

  constructor(
    initialRate: number,
    minRate: number = 0.5,
    maxRate: number = 10
  ) {
    this.currentRate = initialRate;
    this.minRate = minRate;
    this.maxRate = maxRate;
    this.baseLimiter = new RateLimiterImpl(initialRate);
  }

  async canProceed(): Promise<boolean> {
    this.adjustRateIfNeeded();
    return this.baseLimiter.canProceed();
  }

  async waitTime(): Promise<number> {
    return this.baseLimiter.waitTime();
  }

  recordRequest(): void {
    this.baseLimiter.recordRequest();
    this.recentRequests++;
  }

  recordError(): void {
    this.recentErrors++;
  }

  recordSuccess(): void {
    // Success recorded implicitly by not calling recordError
  }

  private adjustRateIfNeeded(): void {
    const now = Date.now();
    
    if (now - this.lastAdjustment < this.adjustmentInterval) {
      return;
    }

    if (this.recentRequests === 0) {
      this.resetCounters();
      return;
    }

    const errorRate = this.recentErrors / this.recentRequests;
    
    // Adjust rate based on error rate
    if (errorRate > 0.1) { // More than 10% errors
      this.currentRate = Math.max(this.minRate, this.currentRate * 0.7);
    } else if (errorRate < 0.02) { // Less than 2% errors
      this.currentRate = Math.min(this.maxRate, this.currentRate * 1.2);
    }

    // Update the base limiter with new rate
    this.baseLimiter = new RateLimiterImpl(this.currentRate);
    this.resetCounters();
  }

  private resetCounters(): void {
    this.recentErrors = 0;
    this.recentRequests = 0;
    this.lastAdjustment = Date.now();
  }

  getCurrentRate(): number {
    return this.currentRate;
  }

  getStats(): {
    currentRate: number;
    errorRate: number;
    recentRequests: number;
    recentErrors: number;
  } {
    const errorRate = this.recentRequests > 0 ? this.recentErrors / this.recentRequests : 0;
    
    return {
      currentRate: this.currentRate,
      errorRate,
      recentRequests: this.recentRequests,
      recentErrors: this.recentErrors
    };
  }
}