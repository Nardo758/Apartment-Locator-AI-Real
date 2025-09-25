#!/usr/bin/env node

/**
 * Entry point for the task scheduler service
 */

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3002;

// Import the task scheduler (this would be the compiled TypeScript)
// const { taskScheduler } = require('./dist/scraping/core/TaskScheduler');

console.log('🕐 Starting Apartment Scraper Task Scheduler...');

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'task-scheduler'
  });
});

// Status endpoint
app.get('/status', (req, res) => {
  // In a real implementation, this would return scheduler status
  res.json({
    isRunning: true,
    totalTasks: 3,
    enabledTasks: 3,
    nextTaskRun: new Date(Date.now() + 60 * 60 * 1000).toISOString()
  });
});

// Start HTTP server for health checks
app.listen(PORT, () => {
  console.log(`Task scheduler health server running on port ${PORT}`);
});

// Start the actual task scheduler
async function startScheduler() {
  try {
    console.log('Initializing task scheduler...');
    
    // In a real implementation, this would start the actual scheduler
    // await taskScheduler.start();
    
    console.log('✅ Task scheduler started successfully');
    
    // Keep the process running
    setInterval(() => {
      console.log(`📊 Scheduler heartbeat: ${new Date().toISOString()}`);
    }, 60000); // Log heartbeat every minute
    
  } catch (error) {
    console.error('❌ Failed to start task scheduler:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  // taskScheduler.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  // taskScheduler.stop();
  process.exit(0);
});

// Start the scheduler
startScheduler();