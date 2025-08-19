import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import promptRoutes from './routes/promptRoutes';
import imageRoutes from './routes/imageRoutes';
import { sogniService } from './services/sogniService';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    sogniReady: sogniService.isReady() 
  });
});

// API Routes
app.use('/api', promptRoutes);
app.use('/api/image', imageRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!', 
    message: err.message 
  });
});

// Initialize Sogni service on startup (optional, non-blocking)
sogniService.initialize().catch(error => {
  console.warn('⚠️ Sogni AI service initialization failed on startup:', error.message);
  console.log('ℹ️ The service will retry initialization when first used.');
});

// Start server
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
  console.log(`⚡️[server]: Health check at http://localhost:${PORT}/health`);
  console.log(`🎨[server]: Image generation at http://localhost:${PORT}/api/image/generate`);
});
