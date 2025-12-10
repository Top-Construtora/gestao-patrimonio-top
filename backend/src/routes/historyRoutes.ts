import { Router } from 'express';
import { historyController } from '../controllers/historyController';

const router = Router();

// History routes
router.get('/', historyController.getAll);
router.get('/recent', historyController.getRecent);
router.get('/equipment/:equipmentId', historyController.getByEquipment);
router.get('/entity/:entityType', historyController.getByEntityType);
router.post('/', historyController.create);

export default router;
