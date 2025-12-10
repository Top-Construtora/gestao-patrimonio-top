import { Request, Response } from 'express';
import { equipmentService } from '../services/equipmentService';
import { ApiResponse } from '../types';

export const equipmentController = {
  // GET /api/equipment
  async getAll(req: Request, res: Response) {
    try {
      const equipment = await equipmentService.getAll();
      const response: ApiResponse<typeof equipment> = {
        success: true,
        data: equipment,
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      res.status(500).json(response);
    }
  },

  // GET /api/equipment/stats
  async getStats(req: Request, res: Response) {
    try {
      const stats = await equipmentService.getStats();
      const response: ApiResponse<typeof stats> = {
        success: true,
        data: stats,
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      res.status(500).json(response);
    }
  },

  // GET /api/equipment/next-asset-number
  async getNextAssetNumber(req: Request, res: Response) {
    try {
      const assetNumber = await equipmentService.getNextAssetNumber();
      const response: ApiResponse<{ assetNumber: string }> = {
        success: true,
        data: { assetNumber },
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      res.status(500).json(response);
    }
  },

  // GET /api/equipment/:id
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const equipment = await equipmentService.getById(id);

      if (!equipment) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Equipment not found',
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<typeof equipment> = {
        success: true,
        data: equipment,
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      res.status(500).json(response);
    }
  },

  // POST /api/equipment
  async create(req: Request, res: Response) {
    try {
      const equipment = await equipmentService.create(req.body);
      const response: ApiResponse<typeof equipment> = {
        success: true,
        data: equipment,
        message: 'Equipment created successfully',
      };
      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      res.status(500).json(response);
    }
  },

  // PUT /api/equipment/:id
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const equipment = await equipmentService.update(id, req.body);
      const response: ApiResponse<typeof equipment> = {
        success: true,
        data: equipment,
        message: 'Equipment updated successfully',
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      res.status(500).json(response);
    }
  },

  // DELETE /api/equipment/:id
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userName } = req.body;
      await equipmentService.delete(id, userName || 'Sistema');
      const response: ApiResponse<null> = {
        success: true,
        message: 'Equipment deleted successfully',
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      res.status(500).json(response);
    }
  },

  // POST /api/equipment/:id/transfer
  async transfer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const equipment = await equipmentService.transfer(id, req.body);
      const response: ApiResponse<typeof equipment> = {
        success: true,
        data: equipment,
        message: 'Equipment transferred successfully',
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      res.status(500).json(response);
    }
  },

  // POST /api/equipment/:id/maintenance
  async registerMaintenance(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { description, userName } = req.body;
      const equipment = await equipmentService.registerMaintenance(id, description, userName);
      const response: ApiResponse<typeof equipment> = {
        success: true,
        data: equipment,
        message: 'Maintenance registered successfully',
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      res.status(500).json(response);
    }
  },

  // GET /api/equipment/:id/history
  async getHistory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const history = await equipmentService.getHistory(id);
      const response: ApiResponse<typeof history> = {
        success: true,
        data: history,
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      res.status(500).json(response);
    }
  },

  // GET /api/equipment/:id/attachments
  async getAttachments(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const attachments = await equipmentService.getAttachments(id);
      const response: ApiResponse<typeof attachments> = {
        success: true,
        data: attachments,
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      res.status(500).json(response);
    }
  },

  // POST /api/equipment/:id/attachments
  async uploadAttachment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userName } = req.body;
      const file = req.file;

      if (!file) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'No file provided',
        };
        return res.status(400).json(response);
      }

      const attachment = await equipmentService.uploadAttachment(id, file, userName || 'Sistema');
      const response: ApiResponse<typeof attachment> = {
        success: true,
        data: attachment,
        message: 'Attachment uploaded successfully',
      };
      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      res.status(500).json(response);
    }
  },

  // DELETE /api/equipment/attachments/:attachmentId
  async deleteAttachment(req: Request, res: Response) {
    try {
      const { attachmentId } = req.params;
      const { userName } = req.body;
      await equipmentService.deleteAttachment(attachmentId, userName || 'Sistema');
      const response: ApiResponse<null> = {
        success: true,
        message: 'Attachment deleted successfully',
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      res.status(500).json(response);
    }
  },
};
