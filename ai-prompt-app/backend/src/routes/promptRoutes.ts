import { Router, Request, Response } from 'express';
import { promptController } from '../controllers/promptController';

const router = Router();

// Route to handle prompt requests
router.post('/prompt', promptController.handlePrompt);

// Route to get conversation history
router.get('/history', promptController.getHistory);

// Route to clear conversation history
router.delete('/history', promptController.clearHistory);

export default router;
