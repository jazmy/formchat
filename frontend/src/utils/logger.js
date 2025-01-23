import axios from 'axios';

// Frontend logger utility
const logger = {
  // Log levels
  levels: {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug'
  },

  // Get current timestamp
  getTimestamp() {
    return new Date().toISOString();
  },

  // Safely stringify objects with circular references
  safeStringify(obj, space = null) {
    if (!obj) return 'null';
    if (typeof obj !== 'object') return JSON.stringify(obj);
    
    try {
      const seen = new WeakSet();
      return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular]';
          }
          seen.add(value);
          
          // Handle special cases
          if (value instanceof Error) {
            return {
              name: value.name,
              message: value.message,
              stack: value.stack
            };
          }
          if (value instanceof RegExp) {
            return value.toString();
          }
        }
        if (typeof value === 'function') {
          return '[Function]';
        }
        if (typeof value === 'symbol') {
          return value.toString();
        }
        if (value === undefined) {
          return 'undefined';
        }
        return value;
      }, space);
    } catch (error) {
      return `[Unstringifiable: ${typeof obj}]`;
    }
  },

  // Safely process data for logging
  sanitizeData(data) {
    if (!data) return null;
    
    try {
      // For simple primitives, return as is
      if (typeof data !== 'object' || data === null) {
        return data;
      }

      // For errors, extract useful information
      if (data instanceof Error) {
        return {
          name: data.name,
          message: data.message,
          stack: data.stack
        };
      }

      // For other objects, create a safe copy
      const safe = {};
      for (const [key, value] of Object.entries(data)) {
        try {
          // Test if the value can be safely stringified
          JSON.stringify(value);
          safe[key] = value;
        } catch {
          safe[key] = this.safeStringify(value);
        }
      }
      return safe;
    } catch (error) {
      return {
        error: 'Data could not be safely processed',
        type: typeof data,
        preview: String(data).slice(0, 100)
      };
    }
  },

  // Format and store log message
  async formatLog(level, message, data = null) {
    // Ensure message is a string
    const safeMessage = String(message);
    const sanitizedData = this.sanitizeData(data);
    
    const logEntry = {
      timestamp: this.getTimestamp(),
      level,
      message: safeMessage,
      data: sanitizedData
    };

    // Always log to console in development
    if (process.env.NODE_ENV !== 'production') {
      const consoleLog = `${logEntry.timestamp} [${level.toUpperCase()}] ${safeMessage}`;
      const consoleData = sanitizedData ? this.safeStringify(sanitizedData, 2) : '';
      
      switch (level) {
        case this.levels.ERROR:
          console.error(consoleLog, consoleData);
          break;
        case this.levels.WARN:
          console.warn(consoleLog, consoleData);
          break;
        case this.levels.INFO:
          console.info(consoleLog, consoleData);
          break;
        default:
          console.log(consoleLog, consoleData);
      }
    }

    // Send log to server
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/logs`,
        logEntry,
        { headers }
      );
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Failed to store log on server:', error.message);
      }
    }

    return logEntry;
  },

  // Log methods
  async error(message, data = null) {
    return this.formatLog(this.levels.ERROR, message, data);
  },

  async warn(message, data = null) {
    return this.formatLog(this.levels.WARN, message, data);
  },

  async info(message, data = null) {
    return this.formatLog(this.levels.INFO, message, data);
  },

  async debug(message, data = null) {
    return this.formatLog(this.levels.DEBUG, message, data);
  },

  // Get logs from server (admin only)
  async getLogs(level = null, lines = 100) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/logs${level ? `/${level}` : ''}`,
        { 
          params: { lines },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to retrieve logs from server:', error);
      }
      return [];
    }
  }
};

export default logger;
