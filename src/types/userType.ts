import { UserRole, UserStatus, AuthProvider, Gender } from '../utils/enums/userEnum';

// ─── Core User Interface ───────────────────────────────────────────────────────
export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone?: string;
  gender?: Gender;
  role: UserRole;
  status: UserStatus;
  provider: AuthProvider;
  avatar?: string;
  address?: IAddress;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// ─── Address sub-type ──────────────────────────────────────────────────────────
export interface IAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
}

// ─── DTOs ──────────────────────────────────────────────────────────────────────
export interface IRegisterDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  gender?: Gender;
}

export interface ILoginDTO {
  email: string;
  password: string;
}

export interface IUpdateProfileDTO {
  firstName?: string;
  lastName?: string;
  phone?: string;
  gender?: Gender;
  avatar?: string;
  address?: IAddress;
}

export interface IChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export interface IForgotPasswordDTO {
  email: string;
}

export interface IResetPasswordDTO {
  token: string;
  newPassword: string;
}

// ─── Service Response ──────────────────────────────────────────────────────────
export interface IUserServiceResponse {
  success: boolean;
  data?: Omit<IUser, 'password'> | Omit<IUser, 'password'>[] | null;
  token?: string;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── Authenticated Request ─────────────────────────────────────────────────────
// Extends Express Request with the authenticated user attached by auth middleware
import { Request } from 'express';

export interface IAuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
    email: string;
  };
}
