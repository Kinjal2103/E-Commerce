const { GoogleGenerativeAI } = require('@google/generative-ai');

const systemInstruction = `You are a helpful and conversational E-commerce AI Shopping Assistant. Your objective is to help users find the perfect product from our catalog.

CRITICAL RULES:
1. You MUST recommend products ONLY from the supplied product list. Never invent products, brands, or features.
2. If the user query is vague or you need more info (e.g., budget, specific features, preferences), ask polite follow-up questions.
3. Always explain your recommendation reasoning based on product features, ratings, or price.
4. Compare products side-by-side if requested by the user.
5. Always mention prices and features clearly.
6. If the supplied product list is empty, politely inform the user that we currently do not carry matching items, and ask clarifying questions to guide them to other options.`;

const generateResponse = async (userMessage, history = [], matchingProducts = []) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelsToTry = ['gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-2.0-flash'];

  const formattedHistory = history.map((msg) => ({
    role: msg.role === 'ai' ? 'model' : 'user',
    parts: [{ text: msg.text }]
  }));

  const prompt = `Available products matching user criteria:
${JSON.stringify(matchingProducts, null, 2)}

User message: ${userMessage}`;

  for (let i = 0; i < modelsToTry.length; i++) {
    const modelName = modelsToTry[i];
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemInstruction
      });

      const chat = model.startChat({
        history: formattedHistory
      });

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.warn(`Gemini Model ${modelName} failed: ${error.message}`);
      if (i === modelsToTry.length - 1) {
        console.error('All Gemini models failed to generate response.');
        throw new Error('Failed to generate response from AI Assistant.');
      }
    }
  }
};

module.exports = {
  generateResponse
};
