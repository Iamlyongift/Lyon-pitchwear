import { Request, Response } from 'express';
import {
  createReviewService,
  getProductReviewsService,
  getMyReviewsService,
  updateMyReviewService,
  deleteMyReviewService,
  getAllReviewsService,
  moderateReviewService,
  adminDeleteReviewService,
} from '../service/reviewService';
import {
  createReviewValidator,
  updateReviewValidator,
} from '../utils/validators/reviewValidator';
import { IAuthRequest } from '../types/userType';
import { getParam } from '../library/helpers/requestHelper';
import { ReviewStatus } from '../utils/enums/reviewEnum';

// ─── POST /api/reviews ─────────────────────────────────────────────────────────
export const createReview = async (req: IAuthRequest, res: Response): Promise<void> => {
  const { error, value } = createReviewValidator.validate(req.body, { abortEarly: false });
  if (error) {
    res.status(400).json({ success: false, message: error.details.map((d) => d.message) });
    return;
  }
  const result = await createReviewService(req.user!.id, value);
  res.status(result.success ? 201 : 400).json(result);
};

// ─── GET /api/reviews/product/:productId ──────────────────────────────────────
export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
  const page  = Number(req.query.page)  || 1;
  const limit = Number(req.query.limit) || 10;
  const result = await getProductReviewsService(getParam(req, 'productId'), page, limit);
  res.status(result.success ? 200 : 400).json(result);
};

// ─── GET /api/reviews/my-reviews ──────────────────────────────────────────────
export const getMyReviews = async (req: IAuthRequest, res: Response): Promise<void> => {
  const page  = Number(req.query.page)  || 1;
  const limit = Number(req.query.limit) || 10;
  const result = await getMyReviewsService(req.user!.id, page, limit);
  res.status(result.success ? 200 : 400).json(result);
};

// ─── PUT /api/reviews/:id ──────────────────────────────────────────────────────
export const updateMyReview = async (req: IAuthRequest, res: Response): Promise<void> => {
  const { error, value } = updateReviewValidator.validate(req.body, { abortEarly: false });
  if (error) {
    res.status(400).json({ success: false, message: error.details.map((d) => d.message) });
    return;
  }
  const result = await updateMyReviewService(req.user!.id, getParam(req, 'id'), value);
  res.status(result.success ? 200 : 400).json(result);
};

// ─── DELETE /api/reviews/:id ───────────────────────────────────────────────────
export const deleteMyReview = async (req: IAuthRequest, res: Response): Promise<void> => {
  const result = await deleteMyReviewService(req.user!.id, getParam(req, 'id'));
  res.status(result.success ? 200 : 400).json(result);
};

// ─── GET /api/admin/reviews ────────────────────────────────────────────────────
export const getAllReviews = async (req: Request, res: Response): Promise<void> => {
  const page   = Number(req.query.page)  || 1;
  const limit  = Number(req.query.limit) || 20;
  const status = req.query.status as ReviewStatus | undefined;
  const result = await getAllReviewsService(page, limit, status);
  res.status(result.success ? 200 : 400).json(result);
};

// ─── PATCH /api/admin/reviews/:id/moderate ────────────────────────────────────
export const moderateReview = async (req: Request, res: Response): Promise<void> => {
  const { status } = req.body;
  if (!Object.values(ReviewStatus).includes(status)) {
    res.status(400).json({ success: false, message: 'Invalid status. Use: pending, approved, rejected' });
    return;
  }
  const result = await moderateReviewService(getParam(req, 'id'), status);
  res.status(result.success ? 200 : 400).json(result);
};

// ─── DELETE /api/admin/reviews/:id ────────────────────────────────────────────
export const adminDeleteReview = async (req: Request, res: Response): Promise<void> => {
  const result = await adminDeleteReviewService(getParam(req, 'id'));
  res.status(result.success ? 200 : 400).json(result);
};
