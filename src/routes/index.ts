import { Router } from 'express';
import contactRoutes from './contactRoutes.js';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Contact routes
router.use('/contact', contactRoutes);

export default router;
