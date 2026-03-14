import { Request, Response } from 'express';
import {
  adminLoginService,
  createAdminService,
  getAllAdminsService,
  getAdminByIdService,
  getMyAdminProfileService,
  updateAdminService,
  adminChangePasswordService,
  toggleAdminStatusService,
  deleteAdminService,
} from '../service/adminService';
import {
  adminLoginValidator,
  createAdminValidator,
  updateAdminValidator,
  adminChangePasswordValidator,
} from '../utils/validators/adminValidator';
import { IAdminRequest } from '../types/adminType';
import { getParam } from '../library/helpers/requestHelper';

// ─── POST /api/admin/auth/login ────────────────────────────────────────────────
export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  const { error, value } = adminLoginValidator.validate(req.body, { abortEarly: false });
  if (error) {
    res.status(400).json({ success: false, message: error.details.map(d => d.message) });
    return;
  }
  const result = await adminLoginService(value);
  res.status(result.success ? 200 : 401).json(result);
};

// ─── GET /api/admin/me ─────────────────────────────────────────────────────────
export const getMyAdminProfile = async (req: IAdminRequest, res: Response): Promise<void> => {
  const result = await getMyAdminProfileService(req.admin!.id);
  res.status(result.success ? 200 : 404).json(result);
};

// ─── PATCH /api/admin/me/change-password ──────────────────────────────────────
export const adminChangePassword = async (req: IAdminRequest, res: Response): Promise<void> => {
  const { error, value } = adminChangePasswordValidator.validate(req.body, { abortEarly: false });
  if (error) {
    res.status(400).json({ success: false, message: error.details.map(d => d.message) });
    return;
  }
  const result = await adminChangePasswordService(req.admin!.id, value);
  res.status(result.success ? 200 : 400).json(result);
};

// ─── POST /api/admin/admins ────────────────────────────────────────────────────
export const createAdmin = async (req: IAdminRequest, res: Response): Promise<void> => {
  const { error, value } = createAdminValidator.validate(req.body, { abortEarly: false });
  if (error) {
    res.status(400).json({ success: false, message: error.details.map(d => d.message) });
    return;
  }
  const result = await createAdminService(value, req.admin!.id);
  res.status(result.success ? 201 : 400).json(result);
};

// ─── GET /api/admin/admins ─────────────────────────────────────────────────────
export const getAllAdmins = async (req: Request, res: Response): Promise<void> => {
  const page  = Number(req.query.page)  || 1;
  const limit = Number(req.query.limit) || 20;
  const result = await getAllAdminsService(page, limit);
  res.status(result.success ? 200 : 500).json(result);
};

// ─── GET /api/admin/admins/:id ─────────────────────────────────────────────────
export const getAdminById = async (req: Request, res: Response): Promise<void> => {
  const result = await getAdminByIdService(getParam(req, 'id'));
  res.status(result.success ? 200 : 404).json(result);
};

// ─── PUT /api/admin/admins/:id ─────────────────────────────────────────────────
export const updateAdmin = async (req: Request, res: Response): Promise<void> => {
  const { error, value } = updateAdminValidator.validate(req.body, { abortEarly: false });
  if (error) {
    res.status(400).json({ success: false, message: error.details.map(d => d.message) });
    return;
  }
  const result = await updateAdminService(getParam(req, 'id'), value);
  res.status(result.success ? 200 : 404).json(result);
};

// ─── PATCH /api/admin/admins/:id/status ───────────────────────────────────────
export const toggleAdminStatus = async (req: IAdminRequest, res: Response): Promise<void> => {
  const result = await toggleAdminStatusService(getParam(req, 'id'), req.admin!.id);
  res.status(result.success ? 200 : 400).json(result);
};

// ─── DELETE /api/admin/admins/:id ─────────────────────────────────────────────
export const deleteAdmin = async (req: IAdminRequest, res: Response): Promise<void> => {
  const result = await deleteAdminService(getParam(req, 'id'), req.admin!.id);
  res.status(result.success ? 200 : 400).json(result);
};
