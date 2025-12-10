import { Request, Response } from 'express';
import { historyService } from '../services/historyService';
import { ApiResponse } from '../types';

export const historyController = {
  // GET /api/history
  async getAll(req: Request, res: Response) {
    try {
      const history = await historyService.getAll();
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

  // GET /api/history/recent
  async getRecent(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const history = await historyService.getRecent(limit);
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

  // GET /api/history/equipment/:equipmentId
  async getByEquipment(req: Request, res: Response) {
    try {
      const { equipmentId } = req.params;
      const history = await historyService.getByEquipment(equipmentId);
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

  // GET /api/history/entity/:entityType
  async getByEntityType(req: Request, res: Response) {
    try {
      const { entityType } = req.params;
      const history = await historyService.getByEntityType(entityType);
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

  // POST /api/history
  async create(req: Request, res: Response) {
    try {
      const entry = await historyService.create(req.body);
      const response: ApiResponse<typeof entry> = {
        success: true,
        data: entry,
        message: 'History entry created successfully',
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
