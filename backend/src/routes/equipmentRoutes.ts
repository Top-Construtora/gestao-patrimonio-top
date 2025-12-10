import { Router } from 'express';
import multer from 'multer';
import { equipmentController } from '../controllers/equipmentController';

const router = Router();

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Equipment routes
router.get('/', equipmentController.getAll);
router.get('/stats', equipmentController.getStats);
router.get('/next-asset-number', equipmentController.getNextAssetNumber);
router.get('/:id', equipmentController.getById);
router.post('/', equipmentController.create);
router.put('/:id', equipmentController.update);
router.delete('/:id', equipmentController.delete);

// Equipment actions
router.post('/:id/transfer', equipmentController.transfer);
router.post('/:id/maintenance', equipmentController.registerMaintenance);

// Equipment history
router.get('/:id/history', equipmentController.getHistory);

// Equipment attachments
router.get('/:id/attachments', equipmentController.getAttachments);
router.post('/:id/attachments', upload.single('file'), equipmentController.uploadAttachment);
router.delete('/attachments/:attachmentId', equipmentController.deleteAttachment);

export default router;
