const { GoogleGenerativeAI } = require('@google/generative-ai');

// Инициализация Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Получить модель - gemini-1.5-flash (1500 запросов/день на бесплатном плане)
const getModel = () => {
  return genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash'
  });
};

module.exports = { genAI, getModel };
