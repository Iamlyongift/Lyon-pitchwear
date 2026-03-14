import jwt from 'jsonwebtoken';
import { UserRole } from '../../utils/enums/userEnum';

const JWT_SECRET  = process.env.JWT_SECRET as string;
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

export interface IJwtPayload {
  id: string;
  email: string;
  role: UserRole;
}

// ─── Sign token ────────────────────────────────────────────────────────────────
export const signToken = (payload: IJwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES } as jwt.SignOptions);
};

// ─── Verify token ──────────────────────────────────────────────────────────────
export const verifyToken = (token: string): IJwtPayload => {
  return jwt.verify(token, JWT_SECRET) as IJwtPayload;
};

// ─── Strip sensitive fields before sending user to client ─────────────────────
export const sanitizeUser = (user: any) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  delete obj.emailVerificationToken;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};
