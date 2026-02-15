const { GoogleGenerativeAI } = require('@google/generative-ai');

// Инициализация Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Получить модель - gemini-2.5-flash (новейшая, бесплатная)
const getModel = () => {
  return genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash'
  });
};

module.exports = { genAI, getModel };
