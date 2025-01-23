const knex = require('../database/knex');

const getFormById = async (formId) => {
  try {
    const form = await knex('forms')
      .select(
        'forms.formid',
        'forms.title',
        'forms.description',
        'forms.starter_prompt',
        'forms.output_prompt',
        'forms.active'
      )
      .where('forms.formid', formId)
      .first();

    if (!form) {
      return null;
    }

    const prompts = await knex('prompts')
      .select('*')
      .where('formid', formId)
      .orderBy('order');

    return {
      ...form,
      prompts
    };
  } catch (error) {
    console.error('Error getting form:', error);
    throw error;
  }
};

module.exports = {
  getFormById
};
