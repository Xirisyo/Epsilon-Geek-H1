const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const SogniService = require('./services/sogniService');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../../frontend')));

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, '../images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Serve generated images
app.use('/images', express.static(imagesDir));

// Initialize Sogni AI service
let sogniService;

async function initializeSogniService() {
  try {
    sogniService = new SogniService({
      username: process.env.SOGNI_USERNAME,
      password: process.env.SOGNI_PASSWORD,
      network: process.env.SOGNI_NETWORK || 'fast'
    });
    await sogniService.initialize();
    console.log('✅ Sogni AI service initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Sogni AI service:', error);
    process.exit(1);
  }
}

// API Routes

// Generate Business Logo
app.post('/api/generate/business-logo', async (req, res) => {
  try {
    const { 
      businessName, 
      businessType, 
      style = 'modern',
      colors = '',
      additionalDetails = '' 
    } = req.body;

    if (!businessName || !businessType) {
      return res.status(400).json({ 
        error: 'Business name and type are required' 
      });
    }

    console.log(`🎨 Generating business logo for ${businessName}...`);

    const result = await sogniService.generateBusinessLogo({
      businessName,
      businessType,
      style,
      colors,
      additionalDetails
    });

    res.json({
      success: true,
      imageUrls: result.imageUrls,
      metadata: result.metadata
    });

  } catch (error) {
    console.error('Error generating business logo:', error);
    res.status(500).json({ 
      error: 'Failed to generate business logo',
      message: error.message 
    });
  }
});

// Generate Business Card
app.post('/api/generate/business-card', async (req, res) => {
  try {
    const { 
      businessName,
      ownerName,
      title,
      contactInfo,
      style = 'professional',
      colors = '',
      logoUrl = null,
      additionalDetails = ''
    } = req.body;

    if (!businessName || !ownerName) {
      return res.status(400).json({ 
        error: 'Business name and owner name are required' 
      });
    }

    console.log(`💼 Generating business card for ${businessName}...`);

    const result = await sogniService.generateBusinessCard({
      businessName,
      ownerName,
      title,
      contactInfo,
      style,
      colors,
      logoUrl,
      additionalDetails
    });

    res.json({
      success: true,
      imageUrls: result.imageUrls,
      metadata: result.metadata
    });

  } catch (error) {
    console.error('Error generating business card:', error);
    res.status(500).json({ 
      error: 'Failed to generate business card',
      message: error.message 
    });
  }
});

// Generate Instagram Logo
app.post('/api/generate/instagram-logo', async (req, res) => {
  try {
    const { 
      businessName,
      businessType,
      style = 'social-media-friendly',
      colors = '',
      hashtags = '',
      additionalDetails = ''
    } = req.body;

    if (!businessName || !businessType) {
      return res.status(400).json({ 
        error: 'Business name and type are required' 
      });
    }

    console.log(`📱 Generating Instagram logo for ${businessName}...`);

    const result = await sogniService.generateInstagramLogo({
      businessName,
      businessType,
      style,
      colors,
      hashtags,
      additionalDetails
    });

    res.json({
      success: true,
      imageUrls: result.imageUrls,
      metadata: result.metadata
    });

  } catch (error) {
    console.error('Error generating Instagram logo:', error);
    res.status(500).json({ 
      error: 'Failed to generate Instagram logo',
      message: error.message 
    });
  }
});

// Get available models
app.get('/api/models', async (req, res) => {
  try {
    const models = await sogniService.getAvailableModels();
    res.json({ success: true, models });
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ 
      error: 'Failed to fetch models',
      message: error.message 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: sogniService ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Start server
async function startServer() {
  await initializeSogniService();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📁 Images will be saved in: ${imagesDir}`);
  });
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...');
  if (sogniService) {
    await sogniService.cleanup();
  }
  process.exit(0);
});

startServer().catch(console.error);
