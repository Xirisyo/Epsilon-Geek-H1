import { sogniService, STYLE_PRESETS } from './sogniService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'image';
  imageUrl?: string;
}

interface ImageGenerationOptions {
  style?: string;
  model?: string;
  numberOfImages?: number;
}

export const aiService = {
  generateResponse: async (prompt: string, conversationHistory: Message[]): Promise<string> => {
    try {
      // Check if the prompt is asking for image generation
      const isImageRequest = /\b(create|generate|draw|paint|imagine|design|make|sketch|render|illustrate)\b.*\b(image|picture|photo|illustration|drawing|artwork|art|design|graphic|visual)\b/i.test(prompt) ||
                            /\b(image|picture|photo|illustration|drawing|artwork|art|design|graphic|visual)\b.*\b(of|with|showing|depicting|featuring)\b/i.test(prompt);

      if (isImageRequest) {
        // Extract style preference if mentioned
        let selectedStyle = STYLE_PRESETS[5].value; // Default to Realistic
        
        for (const preset of STYLE_PRESETS) {
          if (prompt.toLowerCase().includes(preset.title.toLowerCase())) {
            selectedStyle = preset.value;
            break;
          }
        }

        // Clean the prompt for image generation (remove style keywords)
        let cleanPrompt = prompt;
        for (const preset of STYLE_PRESETS) {
          cleanPrompt = cleanPrompt.replace(new RegExp(`\\b${preset.title}\\b`, 'gi'), '').trim();
        }
        cleanPrompt = cleanPrompt.replace(/\b(create|generate|draw|paint|imagine|design|make|sketch|render|illustrate)\s+(an?\s+)?/gi, '').trim();
        cleanPrompt = cleanPrompt.replace(/\b(image|picture|photo|illustration|drawing|artwork|art|design|graphic|visual)\s+(of|with|showing|depicting|featuring)?\s*/gi, '').trim();

        return `I'll generate an image for you: "${cleanPrompt}" in ${selectedStyle} style. Use the image generation feature to create this.`;
      }

      // TODO: Implement your text AI provider integration here
      // This is a placeholder that returns a simple response
      
      // For now, just echo back the prompt with a simple response
      const response = `Received: "${prompt}"\n\nThis is a placeholder response. To generate images, try asking me to "create an image of..." or "generate a picture of...". Otherwise, integrate your preferred text AI service here.`;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return response;
      
    } catch (error) {
      console.error('Error generating response:', error);
      throw new Error('Failed to generate response');
    }
  },

  generateImage: async (prompt: string, options?: ImageGenerationOptions): Promise<string[]> => {
    try {
      // Initialize Sogni service if needed
      if (!sogniService.isReady()) {
        await sogniService.initialize();
      }

      // Generate image using Sogni
      const imageUrls = await sogniService.generateImage(
        prompt,
        options?.style,
        options?.model,
        {
          numberOfImages: options?.numberOfImages || 1
        }
      );

      return imageUrls;
    } catch (error) {
      console.error('Error generating image:', error);
      throw new Error('Failed to generate image');
    }
  },

  // Helper function to detect if a message contains an image generation request
  isImageGenerationRequest: (message: string): boolean => {
    const imageKeywords = [
      'create.*image', 'generate.*image', 'draw', 'paint', 'imagine',
      'create.*picture', 'generate.*picture', 'design', 'sketch',
      'create.*illustration', 'generate.*illustration', 'render'
    ];
    
    const pattern = new RegExp(imageKeywords.join('|'), 'i');
    return pattern.test(message);
  }
};
