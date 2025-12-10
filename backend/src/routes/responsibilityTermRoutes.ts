import { Router } from 'express';
import { responsibilityTermController } from '../controllers/responsibilityTermController';

const router = Router();

// Responsibility term routes
router.get('/equipment/:equipmentId', responsibilityTermController.getByEquipment);
router.get('/:id', responsibilityTermController.getById);
router.post('/', responsibilityTermController.create);
router.patch('/:id/status', responsibilityTermController.updateStatus);
router.delete('/:id', responsibilityTermController.delete);

export default router;
