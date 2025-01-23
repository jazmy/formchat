const express = require('express');
const router = express.Router();
const knex = require('knex')(require('../knexfile').development);
const openAIService = require('../services/openaiService');
const Papa = require('papaparse');

// Add this at the top of your routes
router.get('/test', (req, res) => {
  res.json({ message: 'Forms API is working' });
});

// Create a new form
router.post('/', async (req, res) => {
  console.log('POST /forms received:', req.body);
  const { title, description, starter_prompt, output_prompt, prompts } = req.body;
  console.log('Received form data:', { title, description, starter_prompt, output_prompt, prompts });

  try {
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = await knex.transaction(async (trx) => {
      // Insert form
      const [formId] = await trx('forms')
        .insert({
          title,
          description: description || '',
          starter_prompt: starter_prompt || '',
          output_prompt: output_prompt || '',
          active: true
        })
        .returning('formid');

      console.log('Created form with ID:', formId);

      // Insert prompts with order
      if (prompts && prompts.length > 0) {
        const promptsToInsert = prompts.map((prompt, index) => ({
          formId: formId,
          question_text: prompt.question_text,
          variable_name: prompt.variable_name,
          validation_criteria: prompt.validation_criteria || null,
          order: index
        }));

        console.log('Inserting prompts:', promptsToInsert);
        await trx('prompts').insert(promptsToInsert);
      }

      return formId;
    });

    console.log('Form creation successful, returning:', { formId: result });
    res.status(201).json({ formId: result });
  } catch (error) {
    console.error('Error creating form:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Failed to create form', 
      details: error.message,
      stack: error.stack 
    });
  }
});

// Get form details
router.get('/:formId', async (req, res) => {
  try {
    const { formId } = req.params;
    
    if (!formId) {
      return res.status(400).json({ error: 'Form ID is required' });
    }

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
      return res.status(404).json({ error: 'Form not found' });
    }
    
    const prompts = await knex('prompts')
      .select('*')
      .where('formid', formId)
      .orderBy('order');

    res.json({
      ...form,
      prompts
    });
  } catch (error) {
    console.error('Error getting form:', error);
    res.status(500).json({ error: 'Error getting form details' });
  }
});

// Validate a form response
router.post('/:formId/validate', async (req, res) => {
  try {
    const { formId } = req.params;
    const { promptIndex, answer, validationCriteria } = req.body;

    if (!formId) {
      return res.status(400).json({ error: 'Form ID is required' });
    }

    if (promptIndex === undefined || !answer) {
      return res.status(400).json({ error: 'Prompt index and answer are required' });
    }

    // Get the form to get the prompt details
    const form = await knex('forms')
      .select('forms.*')
      .where('formid', formId)
      .first();

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const prompts = await knex('prompts')
      .select('*')
      .where('formid', formId)
      .orderBy('order');

    const prompt = prompts[promptIndex];
    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    const validation = await openAIService.validateFormResponse(
      prompt.question_text,
      answer,
      prompt.variable_name,
      validationCriteria || prompt.validation_criteria
    );

    res.json({ validation });
  } catch (error) {
    console.error('Error validating form response:', error);
    res.status(500).json({ error: 'Error validating response' });
  }
});

// Save form progress
router.post('/:formId/progress', async (req, res) => {
  try {
    const { formId } = req.params;
    const responses = req.body;
    
    if (!formId) {
      return res.status(400).json({ error: 'Form ID is required' });
    }

    if (!responses || !Array.isArray(responses.answers)) {
      return res.status(400).json({ error: 'Invalid response format' });
    }
    
    // Here you would typically save the progress to a database
    // For now, we'll just acknowledge receipt
    res.json({ status: 'success' });
  } catch (error) {
    console.error('Error saving form progress:', error);
    res.status(500).json({ error: 'Error saving progress' });
  }
});

// Update form
router.put('/:formId', async (req, res) => {
  const { formId } = req.params;
  const { title, description, starter_prompt, output_prompt, prompts } = req.body;

  try {
    await knex.transaction(async (trx) => {
      // Update form details
      await trx('forms')
        .where('formid', formId)
        .update({
          title,
          description: description || '',
          starter_prompt: starter_prompt || '',
          output_prompt: output_prompt || ''
        });

      // Delete existing prompts
      await trx('prompts')
        .where('formid', formId)
        .delete();

      // Insert updated prompts with order
      if (prompts && prompts.length > 0) {
        await trx('prompts').insert(
          prompts.map((prompt, index) => ({
            formid: formId,  
            question_text: prompt.question_text,
            variable_name: prompt.variable_name,
            validation_criteria: prompt.validation_criteria || null,
            order: index
          }))
        );
      }
    });

    console.log('Form updated successfully:', {
      formId,  
      title,
      description,
      prompts
    });

    res.json({ message: 'Form updated successfully' });
  } catch (error) {
    console.error('Error updating form:', error);
    res.status(500).json({ error: 'Failed to update form' });
  }
});

// Deactivate form
router.patch('/:formId/deactivate', async (req, res) => {
  const { formId } = req.params;

  try {
    await knex('forms')
      .where('formid', formId)
      .update({ active: false });

    res.json({ message: 'Form deactivated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to deactivate form' });
  }
});

// Get all forms
router.get('/', async (req, res) => {
  try {
    const forms = await knex('forms')
      .select(
        'forms.formid',
        'forms.title',
        'forms.description',
        'forms.active',
        'forms.created_at',
        knex.raw('count(DISTINCT responses.responseid) as responseCount'),
        knex.raw('count(DISTINCT prompts.promptid) as questionCount')
      )
      .leftJoin('responses', 'forms.formid', 'responses.formid')
      .leftJoin('prompts', 'forms.formid', 'prompts.formid')
      .groupBy(
        'forms.formid',
        'forms.title',
        'forms.description',
        'forms.active',
        'forms.created_at'
      )
      .orderBy('forms.created_at', 'desc');

    console.log('Forms query result:', forms);
    res.json(forms);
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ error: 'Failed to fetch forms' });
  }
});

// Add guidance endpoint
router.post('/guidance', async (req, res) => {
  try {
    const { question, answer, validationCriteria, previousQA } = req.body;

    const guidance = await openAIService.getAnswerGuidance(
      question,
      answer,
      validationCriteria,
      previousQA
    );

    res.json({ guidance });
  } catch (error) {
    console.error('Error getting guidance:', error);
    res.status(500).json({ error: 'Failed to get guidance' });
  }
});

// Add this route for deleting forms
router.delete('/:formId', async (req, res) => {
  const { formId } = req.params;
  console.log('Deleting form:', formId);
  
  try {
    const result = await knex.transaction(async (trx) => {
      // First check if form exists
      const form = await trx('forms')
        .where('formid', formId)
        .first();
        
      if (!form) {
        throw new Error('Form not found');
      }

      // Delete all prompts first
      const deletedPrompts = await trx('prompts')
        .where('formid', formId)
        .delete();
      console.log('Deleted prompts:', deletedPrompts);
        
      // Delete all responses
      const deletedResponses = await trx('responses')
        .where('formid', formId)
        .delete();
      console.log('Deleted responses:', deletedResponses);
        
      // Delete the form
      const deletedForm = await trx('forms')
        .where('formid', formId)
        .delete();
      console.log('Deleted form:', deletedForm);

      return deletedForm;
    });
    
    console.log('Delete transaction completed:', result);
    res.json({ message: 'Form deleted successfully' });
  } catch (error) {
    console.error('Error deleting form:', error);
    if (error.message === 'Form not found') {
      res.status(404).json({ error: 'Form not found' });
    } else {
      res.status(500).json({ 
        error: 'Failed to delete form',
        details: error.message 
      });
    }
  }
});

// Add endpoint to process user selection
router.post('/process-selection', async (req, res) => {
  try {
    const { question, answer, previousSuggestions, userChoice } = req.body;
    
    const finalAnswer = await openAIService.processUserSelection(
      question,
      answer,
      previousSuggestions,
      userChoice
    );

    res.json({ finalAnswer });
  } catch (error) {
    console.error('Error processing selection:', error);
    res.status(500).json({ error: 'Failed to process selection' });
  }
});

// Get form responses
router.get('/:formId/responses', async (req, res) => {
  const { formId } = req.params;
  try {
    const responses = await knex('responses')
      .select(
        'responses.*',
        'forms.title as form_title'
      )
      .join('forms', 'forms.formid', 'responses.formid')
      .where('responses.formid', formId)
      .orderBy('responses.submitted_at', 'desc');

    // Format the responses
    const formattedResponses = responses.map(response => {
      let answersObj = {};
      try {
        const responseData = JSON.parse(response.response_data || '{}');
        // Only take the most recent submission for each response ID
        if (responseData.answers) {
          // Create an object where each variable_name maps to its latest response_text
          answersObj = responseData.answers.reduce((acc, answer) => {
            acc[answer.variable_name] = answer.response_text;
            return acc;
          }, {});
        }
      } catch (e) {
        console.error(`Invalid JSON for response ${response.responseid}:`, e);
      }

      return {
        Response_ID: response.responseid,
        Submission_Date: new Date(response.created_at).toLocaleString(),
        ...prompts.reduce((acc, prompt) => ({
          ...acc,
          [prompt.variable_name]: answersObj[prompt.variable_name] || ''
        }), {})
      };
    });

    // Create CSV with headers using variable names
    const csv = Papa.unparse(formattedResponses, {
      header: true,
      columns: [
        'Response_ID', 
        'Submission_Date', 
        ...prompts.map(p => p.variable_name)
      ]
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=form_responses_${formId}_${new Date().toISOString()}.csv`);
    res.send(csv);

  } catch (error) {
    console.error('Error fetching responses:', error);
    res.status(500).json({ error: 'Failed to fetch responses' });
  }
});

// Get answer guidance
router.post('/:formId/prompts/:promptId/guidance', async (req, res) => {
  const { formId, promptId } = req.params;
  const { answer, previousQA } = req.body;

  try {
    // Get the form and prompt details
    const form = await knex('forms')
      .select('forms.*')
      .where('formid', formId)
      .first();

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const prompt = await knex('prompts')
      .select('*')
      .where({ formid: formId, promptid: promptId })
      .first();

    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    // Get guidance from OpenAI
    const guidance = await openAIService.getAnswerGuidance(
      prompt.question_text,
      answer,
      prompt.validation_criteria,
      previousQA,
      form.starter_prompt // Pass the starter_prompt to OpenAI
    );

    res.json({ guidance });
  } catch (error) {
    console.error('Error getting answer guidance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate final output
router.post('/:formId/output', async (req, res) => {
  const { formId } = req.params;
  const { responses } = req.body;

  try {
    // Get form details
    const form = await knex('forms')
      .select('*')
      .where('formid', formId)
      .first();

    if (!form || !form.output_prompt) {
      return res.status(400).json({ error: 'Form not found or no output prompt configured' });
    }

    // Get all prompts for context
    const prompts = await knex('prompts')
      .select('*')
      .where('formid', formId)
      .orderBy('order');

    // Generate output using OpenAI
    const output = await openAIService.generateFinalOutput(form.output_prompt, prompts, responses);

    // Store both the prompt and output
    return res.json({ 
      output,
      answers: [
        {
          variable_name: 'output_prompt',
          response_text: form.output_prompt
        },
        {
          variable_name: 'output',
          response_text: output
        }
      ]
    });

  } catch (error) {
    console.error('Error generating output:', error);
    res.status(500).json({ error: 'Failed to generate output' });
  }
});

// Save form progress with output
router.post('/:formId/progress-with-output', async (req, res) => {
  try {
    const { formId } = req.params;
    const responses = req.body;
    
    if (!formId) {
      return res.status(400).json({ error: 'Form ID is required' });
    }

    if (!responses || !Array.isArray(responses.answers)) {
      return res.status(400).json({ error: 'Invalid response format' });
    }
    
    // Here you would typically save the progress to a database
    // For now, we'll just acknowledge receipt
    res.json({ status: 'success' });
  } catch (error) {
    console.error('Error saving form progress:', error);
    res.status(500).json({ error: 'Error saving progress' });
  }
});

// Export form responses as CSV
router.get('/:formId/export', async (req, res) => {
  const { formId } = req.params;
  const { responseIds } = req.query;
  
  try {
    // Get form details
    const form = await knex('forms')
      .select('*')
      .where('formid', formId)
      .first();

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // Get prompts ordered by their order
    const prompts = await knex('prompts')
      .select('*')
      .where('formid', formId)
      .orderBy('order');

    // Add output if form has output prompt
    if (form.output_prompt) {
      prompts.push({
        variable_name: 'output',
        question_text: 'Generated Output'
      });
    }

    // Get responses
    let responsesQuery = knex('responses')
      .select('*')
      .where('formid', formId);

    // If specific responseIds are provided, filter by them
    if (responseIds) {
      const ids = responseIds.split(',').map(Number);
      responsesQuery = responsesQuery.whereIn('responseid', ids);
    }

    const responses = await responsesQuery.orderBy('created_at', 'desc');

    // Format responses for CSV
    const formattedResponses = responses.map(response => {
      try {
        const responseData = JSON.parse(response.responses || '{}');
        const answers = responseData.answers || [];
        
        // Create a map of the latest answer for each variable name
        const answerMap = answers.reduce((acc, answer) => {
          acc[answer.variable_name] = answer.response_text;
          return acc;
        }, {});

        // Create row with all prompt responses
        return {
          Response_ID: response.responseid,
          Submission_Date: new Date(response.created_at).toLocaleString(),
          ...prompts.reduce((acc, prompt) => ({
            ...acc,
            [prompt.variable_name]: answerMap[prompt.variable_name] || ''
          }), {})
        };
      } catch (error) {
        console.error(`Error processing response ${response.responseid}:`, error);
        return {
          Response_ID: response.responseid,
          Submission_Date: new Date(response.created_at).toLocaleString()
        };
      }
    });

    // Create CSV with headers
    const csv = Papa.unparse(formattedResponses, {
      header: true,
      columns: [
        'Response_ID',
        'Submission_Date',
        ...prompts.map(p => p.variable_name)
      ]
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=form_responses_${formId}_${new Date().toISOString()}.csv`);
    res.send(csv);

  } catch (error) {
    console.error('Error exporting responses:', error);
    res.status(500).json({ error: 'Failed to export responses' });
  }
});

module.exports = router;