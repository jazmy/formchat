const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const auth = require('../middleware/auth');
const path = require('path');
const fs = require('fs').promises;

// Maximum number of log entries to keep per file
const MAX_LOG_ENTRIES = 250;

// Ensure logs directory exists
const frontendLogsDir = path.join(__dirname, '../logs/frontend');
fs.mkdir(frontendLogsDir, { recursive: true }).catch(console.error);

// Helper function to maintain log file size
async function maintainLogFile(filePath, newEntry) {
  try {
    let logs = [];
    try {
      const content = await fs.readFile(filePath, 'utf8');
      logs = content.trim().split('\n').filter(line => line.trim());
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }

    // Add new entry and keep only the last MAX_LOG_ENTRIES
    logs.push(JSON.stringify(newEntry));
    logs = logs.slice(-MAX_LOG_ENTRIES);

    // Write back to file
    await fs.writeFile(filePath, logs.join('\n') + '\n', 'utf8');
  } catch (error) {
    logger.error('Error maintaining log file', { error, filePath });
  }
}

// Store frontend logs
router.post('/', async (req, res) => {
  try {
    const { level, message, data } = req.body;
    
    // Validate input
    if (!level || !message || !['error', 'warn', 'info', 'debug'].includes(level.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid log entry' });
    }

    // Create log entry
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level.toLowerCase(),
      message,
      data,
      userAgent: req.headers['user-agent'],
      ip: req.ip
    };

    // Log to backend logger
    logger[level.toLowerCase()](message, { ...data, source: 'frontend' });

    // Write to frontend specific log file
    const logFile = path.join(frontendLogsDir, `${level.toLowerCase()}.log`);
    await maintainLogFile(logFile, logEntry);

    res.status(200).json({ message: 'Log stored successfully' });
  } catch (error) {
    logger.error('Error storing frontend log', { error });
    res.status(500).json({ error: 'Failed to store log' });
  }
});

// Get frontend logs (admin only)
router.get('/:level?', auth, async (req, res) => {
  try {
    const { level } = req.params;
    const { lines = MAX_LOG_ENTRIES } = req.query;
    const maxLines = Math.min(parseInt(lines) || MAX_LOG_ENTRIES, MAX_LOG_ENTRIES);
    
    async function readLastLines(filePath, maxLines) {
      try {
        const content = await fs.readFile(filePath, 'utf8');
        return content
          .trim()
          .split('\n')
          .filter(line => line.trim())
          .slice(-maxLines)
          .map(line => JSON.parse(line));
      } catch (error) {
        if (error.code === 'ENOENT') return [];
        throw error;
      }
    }

    if (level) {
      // Read specific level logs
      const logs = await readLastLines(
        path.join(frontendLogsDir, `${level.toLowerCase()}.log`),
        maxLines
      );
      return res.json(logs);
    }

    // Read all levels
    const levels = ['error', 'warn', 'info', 'debug'];
    const allLogs = [];
    
    for (const lvl of levels) {
      const logs = await readLastLines(
        path.join(frontendLogsDir, `${lvl}.log`),
        maxLines
      );
      allLogs.push(...logs);
    }

    // Sort by timestamp and limit
    const sortedLogs = allLogs
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, maxLines);

    res.json(sortedLogs);
  } catch (error) {
    logger.error('Error retrieving frontend logs', { error });
    res.status(500).json({ error: 'Failed to retrieve logs' });
  }
});

module.exports = router;
