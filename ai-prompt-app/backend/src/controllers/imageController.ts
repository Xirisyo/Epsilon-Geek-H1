import { Request, Response } from 'express';
import { sogniService, STYLE_PRESETS, IMAGE_MODELS } from '../services/sogniService';

interface ImageGenerationRequest {
  prompt: string;
  style?: string;
  model?: string;
  options?: {
    steps?: number;
    guidance?: number;
    numberOfImages?: number;
    width?: number;
    height?: number;
  };
}

export const imageController = {
  generateImage: async (req: Request<{}, {}, ImageGenerationRequest>, res: Response) => {
    try {
      const { prompt, style, model, options } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      console.log(`📝 Image generation request: "${prompt}"`);

      // Initialize Sogni service if not already done
      if (!sogniService.isReady()) {
        await sogniService.initialize();
      }

      // Generate image
      const imageUrls = await sogniService.generateImage(
        prompt,
        style,
        model || IMAGE_MODELS.FLUX_SCHNELL,
        options
      );

      res.json({
        success: true,
        images: imageUrls,
        prompt,
        style: style || STYLE_PRESETS[0].value,
        model: model || IMAGE_MODELS.FLUX_SCHNELL
      });
    } catch (error) {
      console.error('Error in imageController.generateImage:', error);
      res.status(500).json({
        error: 'Failed to generate image',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  getStyles: async (req: Request, res: Response) => {
    try {
      res.json({
        success: true,
        styles: STYLE_PRESETS
      });
    } catch (error) {
      console.error('Error in imageController.getStyles:', error);
      res.status(500).json({
        error: 'Failed to get styles',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  getModels: async (req: Request, res: Response) => {
    try {
      // Try to get available models from Sogni
      if (!sogniService.isReady()) {
        await sogniService.initialize();
      }

      const models = await sogniService.getAvailableModels();
      
      res.json({
        success: true,
        models,
        defaultModel: IMAGE_MODELS.FLUX_SCHNELL
      });
    } catch (error) {
      // If we can't get models from API, return our predefined list
      console.warn('Could not fetch models from API, using defaults:', error);
      res.json({
        success: true,
        models: Object.entries(IMAGE_MODELS).map(([key, value]) => ({
          id: value,
          name: key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
        })),
        defaultModel: IMAGE_MODELS.FLUX_SCHNELL
      });
    }
  },

  getBalance: async (req: Request, res: Response) => {
    try {
      if (!sogniService.isReady()) {
        await sogniService.initialize();
      }

      const balance = await sogniService.getAccountBalance();
      
      res.json({
        success: true,
        balance
      });
    } catch (error) {
      console.error('Error in imageController.getBalance:', error);
      res.status(500).json({
        error: 'Failed to get account balance',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};
