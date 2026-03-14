import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  getProductsByCategory,
} from '../controller/productController';

const router = Router();

// ─── Public Routes (customers browse) ─────────────────────────────────────────
router.get('/', getAllProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/:id', getProductById);

export default router;