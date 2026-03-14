import Joi from 'joi';
import { Gender } from '../enums/userEnum';

// ─── Register ──────────────────────────────────────────────────────────────────
export const registerValidator = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required(),
  lastName:  Joi.string().trim().min(2).max(50).required(),
  email:     Joi.string().email().lowercase().required(),
  password:  Joi.string().min(8).max(64)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .message('Password must have uppercase, lowercase, number and special character')
    .required(),
  phone:  Joi.string().pattern(/^\+?[0-9]{7,15}$/).optional(),
  gender: Joi.string().valid(...Object.values(Gender)).optional(),
});

// ─── Login ─────────────────────────────────────────────────────────────────────
export const loginValidator = Joi.object({
  email:    Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
});

// ─── Update Profile ────────────────────────────────────────────────────────────
export const updateProfileValidator = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).optional(),
  lastName:  Joi.string().trim().min(2).max(50).optional(),
  phone:     Joi.string().pattern(/^\+?[0-9]{7,15}$/).optional(),
  gender:    Joi.string().valid(...Object.values(Gender)).optional(),
  avatar:    Joi.string().uri().optional(),
  address: Joi.object({
    street:     Joi.string().required(),
    city:       Joi.string().required(),
    state:      Joi.string().required(),
    country:    Joi.string().required(),
    postalCode: Joi.string().optional(),
  }).optional(),
});

// ─── Change Password ───────────────────────────────────────────────────────────
export const changePasswordValidator = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(64)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .message('Password must have uppercase, lowercase, number and special character')
    .required(),
});

// ─── Forgot Password ───────────────────────────────────────────────────────────
export const forgotPasswordValidator = Joi.object({
  email: Joi.string().email().lowercase().required(),
});

// ─── Reset Password ────────────────────────────────────────────────────────────
export const resetPasswordValidator = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(8).max(64)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .message('Password must have uppercase, lowercase, number and special character')
    .required(),
});
