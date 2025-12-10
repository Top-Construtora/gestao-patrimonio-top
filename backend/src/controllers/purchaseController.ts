import { Request, Response } from 'express';
import { purchaseService } from '../services/purchaseService';
import { equipmentService } from '../services/equipmentService';
import { ApiResponse } from '../types';

export const purchaseController = {
  // GET /api/purchases
  async getAll(req: Request, res: Response) {
    try {
      const purchases = await purchaseService.getAll();
      const response: ApiResponse<typeof purchases> = {
        success: true,
        data: purchases,
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

  // GET /api/purchases/stats
  async getStats(req: Request, res: Response) {
    try {
      const stats = await purchaseService.getStats();
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

  // GET /api/purchases/:id
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const purchase = await purchaseService.getById(id);

      if (!purchase) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Purchase not found',
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<typeof purchase> = {
        success: true,
        data: purchase,
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

  // POST /api/purchases
  async create(req: Request, res: Response) {
    try {
      const purchase = await purchaseService.create(req.body);
      const response: ApiResponse<typeof purchase> = {
        success: true,
        data: purchase,
        message: 'Purchase request created successfully',
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

  // PUT /api/purchases/:id
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const purchase = await purchaseService.update(id, req.body);
      const response: ApiResponse<typeof purchase> = {
        success: true,
        data: purchase,
        message: 'Purchase request updated successfully',
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

  // DELETE /api/purchases/:id
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userName } = req.body;
      await purchaseService.delete(id, userName || 'Sistema');
      const response: ApiResponse<null> = {
        success: true,
        message: 'Purchase request deleted successfully',
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

  // POST /api/purchases/:id/approve
  async approve(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userName } = req.body;
      const purchase = await purchaseService.approve(id, userName || 'Sistema');
      const response: ApiResponse<typeof purchase> = {
        success: true,
        data: purchase,
        message: 'Purchase request approved successfully',
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

  // POST /api/purchases/:id/reject
  async reject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason, userName } = req.body;

      if (!reason) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Rejection reason is required',
        };
        return res.status(400).json(response);
      }

      const purchase = await purchaseService.reject(id, reason, userName || 'Sistema');
      const response: ApiResponse<typeof purchase> = {
        success: true,
        data: purchase,
        message: 'Purchase request rejected',
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

  // POST /api/purchases/:id/acquire
  async markAsAcquired(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userName } = req.body;
      const purchase = await purchaseService.markAsAcquired(id, userName || 'Sistema');
      const response: ApiResponse<typeof purchase> = {
        success: true,
        data: purchase,
        message: 'Purchase marked as acquired',
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

  // POST /api/purchases/:id/convert-to-equipment
  async convertToEquipment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const equipmentData = req.body;

      // Get purchase data
      const purchase = await purchaseService.getById(id);
      if (!purchase) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Purchase not found',
        };
        return res.status(404).json(response);
      }

      // Create equipment
      const equipment = await equipmentService.create({
        description: equipmentData.description || purchase.description,
        brand: equipmentData.brand || purchase.brand || '',
        model: equipmentData.model || purchase.model || '',
        specs: equipmentData.specs || purchase.specifications || '',
        location: equipmentData.location || purchase.location || '',
        responsible: equipmentData.responsible,
        acquisitionDate: equipmentData.acquisitionDate,
        invoiceDate: equipmentData.invoiceDate,
        value: equipmentData.value,
        userName: equipmentData.userName || 'Sistema',
      });

      // Mark purchase as acquired
      await purchaseService.markAsAcquired(id, equipmentData.userName || 'Sistema');

      const response: ApiResponse<typeof equipment> = {
        success: true,
        data: equipment,
        message: 'Purchase converted to equipment successfully',
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
};
