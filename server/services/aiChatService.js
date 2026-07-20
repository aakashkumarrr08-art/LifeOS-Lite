import { GoogleGenAI } from '@google/genai';
import { config } from '../config/env.js';
import createHttpError from '../utils/createHttpError.js';

const CHAT_SYSTEM_INSTRUCTION = `You are LifeOS Lite's Ask Anything AI assistant. Give accurate, helpful, concise answers for general knowledge, programming, mathematics, science, history, English, current affairs, interview preparation, and career guidance. Use Markdown when it improves clarity. For code, explain assumptions, provide safe examples, and never expose secrets. If a request needs current facts, say that your knowledge may be incomplete and recommend checking a reliable current source. Do not claim access to private LifeOS Lite data, tools, or the internet.`;

const buildGeminiContents = (history, message) => [
  ...history.map((entry) => ({
    role: entry.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: entry.content }],
  })),
  {
    role: 'user',
    parts: [{ text: message }],
  },
];

const getErrorStatus = (error) => error?.status || error?.response?.status || error?.statusCode;

const hasProviderError = (error, errorCode) => error?.message?.includes(errorCode);

const getResponseText = (response) => {
  const text = typeof response?.text === 'function' ? response.text() : response?.text;
  return typeof text === 'string' ? text.trim() : '';
};

const generateAiChatResponse = async ({ history, message, userId }) => {
  if (!userId) {
    throw createHttpError(401, 'Authentication is required to use Ask Anything AI.');
  }

  if (!config.geminiApiKey) {
    throw createHttpError(503, 'The Ask Anything AI service is not configured.', [], true);
  }

  const gemini = new GoogleGenAI({ apiKey: config.geminiApiKey });

  try {
    const response = await gemini.models.generateContent({
      model: config.geminiModel,
      contents: buildGeminiContents(history, message),
      config: {
        maxOutputTokens: 1024,
        systemInstruction: CHAT_SYSTEM_INSTRUCTION,
        temperature: 0.4,
      },
    });
    const content = getResponseText(response);

    if (!content) {
      throw createHttpError(502, 'Gemini returned an empty response. Please try again.', [], true);
    }

    return {
      content,
      model: config.geminiModel,
    };
  } catch (error) {
    console.error("===== GEMINI ERROR =====");
    console.error(error);
    console.error(error.message);
    console.error("========================");
    if (error.statusCode) {
      throw error;
    }

    if (hasProviderError(error, 'API_KEY_INVALID')) {
      throw createHttpError(
        503,
        'The Ask Anything AI service needs a valid Gemini API key. Please update GEMINI_API_KEY.',
        [],
        true,
      );
    }

    if (getErrorStatus(error) === 429) {
      throw createHttpError(429, 'Gemini is busy. Please wait a moment and try again.');
    }

    if (getErrorStatus(error) === 404) {
      throw createHttpError(
        503,
        `The configured Gemini model "${config.geminiModel}" is unavailable. Update GEMINI_MODEL and restart the server.`,
        [],
        true,
      );
    }

    if (getErrorStatus(error) === 400) {
      throw createHttpError(400, 'Gemini could not process this message. Please rephrase it and try again.');
    }

    throw createHttpError(502, 'Gemini could not generate a response right now. Please try again.', [], true);
  }
};

export { buildGeminiContents, generateAiChatResponse };
