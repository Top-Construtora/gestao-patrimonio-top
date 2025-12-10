import { Router } from 'express';
import { purchaseController } from '../controllers/purchaseController';

const router = Router();

// Purchase routes
router.get('/', purchaseController.getAll);
router.get('/stats', purchaseController.getStats);
router.get('/:id', purchaseController.getById);
router.post('/', purchaseController.create);
router.put('/:id', purchaseController.update);
router.delete('/:id', purchaseController.delete);

// Purchase actions
router.post('/:id/approve', purchaseController.approve);
router.post('/:id/reject', purchaseController.reject);
router.post('/:id/acquire', purchaseController.markAsAcquired);
router.post('/:id/convert-to-equipment', purchaseController.convertToEquipment);

export default router;
