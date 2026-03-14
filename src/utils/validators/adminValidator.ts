import Joi from 'joi';
import { AdminRole, AdminStatus, AdminPermission } from '../enums/adminEnum';

export const createAdminValidator = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required(),
  lastName:  Joi.string().trim().min(2).max(50).required(),
  email:     Joi.string().email().lowercase().required(),
  password:  Joi.string().min(8).max(64)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .message('Password must have uppercase, lowercase, number and special character')
    .required(),
  role: Joi.string()
    .valid(...Object.values(AdminRole))
    .default(AdminRole.ADMIN),
  permissions: Joi.array()
    .items(Joi.string().valid(...Object.values(AdminPermission)))
    .optional(),
});

export const adminLoginValidator = Joi.object({
  email:    Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
});

export const updateAdminValidator = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).optional(),
  lastName:  Joi.string().trim().min(2).max(50).optional(),
  role: Joi.string()
    .valid(...Object.values(AdminRole))
    .optional(),
  status: Joi.string()
    .valid(...Object.values(AdminStatus))
    .optional(),
  permissions: Joi.array()
    .items(Joi.string().valid(...Object.values(AdminPermission)))
    .optional(),
});

export const adminChangePasswordValidator = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(64)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .message('Password must have uppercase, lowercase, number and special character')
    .required(),
});
