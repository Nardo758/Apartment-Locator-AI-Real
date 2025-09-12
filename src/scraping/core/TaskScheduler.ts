/**
 * Task scheduler for automated scraping jobs
 */

import { ScrapingJob, ScrapingOptions, TargetCity } from './types';
import { scraperOrchestrator } from './ScraperOrchestrator';
import { targetCities } from '../config/settings';
import { scrapingLogger } from '../utils/Logger';

export interface ScheduledTask {
  id: string;
  name: string;
  schedule: string; // Cron expression
  enabled: boolean;
  lastRun?: Date;
  nextRun: Date;
  options: ScrapingOptions;
  targets: Array<{
    source: string;
    cities: TargetCity[];
  }>;
}

export class TaskScheduler {
  private tasks: Map<string, ScheduledTask> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private isRunning: boolean = false;

  constructor() {
    this.initializeDefaultTasks();
  }

  private initializeDefaultTasks(): void {
    // Daily comprehensive scraping
    this.addTask({
      id: 'daily_scrape_all',
      name: 'Daily Comprehensive Scraping',
      schedule: '0 2 * * *', // 2 AM daily
      enabled: true,
      nextRun: this.calculateNextRun('0 2 * * *'),
      options: {
        maxPages: 10,
        forceRefresh: true
      },
      targets: [
        {
          source: 'apartments.com',
          cities: targetCities.filter(c => c.priority <= 2)
        },
        {
          source: 'zillow.com',
          cities: targetCities.filter(c => c.priority <= 2)
        }
      ]
    });

    // Hourly priority city updates
    this.addTask({
      id: 'hourly_priority_cities',
      name: 'Hourly Priority Cities Update',
      schedule: '0 * * * *', // Every hour
      enabled: true,
      nextRun: this.calculateNextRun('0 * * * *'),
      options: {
        maxPages: 3,
        forceRefresh: false
      },
      targets: [
        {
          source: 'apartments.com',
          cities: targetCities.filter(c => c.priority === 1)
        },
        {
          source: 'zillow.com',
          cities: targetCities.filter(c => c.priority === 1)
        }
      ]
    });

    // Weekly comprehensive update
    this.addTask({
      id: 'weekly_full_scrape',
      name: 'Weekly Full Market Scrape',
      schedule: '0 0 * * 0', // Sunday midnight
      enabled: true,
      nextRun: this.calculateNextRun('0 0 * * 0'),
      options: {
        maxPages: 20,
        forceRefresh: true,
        concurrency: 2 // Lower concurrency for comprehensive scrape
      },
      targets: [
        {
          source: 'apartments.com',
          cities: targetCities
        },
        {
          source: 'zillow.com',
          cities: targetCities
        }
      ]
    });

    scrapingLogger.info('Default scheduled tasks initialized', {
      taskCount: this.tasks.size
    });
  }

  /**
   * Start the task scheduler
   */
  start(): void {
    if (this.isRunning) {
      scrapingLogger.warn('Task scheduler is already running');
      return;
    }

    this.isRunning = true;
    
    for (const [taskId, task] of this.tasks) {
      if (task.enabled) {
        this.scheduleTask(taskId, task);
      }
    }

    scrapingLogger.info('Task scheduler started', {
      activeTasks: Array.from(this.tasks.values()).filter(t => t.enabled).length
    });
  }

  /**
   * Stop the task scheduler
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    // Clear all timers
    for (const [taskId, timer] of this.timers) {
      clearTimeout(timer);
    }
    this.timers.clear();

    scrapingLogger.info('Task scheduler stopped');
  }

  /**
   * Add a new scheduled task
   */
  addTask(task: ScheduledTask): void {
    this.tasks.set(task.id, task);
    
    if (this.isRunning && task.enabled) {
      this.scheduleTask(task.id, task);
    }

    scrapingLogger.info('Task added to scheduler', {
      taskId: task.id,
      taskName: task.name,
      schedule: task.schedule
    });
  }

  /**
   * Remove a scheduled task
   */
  removeTask(taskId: string): boolean {
    const timer = this.timers.get(taskId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(taskId);
    }

    const removed = this.tasks.delete(taskId);
    
    if (removed) {
      scrapingLogger.info('Task removed from scheduler', { taskId });
    }

    return removed;
  }

  /**
   * Enable/disable a task
   */
  toggleTask(taskId: string, enabled: boolean): boolean {
    const task = this.tasks.get(taskId);
    if (!task) {
      return false;
    }

    task.enabled = enabled;

    if (this.isRunning) {
      if (enabled) {
        this.scheduleTask(taskId, task);
      } else {
        const timer = this.timers.get(taskId);
        if (timer) {
          clearTimeout(timer);
          this.timers.delete(taskId);
        }
      }
    }

    scrapingLogger.info('Task toggled', { taskId, enabled });
    return true;
  }

  /**
   * Run a task immediately
   */
  async runTaskNow(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    scrapingLogger.info('Running task immediately', {
      taskId,
      taskName: task.name
    });

    await this.executeTask(task);
  }

  /**
   * Get all tasks
   */
  getTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get task by ID
   */
  getTask(taskId: string): ScheduledTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Update task schedule
   */
  updateTaskSchedule(taskId: string, schedule: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) {
      return false;
    }

    task.schedule = schedule;
    task.nextRun = this.calculateNextRun(schedule);

    // Reschedule if running
    if (this.isRunning && task.enabled) {
      const timer = this.timers.get(taskId);
      if (timer) {
        clearTimeout(timer);
      }
      this.scheduleTask(taskId, task);
    }

    scrapingLogger.info('Task schedule updated', {
      taskId,
      schedule,
      nextRun: task.nextRun
    });

    return true;
  }

  private scheduleTask(taskId: string, task: ScheduledTask): void {
    // Clear existing timer
    const existingTimer = this.timers.get(taskId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const now = new Date();
    const delay = task.nextRun.getTime() - now.getTime();

    if (delay <= 0) {
      // Task should run now
      this.executeTask(task).then(() => {
        // Schedule next run
        task.nextRun = this.calculateNextRun(task.schedule);
        this.scheduleTask(taskId, task);
      });
    } else {
      // Schedule for future execution
      const timer = setTimeout(async () => {
        await this.executeTask(task);
        // Schedule next run
        task.nextRun = this.calculateNextRun(task.schedule);
        this.scheduleTask(taskId, task);
      }, delay);

      this.timers.set(taskId, timer);

      scrapingLogger.debug('Task scheduled', {
        taskId,
        nextRun: task.nextRun,
        delayMs: delay
      });
    }
  }

  private async executeTask(task: ScheduledTask): Promise<void> {
    const startTime = Date.now();
    
    scrapingLogger.info('Executing scheduled task', {
      taskId: task.id,
      taskName: task.name
    });

    try {
      task.lastRun = new Date();

      const jobs: Promise<any>[] = [];

      // Create scraping jobs for all targets
      for (const target of task.targets) {
        for (const city of target.cities) {
          jobs.push(
            scraperOrchestrator.scrapeCity(
              target.source,
              city.city,
              city.state,
              task.options
            )
          );
        }
      }

      // Execute with concurrency control
      const concurrency = task.options.concurrency || 5;
      const results = [];

      for (let i = 0; i < jobs.length; i += concurrency) {
        const batch = jobs.slice(i, i + concurrency);
        const batchResults = await Promise.allSettled(batch);
        results.push(...batchResults);

        // Brief pause between batches
        if (i + concurrency < jobs.length) {
          await this.sleep(1000);
        }
      }

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.length - successful;

      scrapingLogger.info('Scheduled task completed', {
        taskId: task.id,
        duration: Date.now() - startTime,
        totalJobs: results.length,
        successful,
        failed
      });

    } catch (error) {
      scrapingLogger.error('Scheduled task failed', error as Error, {
        taskId: task.id,
        taskName: task.name
      });
    }
  }

  private calculateNextRun(cronExpression: string): Date {
    // Simple cron parser for common patterns
    // In production, you'd use a proper cron library like 'node-cron'
    
    const now = new Date();
    const parts = cronExpression.split(' ');
    
    if (parts.length !== 5) {
      throw new Error('Invalid cron expression');
    }

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

    // Handle some common patterns
    if (cronExpression === '0 * * * *') {
      // Every hour
      const next = new Date(now);
      next.setHours(next.getHours() + 1, 0, 0, 0);
      return next;
    }

    if (cronExpression === '0 2 * * *') {
      // Daily at 2 AM
      const next = new Date(now);
      next.setDate(next.getDate() + 1);
      next.setHours(2, 0, 0, 0);
      return next;
    }

    if (cronExpression === '0 0 * * 0') {
      // Weekly on Sunday at midnight
      const next = new Date(now);
      const daysUntilSunday = (7 - next.getDay()) % 7;
      if (daysUntilSunday === 0 && (next.getHours() > 0 || next.getMinutes() > 0)) {
        next.setDate(next.getDate() + 7);
      } else {
        next.setDate(next.getDate() + daysUntilSunday);
      }
      next.setHours(0, 0, 0, 0);
      return next;
    }

    // Default: run in 1 hour
    const next = new Date(now.getTime() + 60 * 60 * 1000);
    return next;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get scheduler status
   */
  getStatus(): {
    isRunning: boolean;
    totalTasks: number;
    enabledTasks: number;
    nextTaskRun?: Date;
  } {
    const enabledTasks = Array.from(this.tasks.values()).filter(t => t.enabled);
    const nextRun = enabledTasks.length > 0 
      ? new Date(Math.min(...enabledTasks.map(t => t.nextRun.getTime())))
      : undefined;

    return {
      isRunning: this.isRunning,
      totalTasks: this.tasks.size,
      enabledTasks: enabledTasks.length,
      nextTaskRun: nextRun
    };
  }
}

// Singleton instance
export const taskScheduler = new TaskScheduler();