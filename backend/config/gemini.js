const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const DEFAULT_SEARCH_MODEL = process.env.GEMINI_SEARCH_MODEL || DEFAULT_MODEL;

const getModel = (jsonMode = false) => {
  const config = {
    model: DEFAULT_MODEL,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
    },
  };
  if (jsonMode) {
    config.generationConfig.responseMimeType = 'application/json';
  }
  return genAI.getGenerativeModel(config);
};

const getModelWithSearch = (jsonMode = false) => {
  const config = {
    model: DEFAULT_SEARCH_MODEL,
    tools: [{ googleSearch: {} }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
    },
  };
  if (jsonMode) {
    config.generationConfig.responseMimeType = 'application/json';
  }
  return genAI.getGenerativeModel(config);
};

module.exports = { genAI, getModel, getModelWithSearch };
