const aiService = require('../services/aiService');

/**
 * POST /api/chat
 * AI Chatbot for placement queries
 */
const chat = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const response = await aiService.chat(message, conversationHistory);

    res.json({
      message: 'Response generated',
      response,
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'Failed to generate response', error: error.message });
  }
};

module.exports = { chat };
