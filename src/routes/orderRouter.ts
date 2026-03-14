import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getMyOrderById,
  cancelMyOrder,
} from '../controller/orderController';
import { protect } from '../middleware/auth';

const router = Router();

// All order routes require authentication
router.use(protect);

// ─── Customer Order Routes ─────────────────────────────────────────────────────
router.post('/',                       createOrder);      // Place order
router.get('/my-orders',               getMyOrders);      // View my orders
router.get('/my-orders/:id',           getMyOrderById);   // View single order
router.patch('/my-orders/:id/cancel',  cancelMyOrder);    // Cancel order

export default router;
