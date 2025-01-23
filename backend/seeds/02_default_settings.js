exports.seed = async function(knex) {
  // Get existing settings to avoid overwriting user-defined values
  const existingSettings = await knex('settings').select('*');
  const existingKeys = new Set(existingSettings.map(s => s.key));

  // Default settings
  const defaultSettings = {
    MODELS: {
      CHAT: 'gpt-4o-mini',
      WELCOME: 'gpt-4o-mini',
      VALIDATION: 'gpt-4o-mini'
    },
    CHAT_PROCESSING: {
      MAX_TOKENS: {
        CONVERSATIONAL: 1000,
        WELCOME: 100,
        VALIDATION: 1000,
        GUIDANCE: 1000
      },
      TEMPERATURE: {
        CONVERSATIONAL: 0.7,
        WELCOME: 0.7,
        VALIDATION: 0.3,
        GUIDANCE: 0.7
      },
      RETRY: {
        MAX_ATTEMPTS: 3,
        DELAY_MS: 1000
      }
    },
    RATE_LIMIT: {
      TOKENS_PER_MIN: 90000,
      MAX_REQUESTS_PER_MIN: 3500
    }
  };

  // Convert nested objects to flat settings entries
  const settingsToInsert = [];
  const flattenObject = (obj, prefix = '') => {
    Object.entries(obj).forEach(([key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === 'object') {
        flattenObject(value, fullKey);
      } else if (!existingKeys.has(fullKey)) {
        // Only insert if setting doesn't already exist
        settingsToInsert.push({
          key: fullKey,
          value: JSON.stringify(value),
          updated_at: new Date()
        });
      }
    });
  };

  flattenObject(defaultSettings);

  if (settingsToInsert.length > 0) {
    await knex('settings').insert(settingsToInsert);
    console.log(`Inserted ${settingsToInsert.length} default settings`);
  }
};
