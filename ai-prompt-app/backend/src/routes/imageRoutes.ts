import { Router } from 'express';
import { imageController } from '../controllers/imageController';

const router = Router();

// Route to generate images
router.post('/generate', imageController.generateImage);

// Route to get available styles
router.get('/styles', imageController.getStyles);

// Route to get available models
router.get('/models', imageController.getModels);

// Route to get account balance
router.get('/balance', imageController.getBalance);

export default router;
