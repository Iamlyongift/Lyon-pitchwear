import jwt from 'jsonwebtoken';
import { AdminRole, AdminPermission } from '../../utils/enums/adminEnum';

export interface IAdminJwtPayload {
  id: string;
  email: string;
  role: AdminRole;
  isAdmin: true; // flag to distinguish admin tokens from user tokens
}

// ─── Sign admin token ──────────────────────────────────────────────────────────
export const signAdminToken = (payload: IAdminJwtPayload): string => {
  const secret = process.env.JWT_SECRET as string;
  if (!secret) throw new Error('JWT_SECRET is not defined');
  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d', // shorter expiry for admins
  } as jwt.SignOptions);
};

// ─── Verify admin token ────────────────────────────────────────────────────────
export const verifyAdminToken = (token: string): IAdminJwtPayload => {
  const secret = process.env.JWT_SECRET as string;
  if (!secret) throw new Error('JWT_SECRET is not defined');
  const decoded = jwt.verify(token, secret) as IAdminJwtPayload;

  // Extra safety — ensure the token belongs to an admin
  if (!decoded.isAdmin) throw new Error('Not an admin token');
  return decoded;
};

// ─── Strip sensitive fields before sending admin to client ────────────────────
export const sanitizeAdmin = (admin: any) => {
  const obj = admin.toObject ? admin.toObject() : { ...admin };
  delete obj.password;
  return obj;
};
