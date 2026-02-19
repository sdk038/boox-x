const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getModel = () => {
  return genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash'
  });
};

const getModelWithSearch = () => {
  return genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    tools: [{ googleSearch: {} }],
  });
};

module.exports = { genAI, getModel, getModelWithSearch };
