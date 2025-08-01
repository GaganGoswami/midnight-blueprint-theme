// Midnight Blueprint Theme - Advanced JavaScript Demo
// Showcasing various syntax elements and modern JavaScript features

'use strict';

/**
 * Advanced Data Analytics Platform
 * Demonstrates modern JavaScript patterns with elegant syntax highlighting
 */

import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';

// Type definitions for better IDE support
/**
 * @typedef {Object} AnalyticsConfig
 * @property {string} apiKey - API key for authentication
 * @property {string} endpoint - Analytics endpoint URL
 * @property {number} batchSize - Number of events to batch before sending
 * @property {number} timeout - Request timeout in milliseconds
 * @property {boolean} enableDebug - Enable debug logging
 */

/**
 * @typedef {Object} EventData
 * @property {string} id - Unique event identifier
 * @property {string} type - Event type
 * @property {Date} timestamp - Event timestamp
 * @property {Object} metadata - Additional event metadata
 * @property {string[]} tags - Event tags
 */

// Constants and configuration
const DEFAULT_CONFIG = {
  apiKey: process.env.ANALYTICS_API_KEY || '',
  endpoint: 'https://api.analytics.example.com',
  batchSize: 50,
  timeout: 5000,
  enableDebug: false,
  retryAttempts: 3,
  retryDelay: 1000
};

const EVENT_TYPES = {
  USER_ACTION: 'user_action',
  SYSTEM_EVENT: 'system_event',
  ERROR_EVENT: 'error_event',
  PERFORMANCE: 'performance',
  CUSTOM: 'custom'
};

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

/**
 * Analytics Platform Class
 * Handles event collection, processing, and transmission
 */
class AnalyticsPlatform extends EventEmitter {
  #config;
  #eventQueue = [];
  #isProcessing = false;
  #stats = {
    totalEvents: 0,
    successfulSends: 0,
    failedSends: 0,
    startTime: Date.now()
  };

  /**
   * Initialize the analytics platform
   * @param {AnalyticsConfig} config - Configuration options
   */
  constructor(config = {}) {
    super();
    this.#config = { ...DEFAULT_CONFIG, ...config };
    this.#validateConfig();
    this.#initializeProcessing();
    
    this.log('Analytics platform initialized', { config: this.#config });
  }

  /**
   * Validate configuration parameters
   * @private
   */
  #validateConfig() {
    if (!this.#config.apiKey) {
      throw new Error('API key is required for analytics platform');
    }
    
    if (!this.#config.endpoint || !this.#isValidUrl(this.#config.endpoint)) {
      throw new Error('Valid endpoint URL is required');
    }
    
    if (this.#config.batchSize <= 0 || this.#config.batchSize > 1000) {
      throw new Error('Batch size must be between 1 and 1000');
    }
  }

  /**
   * Check if a string is a valid URL
   * @param {string} urlString - URL to validate
   * @returns {boolean} True if valid URL
   * @private
   */
  #isValidUrl(urlString) {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Initialize automatic event processing
   * @private
   */
  #initializeProcessing() {
    // Process events every 5 seconds or when batch is full
    setInterval(() => {
      if (this.#eventQueue.length >= this.#config.batchSize || 
          (this.#eventQueue.length > 0 && !this.#isProcessing)) {
        this.#processBatch().catch(error => {
          this.emit('error', error);
        });
      }
    }, 5000);

    // Handle graceful shutdown
    process.on('SIGTERM', () => this.#gracefulShutdown());
    process.on('SIGINT', () => this.#gracefulShutdown());
  }

  /**
   * Track an analytics event
   * @param {string} eventType - Type of event
   * @param {Object} data - Event data
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<string>} Event ID
   */
  async track(eventType, data = {}, metadata = {}) {
    const eventId = this.#generateEventId();
    
    const event = {
      id: eventId,
      type: eventType,
      timestamp: new Date(),
      data: this.#sanitizeData(data),
      metadata: {
        ...metadata,
        userAgent: this.#getUserAgent(),
        sessionId: this.#getSessionId(),
        version: this.#getVersion()
      },
      tags: this.#generateTags(eventType, data)
    };

    // Validate event before queuing
    this.#validateEvent(event);
    
    this.#eventQueue.push(event);
    this.#stats.totalEvents++;
    
    this.log('Event tracked', { eventId, eventType });
    this.emit('eventTracked', event);
    
    return eventId;
  }

  /**
   * Track multiple events at once
   * @param {Array<Object>} events - Array of events to track
   * @returns {Promise<string[]>} Array of event IDs
   */
  async trackBatch(events) {
    const eventIds = await Promise.all(
      events.map(({ type, data, metadata }) => 
        this.track(type, data, metadata)
      )
    );
    
    this.log('Batch tracking completed', { count: events.length });
    return eventIds;
  }

  /**
   * Track user interaction events
   * @param {string} action - User action
   * @param {HTMLElement} element - DOM element (if applicable)
   * @param {Object} context - Additional context
   */
  trackUserAction(action, element = null, context = {}) {
    const data = {
      action,
      timestamp: Date.now(),
      url: window?.location?.href || 'unknown',
      ...context
    };

    if (element) {
      data.element = {
        tagName: element.tagName,
        id: element.id,
        className: element.className,
        textContent: element.textContent?.slice(0, 100)
      };
    }

    return this.track(EVENT_TYPES.USER_ACTION, data);
  }

  /**
   * Track performance metrics
   * @param {string} metric - Performance metric name
   * @param {number} value - Metric value
   * @param {Object} context - Additional context
   */
  trackPerformance(metric, value, context = {}) {
    const data = {
      metric,
      value,
      unit: context.unit || 'ms',
      timestamp: performance.now(),
      ...context
    };

    return this.track(EVENT_TYPES.PERFORMANCE, data);
  }

  /**
   * Track application errors
   * @param {Error} error - Error object
   * @param {Object} context - Error context
   */
  trackError(error, context = {}) {
    const data = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      url: window?.location?.href || 'unknown',
      userAgent: navigator?.userAgent || 'unknown',
      timestamp: Date.now(),
      ...context
    };

    return this.track(EVENT_TYPES.ERROR_EVENT, data);
  }

  /**
   * Generate unique event ID
   * @returns {string} Unique event identifier
   * @private
   */
  #generateEventId() {
    const timestamp = Date.now().toString(36);
    const randomBytes = Math.random().toString(36).substr(2, 9);
    return `evt_${timestamp}_${randomBytes}`;
  }

  /**
   * Sanitize event data to remove sensitive information
   * @param {Object} data - Raw event data
   * @returns {Object} Sanitized data
   * @private
   */
  #sanitizeData(data) {
    const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'creditCard'];
    const sanitized = { ...data };

    const sanitizeObject = (obj) => {
      Object.keys(obj).forEach(key => {
        if (sensitiveKeys.some(sensitive => 
          key.toLowerCase().includes(sensitive.toLowerCase())
        )) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      });
    };

    sanitizeObject(sanitized);
    return sanitized;
  }

  /**
   * Generate relevant tags for an event
   * @param {string} eventType - Type of event
   * @param {Object} data - Event data
   * @returns {string[]} Array of tags
   * @private
   */
  #generateTags(eventType, data) {
    const tags = [
      `type:${eventType}`,
      `env:${process.env.NODE_ENV || 'unknown'}`,
      `platform:${this.#getPlatform()}`
    ];

    // Add specific tags based on event type
    switch (eventType) {
      case EVENT_TYPES.USER_ACTION:
        if (data.action) tags.push(`action:${data.action}`);
        break;
      case EVENT_TYPES.PERFORMANCE:
        if (data.metric) tags.push(`metric:${data.metric}`);
        break;
      case EVENT_TYPES.ERROR_EVENT:
        tags.push('severity:error');
        if (data.name) tags.push(`errorType:${data.name}`);
        break;
    }

    return tags;
  }

  /**
   * Validate event structure
   * @param {EventData} event - Event to validate
   * @private
   */
  #validateEvent(event) {
    const required = ['id', 'type', 'timestamp'];
    const missing = required.filter(field => !event[field]);
    
    if (missing.length > 0) {
      throw new Error(`Event missing required fields: ${missing.join(', ')}`);
    }

    if (typeof event.timestamp !== 'object' || !(event.timestamp instanceof Date)) {
      throw new Error('Event timestamp must be a Date object');
    }
  }

  /**
   * Process a batch of events
   * @private
   */
  async #processBatch() {
    if (this.#isProcessing || this.#eventQueue.length === 0) {
      return;
    }

    this.#isProcessing = true;
    const batchSize = Math.min(this.#config.batchSize, this.#eventQueue.length);
    const batch = this.#eventQueue.splice(0, batchSize);

    try {
      await this.#sendBatch(batch);
      this.#stats.successfulSends += batch.length;
      this.emit('batchSent', { count: batch.length, success: true });
      this.log('Batch sent successfully', { count: batch.length });
    } catch (error) {
      this.#stats.failedSends += batch.length;
      this.emit('batchSent', { count: batch.length, success: false, error });
      this.log('Batch send failed', { count: batch.length, error: error.message });
      
      // Re-queue failed events for retry
      this.#eventQueue.unshift(...batch);
    } finally {
      this.#isProcessing = false;
    }
  }

  /**
   * Send batch to analytics endpoint
   * @param {EventData[]} batch - Batch of events to send
   * @private
   */
  async #sendBatch(batch) {
    const payload = {
      events: batch,
      metadata: {
        batchId: this.#generateEventId(),
        timestamp: new Date().toISOString(),
        count: batch.length,
        platform: this.#getPlatform(),
        version: this.#getVersion()
      }
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.#config.timeout);

    try {
      const response = await fetch(this.#config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.#config.apiKey}`,
          'User-Agent': this.#getUserAgent()
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      this.log('Batch response received', result);
      
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Get current platform information
   * @returns {string} Platform identifier
   * @private
   */
  #getPlatform() {
    if (typeof window !== 'undefined') {
      return 'browser';
    } else if (typeof process !== 'undefined') {
      return `node-${process.platform}`;
    }
    return 'unknown';
  }

  /**
   * Get user agent string
   * @returns {string} User agent
   * @private
   */
  #getUserAgent() {
    if (typeof navigator !== 'undefined') {
      return navigator.userAgent;
    } else if (typeof process !== 'undefined') {
      return `Node.js/${process.version}`;
    }
    return 'unknown';
  }

  /**
   * Get session identifier
   * @returns {string} Session ID
   * @private
   */
  #getSessionId() {
    // In browser environment, you might use sessionStorage
    if (typeof sessionStorage !== 'undefined') {
      let sessionId = sessionStorage.getItem('analyticsSessionId');
      if (!sessionId) {
        sessionId = this.#generateEventId();
        sessionStorage.setItem('analyticsSessionId', sessionId);
      }
      return sessionId;
    }
    return 'server-session';
  }

  /**
   * Get application version
   * @returns {string} Application version
   * @private
   */
  #getVersion() {
    // Try to read from package.json or environment
    return process.env.APP_VERSION || '1.0.0';
  }

  /**
   * Log debug information
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   * @private
   */
  log(message, data = {}) {
    if (this.#config.enableDebug) {
      console.log(`[Analytics] ${message}`, data);
    }
  }

  /**
   * Get current statistics
   * @returns {Object} Platform statistics
   */
  getStats() {
    const uptime = Date.now() - this.#stats.startTime;
    return {
      ...this.#stats,
      queueSize: this.#eventQueue.length,
      uptimeMs: uptime,
      eventsPerSecond: this.#stats.totalEvents / (uptime / 1000)
    };
  }

  /**
   * Graceful shutdown
   * @private
   */
  async #gracefulShutdown() {
    this.log('Graceful shutdown initiated');
    
    // Process remaining events
    while (this.#eventQueue.length > 0 && !this.#isProcessing) {
      await this.#processBatch();
    }
    
    this.log('Shutdown complete');
    process.exit(0);
  }

  /**
   * Clear all queued events
   */
  clearQueue() {
    const count = this.#eventQueue.length;
    this.#eventQueue = [];
    this.log('Queue cleared', { count });
    this.emit('queueCleared', { count });
  }

  /**
   * Export queued events to file
   * @param {string} filename - Output filename
   */
  async exportQueue(filename) {
    const data = {
      exportTime: new Date().toISOString(),
      events: this.#eventQueue,
      stats: this.getStats()
    };

    const filepath = path.resolve(filename);
    await fs.writeFile(filepath, JSON.stringify(data, null, 2));
    
    this.log('Queue exported', { filepath, count: this.#eventQueue.length });
  }
}

// Usage examples and demonstrations
const examples = {
  // Basic usage
  async basicUsage() {
    const analytics = new AnalyticsPlatform({
      apiKey: 'your-api-key-here',
      enableDebug: true
    });

    // Track simple events
    await analytics.track('page_view', { 
      url: '/dashboard',
      loadTime: 1250 
    });

    await analytics.track('button_click', {
      buttonId: 'submit-btn',
      formData: { email: 'user@example.com' }
    });

    return analytics;
  },

  // Advanced usage with error handling
  async advancedUsage() {
    const analytics = new AnalyticsPlatform({
      apiKey: process.env.ANALYTICS_API_KEY,
      batchSize: 25,
      timeout: 3000,
      enableDebug: true
    });

    // Event listeners
    analytics.on('eventTracked', (event) => {
      console.log('Event tracked:', event.id);
    });

    analytics.on('batchSent', ({ count, success, error }) => {
      if (success) {
        console.log(`Successfully sent batch of ${count} events`);
      } else {
        console.error(`Failed to send batch: ${error.message}`);
      }
    });

    analytics.on('error', (error) => {
      console.error('Analytics error:', error);
    });

    // Track various event types
    const eventPromises = [
      analytics.trackUserAction('click', document.getElementById('btn'), {
        campaign: 'summer-sale'
      }),
      analytics.trackPerformance('api_call', 450, { endpoint: '/api/users' }),
      analytics.trackError(new Error('Connection timeout'), {
        component: 'UserService',
        retryAttempt: 2
      })
    ];

    await Promise.all(eventPromises);

    // Batch tracking
    await analytics.trackBatch([
      { type: 'conversion', data: { value: 99.99, currency: 'USD' }},
      { type: 'experiment', data: { variant: 'A', metric: 'click_rate' }},
      { type: 'feature_usage', data: { feature: 'dark_mode', enabled: true }}
    ]);

    return analytics;
  }
};

// Export for use as module
export { AnalyticsPlatform, EVENT_TYPES, HTTP_STATUS, examples };

// Default export
export default AnalyticsPlatform;
