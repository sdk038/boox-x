const { GoogleGenerativeAI } = require('@google/generative-ai');

// Инициализация Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Получить модель - gemini-2.0-flash (быстрая, высокий лимит бесплатных запросов)
const getModel = () => {
  return genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash'
  });
};

module.exports = { genAI, getModel };
