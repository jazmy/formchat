const express = require('express');
const router = express.Router();
const knex = require('knex')(require('../knexfile').development);
const { Parser } = require('json2csv');
const openAIService = require('../services/openaiService');

// Submit a response
router.post('/:formId', async (req, res) => {
  const { formId } = req.params;
  const { responseid, answers } = req.body;

  // Start a transaction
  const trx = await knex.transaction();

  try {
    console.log('Saving response:', { formId, responseid, answers });
    let response;
    
    if (responseid) {
      // Update existing response
      await trx('responses')
        .where({ responseid, formid: formId })
        .update({
          responses: JSON.stringify({ answers }),
          updated_at: trx.fn.now()
        });
      
      // Fetch the updated record
      response = await trx('responses')
        .where({ responseid, formid: formId })
        .first();
      
      if (!response) {
        await trx.rollback();
        console.error('No response found with id:', responseid);
        return res.status(404).json({ error: 'Response not found' });
      }
    } else {
      // Create new response
      const [newResponseId] = await trx('responses')
        .insert({
          formid: formId,
          responses: JSON.stringify({ answers }),
          created_at: trx.fn.now(),
          updated_at: trx.fn.now()
        })
        .returning('responseid');
      
      if (!newResponseId) {
        await trx.rollback();
        throw new Error('Failed to create response');
      }
      
      // Fetch the created record
      response = await trx('responses')
        .where({ responseid: newResponseId, formid: formId })
        .first();
    }

    // Commit transaction
    await trx.commit();

    console.log('Saved response:', response);
    res.json(response);
  } catch (error) {
    // Rollback transaction on error
    await trx.rollback();
    console.error('Error saving response:', error);
    res.status(500).json({ error: 'Failed to save response' });
  }
});

// Get responses for a form
router.get('/:formId', async (req, res) => {
  const { formId } = req.params;
  
  try {
    console.log('Getting responses for form:', formId);
    
    // Get form details
    const form = await knex('forms')
      .select('*')
      .where('formid', formId)
      .first();

    if (!form) {
      console.error('Form not found:', formId);
      return res.status(404).json({ error: 'Form not found' });
    }

    // Get prompts ordered by their order
    const prompts = await knex('prompts')
      .select('*')
      .where('formid', formId)
      .orderBy('order');

    console.log('Found prompts:', prompts.length);

    // Get responses
    const responses = await knex('responses')
      .select('*')
      .where('formid', formId)
      .orderBy('created_at', 'desc');

    console.log('Found responses:', responses.length);

    // Process responses to group answers by response ID
    const processedResponses = responses.map(response => {
      try {
        console.log('Processing response:', response.responseid);
        const responseData = JSON.parse(response.responses || '{}');
        console.log('Parsed response data:', responseData);
        const answers = responseData.answers || [];
        console.log('Found answers:', answers.length);

        return {
          responseid: response.responseid,
          created_at: response.created_at,
          updated_at: response.updated_at,
          responses: response.responses,
          answers: answers
        };
      } catch (error) {
        console.error(`Error processing response ${response.responseid}:`, error);
        return {
          responseid: response.responseid,
          created_at: response.created_at,
          updated_at: response.updated_at,
          responses: response.responses,
          answers: []
        };
      }
    });

    console.log('Processed responses:', processedResponses.length);

    res.json({
      form,
      prompts,
      responses: processedResponses
    });
  } catch (error) {
    console.error('Error getting responses:', error);
    res.status(500).json({ error: 'Failed to get responses' });
  }
});

// Export responses as CSV
router.get('/:formid/export', async (req, res) => {
  const { formid } = req.params;
  const { responseIds } = req.query;

  try {
    // Get form details and prompts
    const form = await knex('forms')
      .where('formid', formid)
      .first();

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const prompts = await knex('prompts')
      .where('formid', formid)
      .orderBy('order', 'asc');

    // Build query for responses
    let query = knex('responses')
      .where('formid', formid)
      .orderBy('created_at', 'desc');

    // If specific response IDs are provided, filter by them
    if (responseIds) {
      const ids = Array.isArray(responseIds) ? responseIds : [responseIds];
      query = query.whereIn('responseid', ids);
    }

    const responses = await query;

    // Format data for CSV
    const fields = [
      { label: 'submission_date', value: 'created_at' },
      ...prompts.map(prompt => ({
        label: prompt.variable_name,
        value: row => {
          try {
            const parsedResponses = JSON.parse(row.responses);
            const answer = parsedResponses.answers?.find(a => a.variable_name === prompt.variable_name);
            return answer?.response_text || '';
          } catch (error) {
            console.error(`Error parsing response for ${prompt.variable_name}:`, error);
            return '';
          }
        }
      }))
    ];

    if (form.output_prompt) {
      fields.push({
        label: 'output',
        value: row => {
          try {
            const parsedResponses = JSON.parse(row.responses);
            const answer = parsedResponses.answers?.find(a => a.variable_name === 'output');
            return answer?.response_text || '';
          } catch (error) {
            console.error('Error parsing output:', error);
            return '';
          }
        }
      });
    }

    const parser = new Parser({ fields });
    const csv = parser.parse(responses);

    // Set filename using form ID and timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `form_${formid}_responses_${timestamp}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(csv);
  } catch (error) {
    console.error('Error exporting responses:', error);
    res.status(500).json({
      error: 'Failed to export responses',
      details: error.message
    });
  }
});

// Delete a response
router.delete('/:formId/:responseId', async (req, res) => {
  const { formId, responseId } = req.params;

  try {
    const deleted = await knex('responses')
      .where({ 
        formid: formId,
        responseid: responseId 
      })
      .delete();

    if (!deleted) {
      return res.status(404).json({ error: 'Response not found' });
    }

    res.json({ message: 'Response deleted successfully' });
  } catch (error) {
    console.error('Error deleting response:', error);
    res.status(500).json({ 
      error: 'Failed to delete response',
      details: error.message 
    });
  }
});

// Delete multiple responses
router.post('/:formId/delete', async (req, res) => {
  const { formId } = req.params;
  const { responseIds } = req.body;

  if (!Array.isArray(responseIds) || responseIds.length === 0) {
    return res.status(400).json({ error: 'Invalid response IDs' });
  }

  try {
    const deleted = await knex('responses')
      .where('formid', formId)
      .whereIn('responseid', responseIds)
      .delete();

    res.json({ 
      message: 'Responses deleted successfully',
      count: deleted
    });
  } catch (error) {
    console.error('Error deleting responses:', error);
    res.status(500).json({ 
      error: 'Failed to delete responses',
      details: error.message 
    });
  }
});

module.exports = router;