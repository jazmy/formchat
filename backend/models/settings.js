const knex = require('knex')(require('../knexfile').development);

const createSettingsTable = async () => {
  const exists = await knex.schema.hasTable('settings');
  if (!exists) {
    await knex.schema.createTable('settings', table => {
      table.string('key').primary();
      table.text('value').notNullable();
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
  }
};

createSettingsTable();

// Helper function to merge nested objects
const mergeDeep = (target, source) => {
  if (!source) return target;
  const output = { ...target };
  
  Object.keys(source).forEach(key => {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      output[key] = mergeDeep(target[key] || {}, source[key]);
    } else if (source[key] !== null && source[key] !== undefined && source[key] !== '') {
      output[key] = source[key];
    }
  });
  
  return output;
};

// Helper function to unflatten object
const unflattenObject = (obj) => {
  const result = {};
  
  Object.entries(obj).forEach(([key, value]) => {
    const parts = key.split('.');
    let current = result;
    
    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        try {
          current[part] = JSON.parse(value);
        } catch (e) {
          current[part] = value;
        }
      } else {
        current[part] = current[part] || {};
        current = current[part];
      }
    });
  });
  
  return result;
};

const getSettings = async () => {
  try {
    // Get all settings from database
    const rows = await knex('settings').select('*');
    const flatSettings = rows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {});

    // Unflatten the settings object
    const settings = unflattenObject(flatSettings);

    // Add OPENAI_API_KEY from environment if not in database
    if (!settings.OPENAI_API_KEY) {
      settings.OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    }

    return settings;
  } catch (error) {
    console.error('Error getting settings:', error);
    throw error;
  }
};

const updateSetting = async (key, value) => {
  // Don't store null or undefined values
  if (value === null || value === undefined) {
    await deleteSetting(key);
    return;
  }

  const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
  await knex('settings')
    .insert({
      key,
      value: stringValue,
      updated_at: knex.fn.now()
    })
    .onConflict('key')
    .merge();
};

const updateSettings = async (settings) => {
  // Flatten nested objects
  const flattenObject = (obj, prefix = '') => {
    const flattened = {};
    
    Object.entries(obj).forEach(([key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(flattened, flattenObject(value, fullKey));
      } else if (value !== null && value !== undefined && value !== '') {
        flattened[fullKey] = value;
      }
    });
    
    return flattened;
  };

  const flatSettings = flattenObject(settings);
  
  // Update each setting
  for (const [key, value] of Object.entries(flatSettings)) {
    await updateSetting(key, value);
  }
};

const deleteSetting = async (key) => {
  await knex('settings').where({ key }).del();
};

module.exports = {
  getSettings,
  updateSetting,
  updateSettings,
  deleteSetting
};
