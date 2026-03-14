import { Response, NextFunction } from 'express';
import Admin from '../models/adminModel';
import { verifyAdminToken } from '../library/helpers/adminjwtHelper';
import { IAdminRequest } from '../types/adminType';
import { AdminRole, AdminPermission, AdminStatus } from '../utils/enums/adminEnum';



// ─── Protect admin routes ──────────────────────────────────────────────────────
export const adminProtect = async (
  req: IAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Kindly sign in as an admin' });
      return;
    }

    const token = authorization.split(' ')[1];
    let decoded;
    try {
      decoded = verifyAdminToken(token);
    } catch (err) {
      res.status(401).json({ success: false, message: 'Invalid or expired token' });
      return;
    }

    // DB lookup — catches suspended or deleted admins in real time
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      res.status(404).json({ success: false, message: 'Admin no longer exists' });
      return;
    }
    if (admin.status === AdminStatus.SUSPENDED) {
      res.status(403).json({ success: false, message: 'Admin account suspended' });
      return;
    }
    if (admin.status === AdminStatus.INACTIVE) {
      res.status(403).json({ success: false, message: 'Admin account inactive' });
      return;
    }

    // Attach admin info to request
    req.admin = {
      id: admin._id.toString(),
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions as AdminPermission[],
    };
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ success: false, message: 'Authentication error' });
  }
};

// ─── Super admin only ──────────────────────────────────────────────────────────
export const superAdminOnly = (
  req: IAdminRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.admin?.role !== AdminRole.SUPER_ADMIN) {
    res.status(403).json({ success: false, message: 'Super admin access only' });
    return;
  }
  next();
};

// ─── Permission check — checks if admin has a specific permission ──────────────
export const requirePermission = (permission: AdminPermission) => {
  return (req: IAdminRequest, res: Response, next: NextFunction): void => {
    const isSuperAdmin = req.admin?.role === AdminRole.SUPER_ADMIN;
    const hasPermission = req.admin?.permissions.includes(permission);

    // Super admins bypass all permission checks
    if (isSuperAdmin || hasPermission) {
      next();
      return;
    }

    res.status(403).json({
      success: false,
      message: `Access denied. Required permission: ${permission}`,
    });
  };
};
