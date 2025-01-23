const express = require('express');
const router = express.Router();
const openAIService = require('../services/openaiService');

router.post('/', async (req, res) => {
  try {
    const { question, context } = req.body;

    // Build system message with context
    const systemMessage = `You are a helpful AI assistant helping users fill out a form. Here is the context:
Title: ${context.title}
Description: ${context.description}
Current Question: ${context.currentPrompt}

Previous questions and answers:
${context.previousQuestions.map((q, i) => `Q${i + 1}: ${q.question}\nA${i + 1}: ${q.answer}\n`).join('\n')}`;

    // Get response from OpenAI
    const messages = [
      { role: "system", content: systemMessage },
      { role: "user", content: question }
    ];

    const response = await openAIService.chat(messages, 'CONVERSATIONAL');
    res.json({ response: response.content });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

module.exports = router;
