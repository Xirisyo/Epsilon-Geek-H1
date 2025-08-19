# Sogni AI SDK - Complete Documentation

## Table of Contents
1. [Overview](#overview)
2. [Installation](#installation)
3. [Prerequisites](#prerequisites)
4. [Quick Start Guide](#quick-start-guide)
5. [Running Examples](#running-examples)
6. [API Reference](#api-reference)
7. [Advanced Usage](#advanced-usage)
8. [Development Setup](#development-setup)
9. [Troubleshooting](#troubleshooting)

## Overview

**Sogni AI SDK** is a JavaScript/TypeScript client library for interacting with the Sogni AI Supernet - a decentralized network (DePIN protocol) for creative AI image generation. The SDK uses WebSocket connections for efficient real-time communication between clients, servers, and GPU workers.

### Key Features
- 🎨 AI image generation using various models
- 🔄 Real-time progress updates via WebSocket
- 💰 Token-based payment system (SOGNI/Spark tokens)
- 🌐 Two network types: Fast (high-end GPUs) and Relaxed (Mac devices)
- 🎮 ControlNet support for advanced image control
- 📊 Event-driven and Promise-based APIs

## Installation

### Using npm
```bash
npm install @sogni-ai/sogni-client
```

### Using yarn
```bash
yarn add @sogni-ai/sogni-client
```

### For Development (from source)
```bash
# Clone the repository
git clone https://github.com/Sogni-AI/sogni-client.git
cd sogni-ai

# Install dependencies
npm install

# Build the project
npm run build

# For development with watch mode
npm run watch
```

## Prerequisites

### 1. Create a Sogni Account
- Sign up at [Web App](https://app.sogni.ai) or [Mac App](https://www.sogni.ai/studio)
- Confirm your email to receive free tokens
- Your account is linked to a Base blockchain wallet

### 2. Get Tokens
- **Free tokens**: Claim daily bonus tokens in the rewards section
- **Purchase tokens**: Buy Spark tokens with credit card in the app

### 3. Node.js Requirements
- Node.js version 14 or higher
- npm or yarn package manager

## Quick Start Guide

### Basic Setup and Image Generation

```javascript
// 1. Import the SDK
import { SogniClient } from '@sogni-ai/sogni-client';

// 2. Set your credentials
const USERNAME = 'your-username';
const PASSWORD = 'your-password';

// 3. Initialize the client
async function generateImage() {
  // Create client instance
  const client = await SogniClient.createInstance({
    appId: 'my-unique-app-id', // Must be unique (UUID recommended)
    network: 'fast' // or 'relaxed' for cheaper generation
  });

  // 4. Login to your account
  await client.account.login(USERNAME, PASSWORD);

  // 5. Wait for available models
  const models = await client.projects.waitForModels();
  
  // 6. Select a model (choosing the most popular)
  const model = models.reduce((a, b) => 
    a.workerCount > b.workerCount ? a : b
  );

  // 7. Create an image generation project
  const project = await client.projects.create({
    modelId: model.id,
    positivePrompt: 'A beautiful sunset over mountains',
    negativePrompt: 'low quality, blurry, distorted',
    stylePrompt: 'photorealistic, 8k',
    steps: 20,
    guidance: 7.5,
    numberOfImages: 1
  });

  // 8. Wait for completion and get image URLs
  const imageUrls = await project.waitForCompletion();
  console.log('Generated images:', imageUrls);

  // 9. Logout when done
  await client.account.logout();
}

generateImage().catch(console.error);
```

## Running Examples

### 1. Setup Example Files

The SDK includes two example files in the `examples/` directory:

#### Promise-Based Example (`examples/promise_based.mjs`)
```bash
# 1. Navigate to sogni-ai directory
cd sogni-ai

# 2. Build the SDK (if not already built)
npm run build

# 3. Edit the example file and add your credentials
# Open examples/promise_based.mjs and update:
# - USERNAME = 'your-username'
# - PASSWORD = 'your-password'

# 4. Run the example
node examples/promise_based.mjs
```

#### Event-Driven Example (`examples/event_driven.js`)
```bash
# 1. Edit credentials in examples/event_driven.js
# 2. Run the example
node examples/event_driven.js
```

### 2. Example Output Structure
When running examples, images will be:
- Downloaded to `./images/` directory
- Named with unique identifiers
- Available for 24 hours (auto-deleted after)

## API Reference

### Client Configuration

```typescript
interface SogniClientConfig {
  appId: string;           // Unique app identifier (required)
  network: 'fast' | 'relaxed'; // Network type
  logger?: Logger;         // Custom logger (optional)
  logLevel?: LogLevel;     // 'debug' | 'info' | 'warn' | 'error'
  testnet?: boolean;       // Use testnet (optional)
}
```

### Project Parameters

```typescript
interface ProjectParams {
  // Required
  modelId: string;         // Model to use for generation
  positivePrompt: string;  // What you want to see
  
  // Optional
  negativePrompt?: string; // What to avoid
  stylePrompt?: string;    // Style description
  numberOfImages?: number; // Images to generate (default: 1)
  steps?: number;          // Inference steps (20-40 for SD, 4 for Flux)
  guidance?: number;       // Guidance scale (default: 7.5)
  seed?: number;           // Seed for reproducibility
  
  // Size configuration
  sizePreset?: string;     // Preset size ID or 'custom'
  width?: number;          // Custom width (256-2048)
  height?: number;         // Custom height (256-2048)
  
  // Advanced
  scheduler?: Scheduler;   // Sampling scheduler
  tokenType?: 'sogni' | 'spark'; // Payment token
  disableNSFWFilter?: boolean;    // Disable NSFW filter
  numberOfPreviews?: number;      // Preview images during generation
  
  // Image-to-Image
  startingImage?: File | Buffer | Blob;
  startingImageStrength?: number; // 0-1, default 0.5
  
  // ControlNet
  controlNet?: ControlNetParams;
}
```

### Event Handling

#### Project Events
```javascript
project.on('progress', (percentage) => {
  console.log(`Progress: ${percentage}%`);
});

project.on('jobCompleted', (job) => {
  console.log('Job done:', job.resultUrl);
});

project.on('completed', (imageUrls) => {
  console.log('All images ready:', imageUrls);
});

project.on('failed', (error) => {
  console.error('Generation failed:', error);
});
```

#### Global Events
```javascript
client.projects.on('project', (event) => {
  // Handle project-level events
});

client.projects.on('job', (event) => {
  // Handle job-level events
});
```

## Advanced Usage

### 1. Using ControlNet

```javascript
import fs from 'fs';

const controlImage = fs.readFileSync('./control-image.jpg');

const project = await client.projects.create({
  modelId: 'stable-diffusion-model',
  positivePrompt: 'make the person older',
  steps: 20,
  controlNet: {
    name: 'openpose',     // ControlNet type
    image: controlImage,  // Control image
    strength: 0.8,        // Control strength (0-1)
    mode: 'balanced'      // balanced | prompt_priority | cn_priority
  }
});
```

### 2. Custom Size Presets

```javascript
// Get available size presets for a model
const presets = await client.projects.getSizePresets('fast', 'flux1-schnell-fp8');

// Use a preset
const project = await client.projects.create({
  modelId: 'flux1-schnell-fp8',
  sizePreset: 'landscape_16_9',
  // ... other parameters
});

// Or use custom dimensions
const customProject = await client.projects.create({
  modelId: 'flux1-schnell-fp8',
  sizePreset: 'custom',
  width: 1280,
  height: 720,
  // ... other parameters
});
```

### 3. Image-to-Image Generation

```javascript
const sourceImage = fs.readFileSync('./source.jpg');

const project = await client.projects.create({
  modelId: 'stable-diffusion-model',
  positivePrompt: 'transform to anime style',
  startingImage: sourceImage,
  startingImageStrength: 0.7, // Higher = more like original
  // ... other parameters
});
```

## Development Setup

### Building from Source

```bash
# Clone repository
git clone https://github.com/Sogni-AI/sogni-client.git
cd sogni-client

# Install dependencies
npm install

# Build commands
npm run build        # Build for production
npm run watch       # Watch mode for development
npm run watch:esm   # Watch mode for ESM

# Code quality
npm run prettier     # Check formatting
npm run prettier:fix # Fix formatting

# Documentation
npm run docs        # Generate TypeDoc documentation
```

### Project Structure
```
sogni-ai/
├── src/                 # TypeScript source code
│   ├── index.ts        # Main entry point
│   ├── ApiGroup.ts     # Base API group class
│   ├── Account/        # Account management
│   ├── Projects/       # Project/Job handling
│   └── Stats/          # Statistics API
├── dist/               # Compiled JavaScript (after build)
├── examples/           # Usage examples
├── docs/               # Generated documentation
└── package.json        # Project configuration
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Authentication Failed
```
Error: Invalid credentials
```
**Solution**: Verify username/password and ensure your account is active.

#### 2. Insufficient Tokens
```
Error: Insufficient balance
```
**Solution**: Check token balance in the app and claim daily rewards or purchase tokens.

#### 3. WebSocket Connection Issues
```
Error: WebSocket connection failed
```
**Solution**: 
- Check internet connection
- Ensure firewall allows WebSocket connections
- Verify the appId is unique

#### 4. Model Not Available
```
Error: No workers available for model
```
**Solution**: 
- Wait for workers to become available
- Try a different model
- Switch between 'fast' and 'relaxed' networks

#### 5. Rate Limiting
```
Error: Rate limit exceeded
```
**Solution**: Wait a few minutes before making more requests.

### Debug Mode

Enable debug logging for troubleshooting:

```javascript
const client = await SogniClient.createInstance({
  appId: 'debug-app',
  network: 'fast',
  logLevel: 'debug' // Enable detailed logging
});
```

## Important Notes

1. **Image Storage**: Generated images are stored for 24 hours only. Download them promptly.

2. **Token Usage**: 
   - Fast network: Higher cost, faster generation
   - Relaxed network: Lower cost, slower generation
   - Complex prompts and higher resolution increase token cost

3. **AppId Uniqueness**: Each appId must be unique. Using duplicate IDs will close previous connections.

4. **Network Selection**: Choose based on your needs:
   - `fast`: For production or time-sensitive generation
   - `relaxed`: For development or cost-sensitive projects

5. **API Limits**: Respect rate limits to avoid temporary bans.

## Support and Resources

- **GitHub Repository**: https://github.com/Sogni-AI/sogni-client
- **API Documentation**: https://sdk-docs.sogni.ai
- **Web App**: https://app.sogni.ai
- **Mac App**: https://www.sogni.ai/studio
- **Report Issues**: https://github.com/Sogni-AI/sogni-client/issues

## License

ISC License - See the repository for full license text.
