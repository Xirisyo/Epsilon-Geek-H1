import { Request, Response } from 'express';
import { aiService } from '../services/aiService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// In-memory storage for conversation history (use a database in production)
let conversationHistory: Message[] = [];

export const promptController = {
  handlePrompt: async (req: Request, res: Response) => {
    try {
      const { prompt, messages } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      // Add user message to history
      const userMessage: Message = {
        role: 'user',
        content: prompt,
        timestamp: new Date()
      };
      conversationHistory.push(userMessage);

      // Get AI response
      const aiResponse = await aiService.generateResponse(prompt, messages || []);

      // Add AI response to history
      const assistantMessage: Message = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      conversationHistory.push(assistantMessage);

      res.json({ 
        response: aiResponse,
        conversationId: 'default' // You can implement session management here
      });
    } catch (error) {
      console.error('Error in promptController:', error);
      res.status(500).json({ 
        error: 'Failed to generate response',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  getHistory: async (req: Request, res: Response) => {
    try {
      res.json({ 
        history: conversationHistory,
        count: conversationHistory.length 
      });
    } catch (error) {
      console.error('Error getting history:', error);
      res.status(500).json({ error: 'Failed to get conversation history' });
    }
  },

  clearHistory: async (req: Request, res: Response) => {
    try {
      conversationHistory = [];
      res.json({ message: 'Conversation history cleared' });
    } catch (error) {
      console.error('Error clearing history:', error);
      res.status(500).json({ error: 'Failed to clear conversation history' });
    }
  }
};
