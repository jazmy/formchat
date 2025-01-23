const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const knex = require('knex')(require('../knexfile').development);
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  logger.info('Login attempt', { username });

  try {
    // Validate input
    if (!username || !password) {
      logger.warn('Login attempt with missing credentials', { username });
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Get admin user
    const admin = await knex('admins')
      .where('username', username)
      .first();

    logger.info('Admin lookup result', { 
      username,
      found: !!admin 
    });

    if (!admin) {
      logger.warn('Login attempt with invalid username', { username });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, admin.password);
    logger.info('Password validation result', { 
      username,
      valid: validPassword 
    });

    if (!validPassword) {
      logger.warn('Login attempt with invalid password', { username });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create token with correct ID field
    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    logger.info('Login successful', { username });
    res.json({ token });
  } catch (error) {
    logger.error('Login error', { 
      username,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

router.post('/logout', (req, res) => {
  logger.info('User logged out');
  res.json({ message: 'Logged out successfully' });
});

router.post('/change-password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const adminId = req.admin.id;
  const username = req.admin.username;

  logger.info('Password change attempt', { username });

  try {
    // Validate input
    if (!currentPassword || !newPassword) {
      logger.warn('Password change attempt with missing data', { username });
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 8) {
      logger.warn('Password change attempt with invalid new password length', { username });
      return res.status(400).json({ message: 'New password must be at least 8 characters long' });
    }

    // Get admin user
    const admin = await knex('admins')
      .where('id', adminId)
      .first();

    if (!admin) {
      logger.error('Admin not found during password change', { username, adminId });
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, admin.password);
    if (!validPassword) {
      logger.warn('Password change attempt with incorrect current password', { username });
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await knex('admins')
      .where('id', adminId)
      .update({
        password: hashedPassword,
        updated_at: knex.fn.now()
      });

    logger.info('Password changed successfully', { username });
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    logger.error('Password change error', { 
      username,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: 'Failed to update password', error: error.message });
  }
});

module.exports = router;