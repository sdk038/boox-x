const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// gemini-1.5-flash: 1500 запросов/день, 15 запросов/мин на бесплатном плане
const getModel = () => {
  return genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash'
  });
};

module.exports = { genAI, getModel };
