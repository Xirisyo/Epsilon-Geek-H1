import { SogniClient } from '@sogni-ai/sogni-client';
import dotenv from 'dotenv';

dotenv.config();

// Available image models - matching exact IDs from Sogni examples
export const IMAGE_MODELS = {
  FLUX_SCHNELL: 'flux1-schnell-fp8',
  FLUX_DEV: 'flux1-dev',
  STABLE_DIFFUSION_XL: 'stable-diffusion-xl'
} as const;

// Style presets for image generation
export const STYLE_PRESETS = [
  {
    title: "Anime",
    value: "amazing, award-winning, anime"
  },
  {
    title: "Cartoon",
    value: "cartoon, stylized, exaggerated features, vibrant colors, playful"
  },
  {
    title: "Comic Book",
    value: "comic book style, dynamic, vibrant, action-packed"
  },
  {
    title: "Cyberpunk",
    value: "high-tech, neon colors, futuristic cityscapes"
  },
  {
    title: "Fantasy",
    value: "magical, mythical creatures, enchanting environments"
  },
  {
    title: "Realistic",
    value: "photorealistic, highly detailed, real-world, realistic lighting"
  },
  {
    title: "Oil Painting",
    value: "oil painting, artistic, brushstrokes, classical art style"
  },
  {
    title: "Watercolor",
    value: "watercolor painting, soft colors, artistic, flowing"
  },
  {
    title: "3D Render",
    value: "3D render, CGI, high quality, detailed, modern"
  },
  {
    title: "Minimalist",
    value: "minimalist, simple, clean lines, modern design"
  }
];

class SogniService {
  private client: SogniClient | null = null;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    // If already initializing, wait for the existing promise
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // If already initialized, return immediately
    if (this.isInitialized) {
      return;
    }

    // Start initialization
    this.initializationPromise = this._performInitialization();
    return this.initializationPromise;
  }

  private async _performInitialization(): Promise<void> {
    try {
      // Remove quotes from env variables if present
      const username = process.env.SOGNI_USERNAME?.replace(/"/g, '');
      const password = process.env.SOGNI_PASSWORD?.replace(/"/g, '');
      const appId = process.env.SOGNI_APP_ID?.replace(/"/g, '');

      if (!username || !password || !appId) {
        throw new Error('Sogni AI credentials are not configured. Please set SOGNI_USERNAME, SOGNI_PASSWORD, and SOGNI_APP_ID in your .env file');
      }

      console.log('🎨 Initializing Sogni AI client...');
      console.log(`   Username: ${username}`);
      
      // EXACTLY like the express example
      this.client = await SogniClient.createInstance({
        appId: appId,
        network: 'relaxed' // Use relaxed for cheaper costs
      });
      
      await this.client.account.login(username, password);
      await this.client.projects.waitForModels();
      
      // Add a small delay to ensure models are fully loaded
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.isInitialized = true;
      console.log('✅ Sogni AI client initialized successfully');
      console.log(`   Available models: ${this.client.projects.availableModels?.length || 0}`);
    } catch (error) {
      console.error('❌ Failed to initialize Sogni AI client:', error);
      this.client = null;
      this.isInitialized = false;
      this.initializationPromise = null;
      throw error;
    }
  }

  async generateImage(
    prompt: string,
    style?: string,
    modelId: string = IMAGE_MODELS.FLUX_SCHNELL,
    options?: {
      steps?: number;
      guidance?: number;
      numberOfImages?: number;
      width?: number;
      height?: number;
    }
  ): Promise<string[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.client) {
      throw new Error('Sogni AI client is not initialized');
    }

    // Retry logic for when models are updating
    let retries = 3;
    let lastError: any;
    
    while (retries > 0) {
      try {
        // Try to find an available model
        const availableModels = this.client.projects.availableModels;
        let selectedModel = 'flux1-schnell-fp8';
        
        // If flux isn't available, use the first available model
        if (availableModels && availableModels.length > 0) {
          const fluxModel = availableModels.find((m: any) => m.id === 'flux1-schnell-fp8');
          if (!fluxModel) {
            console.log('⚠️ Flux model not found, using first available model');
            selectedModel = availableModels[0].id;
          }
        }
        
        const project = await this.client.projects.create({
          modelId: selectedModel,
          positivePrompt: prompt,
          negativePrompt: '',  // Required by TypeScript
          stylePrompt: style || '',
          steps: 1,  // Minimum to reduce cost
          guidance: 1,
          numberOfImages: 1
        });
        
        // If we get here, project was created successfully
        console.log(`🎨 Generating image with prompt: "${prompt}"`);
        const imageUrls = await project.waitForCompletion();
        console.log(`✅ Image generation completed`);
        return imageUrls;
        
      } catch (error: any) {
        lastError = error;
        
        // If models are updating, wait and retry
        if (error.code === 4004 && retries > 1) {
          console.log('⏳ Models updating, waiting 3 seconds...');
          await new Promise(resolve => setTimeout(resolve, 3000));
          retries--;
          continue;
        }
        
        // Break out of loop for other errors
        break;
      }
    }
    
    // Handle the last error
    if (lastError) {
      console.error('Error generating image:', lastError);
      
      if (lastError.code === 4004) {
        throw new Error('Models are still updating. Please try again in a moment.');
      }
      
      if (lastError.status === 404 || lastError.payload?.errorCode === 102) {
        this.isInitialized = false;
        this.initializationPromise = null;
        throw new Error('Connection issue. Please try again.');
      }
      
      throw new Error('Failed to generate image: ' + (lastError.message || 'Unknown error'));
    }
    
    throw new Error('Failed to generate image after retries');
  }

  async getAvailableModels() {
    // Return hardcoded models for now as the API might not support getModels
    return Object.entries(IMAGE_MODELS).map(([key, value]) => ({
      id: value,
      name: key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
    }));
  }

  async getAccountBalance() {
    // This method might not be available in the current API version
    // Return a placeholder or remove from usage
    return { balance: 'N/A' };
  }

  isReady(): boolean {
    return this.isInitialized && this.client !== null;
  }
}

// Export singleton instance
export const sogniService = new SogniService();
