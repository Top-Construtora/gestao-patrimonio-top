import { Router } from 'express';
import equipmentRoutes from './equipmentRoutes';
import purchaseRoutes from './purchaseRoutes';
import responsibilityTermRoutes from './responsibilityTermRoutes';
import historyRoutes from './historyRoutes';

const router = Router();

// API routes
router.use('/equipment', equipmentRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/responsibility-terms', responsibilityTermRoutes);
router.use('/history', historyRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
