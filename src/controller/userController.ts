import { Request, Response } from 'express';
import {
  registerService,
  loginService,
  verifyEmailService,
  getMyProfileService,
  updateProfileService,
  changePasswordService,
  forgotPasswordService,
  resetPasswordService,
  getAllUsersService,
  getUserByIdService,
  toggleUserStatusService,
} from '../service/userService';
import {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from '../utils/validators/userValidator';
import { IAuthRequest } from '../types/userType';
import { getParam } from '../library/helpers/requestHelper';

// ─── POST /api/auth/register ───────────────────────────────────────────────────
export const register = async (req: Request, res: Response): Promise<void> => {
  const { error, value } = registerValidator.validate(req.body, { abortEarly: false });
  if (error) {
    res.status(400).json({ success: false, message: error.details.map((d) => d.message) });
    return;
  }
  const result = await registerService(value);
  res.status(result.success ? 201 : 400).json(result);
};

// ─── POST /api/auth/login ──────────────────────────────────────────────────────
export const login = async (req: Request, res: Response): Promise<void> => {
  const { error, value } = loginValidator.validate(req.body, { abortEarly: false });
  if (error) {
    res.status(400).json({ success: false, message: error.details.map((d) => d.message) });
    return;
  }
  const result = await loginService(value);
  res.status(result.success ? 200 : 401).json(result);
};

// ─── GET /api/auth/verify-email?token=xxx ─────────────────────────────────────
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  const token = req.query.token as string;
  if (!token) {
    res.status(400).json({ success: false, message: 'Token is required' });
    return;
  }
  const result = await verifyEmailService(token);
  res.status(result.success ? 200 : 400).json(result);
};

// ─── GET /api/users/me ─────────────────────────────────────────────────────────
export const getMyProfile = async (req: IAuthRequest, res: Response): Promise<void> => {
  const result = await getMyProfileService(req.user!.id);
  res.status(result.success ? 200 : 404).json(result);
};

// ─── PUT /api/users/me ─────────────────────────────────────────────────────────
export const updateProfile = async (req: IAuthRequest, res: Response): Promise<void> => {
  const { error, value } = updateProfileValidator.validate(req.body, { abortEarly: false });
  if (error) {
    res.status(400).json({ success: false, message: error.details.map((d) => d.message) });
    return;
  }
  const result = await updateProfileService(req.user!.id, value);
  res.status(result.success ? 200 : 404).json(result);
};

// ─── PATCH /api/users/me/change-password ──────────────────────────────────────
export const changePassword = async (req: IAuthRequest, res: Response): Promise<void> => {
  const { error, value } = changePasswordValidator.validate(req.body, { abortEarly: false });
  if (error) {
    res.status(400).json({ success: false, message: error.details.map((d) => d.message) });
    return;
  }
  const result = await changePasswordService(req.user!.id, value);
  res.status(result.success ? 200 : 400).json(result);
};

// ─── POST /api/auth/forgot-password ───────────────────────────────────────────
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { error, value } = forgotPasswordValidator.validate(req.body, { abortEarly: false });
  if (error) {
    res.status(400).json({ success: false, message: error.details.map((d) => d.message) });
    return;
  }
  const result = await forgotPasswordService(value);
  res.status(200).json(result); // always 200 — don't reveal email existence
};

// ─── POST /api/auth/reset-password ────────────────────────────────────────────
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { error, value } = resetPasswordValidator.validate(req.body, { abortEarly: false });
  if (error) {
    res.status(400).json({ success: false, message: error.details.map((d) => d.message) });
    return;
  }
  const result = await resetPasswordService(value);
  res.status(result.success ? 200 : 400).json(result);
};

// ─── ADMIN: GET /api/users ─────────────────────────────────────────────────────
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  const page  = Number(req.query.page)  || 1;
  const limit = Number(req.query.limit) || 20;
  const result = await getAllUsersService(page, limit);
  res.status(result.success ? 200 : 500).json(result);
};

// ─── ADMIN: GET /api/users/:id ─────────────────────────────────────────────────
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const result = await getUserByIdService(getParam(req, 'id'));
  res.status(result.success ? 200 : 404).json(result);
};

// ─── ADMIN: PATCH /api/users/:id/status ───────────────────────────────────────
export const toggleUserStatus = async (req: Request, res: Response): Promise<void> => {
  const result = await toggleUserStatusService(getParam(req, 'id'));
  res.status(result.success ? 200 : 404).json(result);
};
