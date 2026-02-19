const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getModel = (jsonMode = false) => {
  const config = { model: 'gemini-2.0-flash' };
  if (jsonMode) {
    config.generationConfig = {
      responseMimeType: 'application/json',
      temperature: 0.7,
    };
  }
  return genAI.getGenerativeModel(config);
};

const getModelWithSearch = (jsonMode = false) => {
  const config = {
    model: 'gemini-2.0-flash',
    tools: [{ googleSearch: {} }],
  };
  if (jsonMode) {
    config.generationConfig = {
      temperature: 0.7,
    };
  }
  return genAI.getGenerativeModel(config);
};

module.exports = { genAI, getModel, getModelWithSearch };
