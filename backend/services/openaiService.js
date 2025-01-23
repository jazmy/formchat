const OpenAI = require('openai');
const { getSettings } = require('../models/settings');
const Bottleneck = require('bottleneck');
const logger = require('../utils/logger');

class OpenAIService {
  constructor() {
    this.openai = null;
    this.settings = null;
    this.limiter = new Bottleneck({
      minTime: (60 * 1000) / 20, // default rate limit
      maxConcurrent: 1
    });
  }

  async initialize() {
    try {
      this.settings = await getSettings();
      this.openai = new OpenAI({
        apiKey: this.settings.OPENAI_API_KEY || process.env.OPENAI_API_KEY
      });

      // Update rate limiter if settings exist
      if (this.settings.RATE_LIMIT?.MAX_REQUESTS_PER_MIN) {
        this.limiter = new Bottleneck({
          minTime: (60 * 1000) / this.settings.RATE_LIMIT.MAX_REQUESTS_PER_MIN,
          maxConcurrent: 1
        });
      }
      logger.info('OpenAI service initialized', {
        rateLimit: this.settings.RATE_LIMIT?.MAX_REQUESTS_PER_MIN || 20
      });
    } catch (error) {
      logger.error('Failed to initialize OpenAI service:', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  async getClient() {
    if (!this.openai) {
      await this.initialize();
    }
    return this.openai;
  }

  async getSettings() {
    if (!this.settings) {
      this.settings = await getSettings();
    }
    return this.settings;
  }

  async chat(messages, type = 'CHAT') {
    const client = await this.getClient();
    const settings = await this.getSettings();

    const model = settings.MODELS?.[type] || 'gpt-4';
    const maxTokens = settings.CHAT_PROCESSING?.MAX_TOKENS?.[type] || 1000;
    const temperature = settings.CHAT_PROCESSING?.TEMPERATURE?.[type] || 0.7;

    // Log API request
    logger.info('OpenAI API request', {
      type,
      model,
      maxTokens,
      temperature,
      messageCount: messages.length,
      firstMessage: messages[0]?.content?.slice(0, 100) // Log first 100 chars of first message
    });

    try {
      const startTime = Date.now();
      const completion = await client.chat.completions.create({
        messages,
        model,
        max_tokens: maxTokens,
        temperature: temperature,
      });
      const duration = Date.now() - startTime;

      // Log successful response with full content
      const response = completion.choices[0].message;
      logger.info('OpenAI API response', {
        type,
        model,
        duration,
        tokensUsed: completion.usage?.total_tokens,
        responseLength: response.content.length,
        role: response.role,
        content: response.content, // Log full response
        usage: completion.usage,   // Log detailed token usage
        finishReason: completion.choices[0].finish_reason
      });

      return response;
    } catch (error) {
      // Log error with details
      logger.error('OpenAI API error', {
        type,
        model,
        error: error.message,
        stack: error.stack,
        statusCode: error.status,
        errorType: error.type
      });
      throw error;
    }
  }

  async validateFormResponse(question, answer, variableName, validationCriteria) {
    return this.limiter.schedule(async () => {
      logger.info('Validating form response', { question, answer, variableName, validationCriteria });

      const messages = [
        {
          role: "system",
          content: "You are a helpful assistant that validates form responses. Be friendly and constructive in your feedback."
        },
        {
          role: "user",
          content: `Please validate the following answer for a form question.

Question: ${question}
Answer: "${answer}"
${validationCriteria ? `Validation Criteria: ${validationCriteria}` : ''}

Instructions:
1. Evaluate if the answer meets these criteria:
   - Is it complete and relevant to the question?
   - Does it satisfy any specific validation criteria provided?
   ${validationCriteria ? '- Does it meet the validation criteria listed above?' : ''}

2. If the answer is good, respond with exactly "VALID"

3. If the answer needs improvement, provide:
   - A friendly explanation of what could be improved
   - A specific, actionable suggestion
   
Format your response like this if improvements are needed:
Your answer could be more [improvement area]. Here's a suggestion:
1. [Complete suggested answer]

Remember to be constructive and encouraging!`
        }
      ];

      try {
        const response = await this.chat(messages, 'VALIDATION');
        const validation = response.content.trim();
        
        logger.info('Validation result', { 
          question, 
          answer, 
          validation,
          isValid: validation === 'VALID'
        });

        return validation === 'VALID' ? null : validation;
      } catch (error) {
        logger.error('Error validating form response:', {
          error: error.message,
          stack: error.stack,
          question,
          answer
        });
        throw error;
      }
    });
  }

  async makePromptConversational(prompt) {
    return this.limiter(async () => {
      logger.info('Making prompt conversational', { prompt });
      const messages = [
        {
          role: "system",
          content: "You are a friendly conversational assistant. Rephrase the following form question in a more natural, chatty way. Keep it concise but friendly. Don't add any additional questions or information."
        },
        {
          role: "user",
          content: prompt
        }
      ];

      const response = await this.chat(messages, 'CHAT');
      return response.content.trim();
    });
  }

  async generateWelcomeMessage(formTitle, description) {
    return this.limiter(async () => {
      logger.info('Generating welcome message', { formTitle, description });
      const messages = [
        {
          role: "system",
          content: "You are a friendly assistant. Create a brief, welcoming message for a form. Keep it under 2 sentences."
        },
        {
          role: "user",
          content: `Form title: ${formTitle}\nDescription: ${description}`
        }
      ];

      const response = await this.chat(messages, 'WELCOME');
      return response.content.trim();
    });
  }

  async getAnswerGuidance(question, answer, validationCriteria, previousQA = [], starterPrompt) {
    logger.info('Getting answer guidance', { question, answer, validationCriteria, previousQA, starterPrompt });
    const messages = [
      {
        role: "system",
        content: "You are a helpful assistant guiding users to improve their form responses."
      }
    ];

    if (previousQA && previousQA.length > 0) {
      previousQA.forEach(qa => {
        messages.push(
          { role: "user", content: qa.question },
          { role: "assistant", content: qa.answer }
        );
      });
    }

    messages.push({
      role: "user",
      content: `Question: ${question}\nCurrent Answer: ${answer}\nValidation Criteria: ${validationCriteria || ''}\n${starterPrompt || 'How can I improve my answer?'}`
    });

    const response = await this.chat(messages, 'GUIDANCE');
    return response.content.trim();
  }

  async processUserSelection(question, answer, previousSuggestions, userChoice) {
    logger.info('Processing user selection', { question, answer, previousSuggestions, userChoice });
    const messages = [
      {
        role: "system",
        content: "You are a helpful assistant processing user selections for form responses."
      },
      {
        role: "user",
        content: `Question: ${question}\nOriginal Answer: ${answer}\nPrevious Suggestions: ${previousSuggestions}\nUser Choice: ${userChoice}\n\nPlease process this selection and provide the final answer.`
      }
    ];

    const response = await this.chat(messages, 'VALIDATION');
    return response.content.trim();
  }

  async generateFinalOutput(outputPrompt, prompts, responses) {
    try {
      logger.info('Generating final output', { 
        outputPrompt, 
        numPrompts: prompts?.length,
        numResponses: responses?.length 
      });

      // Construct the context from responses
      const context = [
        {
          role: 'system',
          content: 'You are a helpful assistant generating final output based on form responses.'
        }
      ];

      // Add all question-answer pairs
      if (Array.isArray(responses)) {
        responses.forEach(answer => {
          const prompt = prompts.find(p => p.variable_name === answer.variable_name);
          if (prompt) {
            context.push({
              role: 'user',
              content: prompt.question_text
            });
            context.push({
              role: 'assistant',
              content: answer.response_text
            });
          }
        });
      }

      // Add the output prompt
      context.push({
        role: 'user',
        content: outputPrompt
      });

      // Get the final output from OpenAI
      const response = await this.chat(context, 'OUTPUT');
      return response.content;
    } catch (error) {
      logger.error('Error generating final output:', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }
}

const service = new OpenAIService();
module.exports = service;