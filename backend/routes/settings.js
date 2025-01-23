const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, deleteSetting } = require('../models/settings');

router.get('/', async (req, res) => {
  try {
    const settings = await getSettings();
    res.json(settings);
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

router.post('/', async (req, res) => {
  try {
    await updateSettings(req.body);
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

router.delete('/:key', async (req, res) => {
  try {
    await deleteSetting(req.params.key);
    res.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    console.error('Error deleting setting:', error);
    res.status(500).json({ error: 'Failed to delete setting' });
  }
});

module.exports = router;
