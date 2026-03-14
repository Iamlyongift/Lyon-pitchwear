import { Request, Response } from 'express';
import { getDashboardStatsService } from '../service/dashboardService';

// ─── GET /api/admin/dashboard ──────────────────────────────────────────────────
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  const result = await getDashboardStatsService();
  res.status(result.success ? 200 : 500).json(result);
};
