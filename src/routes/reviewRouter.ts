import { Router } from 'express';
import {
  createReview,
  getProductReviews,
  getMyReviews,
  updateMyReview,
  deleteMyReview,
} from '../controller/reviewController';
import { protect } from '../middleware/auth';

const router = Router();

// ─── Public ────────────────────────────────────────────────────────────────────
router.get('/product/:productId', getProductReviews); // Get reviews for a product

// ─── Protected (customer) ──────────────────────────────────────────────────────
router.use(protect);
router.post('/',            createReview);    // Submit a review
router.get('/my-reviews',   getMyReviews);    // My reviews
router.put('/:id',          updateMyReview);  // Edit my review
router.delete('/:id',       deleteMyReview);  // Delete my review

export default router;
