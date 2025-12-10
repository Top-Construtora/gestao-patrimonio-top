import { Request, Response } from 'express';
import { responsibilityTermService } from '../services/responsibilityTermService';
import { ApiResponse } from '../types';

export const responsibilityTermController = {
  // GET /api/responsibility-terms/equipment/:equipmentId
  async getByEquipment(req: Request, res: Response) {
    try {
      const { equipmentId } = req.params;
      const terms = await responsibilityTermService.getByEquipment(equipmentId);
      const response: ApiResponse<typeof terms> = {
        success: true,
        data: terms,
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

  // GET /api/responsibility-terms/:id
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const term = await responsibilityTermService.getById(id);

      if (!term) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Term not found',
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<typeof term> = {
        success: true,
        data: term,
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

  // POST /api/responsibility-terms
  async create(req: Request, res: Response) {
    try {
      const term = await responsibilityTermService.create(req.body);
      const response: ApiResponse<typeof term> = {
        success: true,
        data: term,
        message: 'Responsibility term created successfully',
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

  // PATCH /api/responsibility-terms/:id/status
  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, userName } = req.body;

      if (!status) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Status is required',
        };
        return res.status(400).json(response);
      }

      const term = await responsibilityTermService.updateStatus(id, status, userName || 'Sistema');
      const response: ApiResponse<typeof term> = {
        success: true,
        data: term,
        message: 'Term status updated successfully',
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

  // DELETE /api/responsibility-terms/:id
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userName } = req.body;
      await responsibilityTermService.delete(id, userName || 'Sistema');
      const response: ApiResponse<null> = {
        success: true,
        message: 'Responsibility term deleted successfully',
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
