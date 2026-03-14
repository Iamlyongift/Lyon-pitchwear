import { Request } from 'express';
import { AdminRole, AdminStatus, AdminPermission } from '../utils/enums/adminEnum';

// ─── Core Admin Interface ──────────────────────────────────────────────────────
export interface IAdmin {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: AdminRole;
  status: AdminStatus;
  permissions: AdminPermission[];
  lastLogin?: Date;
  createdBy?: string; // _id of the super admin who created this admin
  createdAt?: Date;
  updatedAt?: Date;
}

// ─── DTOs ──────────────────────────────────────────────────────────────────────
export interface ICreateAdminDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: AdminRole;
  permissions?: AdminPermission[];
}

export interface IUpdateAdminDTO {
  firstName?: string;
  lastName?: string;
  role?: AdminRole;
  status?: AdminStatus;
  permissions?: AdminPermission[];
}

export interface IAdminLoginDTO {
  email: string;
  password: string;
}

export interface IAdminChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

// ─── Service Response ──────────────────────────────────────────────────────────
export interface IAdminServiceResponse {
  success: boolean;
  data?: Omit<IAdmin, 'password'> | Omit<IAdmin, 'password'>[] | null;
  token?: string;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── Authenticated Admin Request ───────────────────────────────────────────────
export interface IAdminRequest extends Request {
  admin?: {
    id: string;
    email: string;
    role: AdminRole;
    permissions: AdminPermission[];
  };
}
