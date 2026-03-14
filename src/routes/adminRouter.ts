import { Router } from 'express';
import {
  adminLogin,
  getMyAdminProfile,
  adminChangePassword,
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  toggleAdminStatus,
  deleteAdmin,
} from '../controller/adminController';
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
} from '../controller/orderController';
import {
  adminProtect,
  superAdminOnly,
  requirePermission,
} from '../middleware/adminAuth';
import { AdminPermission } from '../utils/enums/adminEnum';

// also import product controller for admin product management
import {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleFeatured,
} from '../controller/productController';
import { upload } from '../library/helpers/uploadImages';
import { getDashboardStats } from '../controller/dashboardController';
import { getAllReviews, moderateReview, adminDeleteReview } from '../controller/reviewController';

const router = Router();

// ─── Auth (public) ─────────────────────────────────────────────────────────────
router.post('/auth/login', adminLogin);

// ─── My Profile (any admin) ────────────────────────────────────────────────────
router.get('/me',                    adminProtect, getMyAdminProfile);
router.patch('/me/change-password',  adminProtect, adminChangePassword);


// ─── Admin Management (super admin only) ──────────────────────────────────────
router.post('/admins',          adminProtect, superAdminOnly, createAdmin);
router.get('/admins',             adminProtect, superAdminOnly, getAllAdmins);
router.get('/admins/:id',         adminProtect, superAdminOnly, getAdminById);
router.put('/admins/:id',         adminProtect, superAdminOnly, updateAdmin);
router.patch('/admins/:id/status', adminProtect, superAdminOnly, toggleAdminStatus);
router.delete('/admins/:id',      adminProtect, superAdminOnly, deleteAdmin);

// ─── Product Management (admin with permissions) ───────────────────────────────
router.get('/products',                  adminProtect, requirePermission(AdminPermission.VIEW_PRODUCTS),   getAllProducts);
router.get('/products/category/:category', adminProtect, requirePermission(AdminPermission.VIEW_PRODUCTS), getProductsByCategory);
router.get('/products/:id',              adminProtect, requirePermission(AdminPermission.VIEW_PRODUCTS),   getProductById);
router.post('/products',                 adminProtect, requirePermission(AdminPermission.CREATE_PRODUCT),  upload.array('images', 5), createProduct);
router.put('/products/:id',              adminProtect, requirePermission(AdminPermission.UPDATE_PRODUCT),  upload.array('images', 5), updateProduct);
router.patch('/products/:id/featured',   adminProtect, requirePermission(AdminPermission.UPDATE_PRODUCT),  toggleFeatured);
router.delete('/products/:id',           adminProtect, requirePermission(AdminPermission.DELETE_PRODUCT),  deleteProduct);


// ─── Order Management (admin) ──────────────────────────────────────────────────
router.get('/orders',              adminProtect, requirePermission(AdminPermission.VIEW_ORDERS),   getAllOrders);
router.get('/orders/:id',          adminProtect, requirePermission(AdminPermission.VIEW_ORDERS),   getOrderById);
router.patch('/orders/:id/status', adminProtect, requirePermission(AdminPermission.UPDATE_ORDER),  updateOrderStatus);
router.patch('/orders/:id/payment',adminProtect, requirePermission(AdminPermission.UPDATE_ORDER),  updatePaymentStatus);

// ─── Dashboard ─────────────────────────────────────────────────────────────────
router.get('/dashboard', adminProtect, getDashboardStats);

// ─── Review Moderation ─────────────────────────────────────────────────────────
router.get('/reviews',                adminProtect, getAllReviews);
router.patch('/reviews/:id/moderate', adminProtect, moderateReview);
router.delete('/reviews/:id',         adminProtect, adminDeleteReview);



export default router;
