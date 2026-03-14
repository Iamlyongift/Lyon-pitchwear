import { Router } from 'express';
import {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMyProfile,
  updateProfile,
  changePassword,
} from '../controller/userController';
import { protect } from '../middleware/auth';

// ─── Auth Routes (/api/auth) ───────────────────────────────────────────────────
export const authRouter = Router();

authRouter.post('/register',        register);
authRouter.post('/login',           login);
authRouter.get('/verify-email',     verifyEmail);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password',  resetPassword);

// ─── User Routes (/api/user) ──────────────────────────────────────────────────
export const userRouter = Router();

userRouter.get('/me',                   protect, getMyProfile);
userRouter.put('/me',                   protect, updateProfile);
userRouter.patch('/me/change-password', protect, changePassword);