import crypto from 'crypto';
import User from '../models/userModel';
import {
  IRegisterDTO,
  ILoginDTO,
  IUpdateProfileDTO,
  IChangePasswordDTO,
  IForgotPasswordDTO,
  IResetPasswordDTO,
  IUserServiceResponse,
} from '../types/userType';
import { UserStatus } from '../utils/enums/userEnum';
import { signToken, sanitizeUser } from '../library/helpers/jwtHelper';
import {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../function/sendEmail';

// ─── Register ──────────────────────────────────────────────────────────────────
export const registerService = async (dto: IRegisterDTO): Promise<IUserServiceResponse> => {
  try {
    const existing = await User.findOne({ email: dto.email.toLowerCase() });
    if (existing) return { success: false, message: 'Email already registered' };

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      ...dto,
      emailVerificationToken: verificationToken,
    });

    // Fire emails — non-blocking
    sendWelcomeEmail({ name: user.firstName, email: user.email }).catch(console.error);
    sendVerificationEmail(user.firstName, user.email, verificationToken).catch(console.error);

    const token = signToken({ id: user._id.toString(), email: user.email, role: user.role });

    return {
      success: true,
      token,
      data: sanitizeUser(user),
      message: 'Registration successful. Please verify your email.',
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ─── Login ─────────────────────────────────────────────────────────────────────
export const loginService = async (dto: ILoginDTO): Promise<IUserServiceResponse> => {
  try {
    // Explicitly select password since it's excluded by default in model
    const user = await User.findOne({ email: dto.email.toLowerCase() }).select('+password');

    if (!user) return { success: false, message: 'Invalid email or password' };
    if (user.status === UserStatus.SUSPENDED)
      return { success: false, message: 'Account suspended. Contact support.' };

    const isMatch = await user.comparePassword(dto.password);
    if (!isMatch) return { success: false, message: 'Invalid email or password' };

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken({ id: user._id.toString(), email: user.email, role: user.role });

    return { success: true, token, data: sanitizeUser(user), message: 'Login successful' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ─── Verify Email ──────────────────────────────────────────────────────────────
export const verifyEmailService = async (token: string): Promise<IUserServiceResponse> => {
  try {
    const user = await User.findOne({ emailVerificationToken: token }).select('+emailVerificationToken');
    if (!user) return { success: false, message: 'Invalid or expired verification token' };

    user.isEmailVerified = true;
    user.status = UserStatus.ACTIVE;
    user.emailVerificationToken = undefined;
    await user.save({ validateBeforeSave: false });

    return { success: true, message: 'Email verified successfully' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ─── Get My Profile ────────────────────────────────────────────────────────────
export const getMyProfileService = async (userId: string): Promise<IUserServiceResponse> => {
  try {
    const user = await User.findById(userId).lean();
    if (!user) return { success: false, message: 'User not found' };
    return { success: true, data: sanitizeUser(user) };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ─── Update Profile ────────────────────────────────────────────────────────────
export const updateProfileService = async (
  userId: string,
  dto: IUpdateProfileDTO
): Promise<IUserServiceResponse> => {
  try {
    const user = await User.findByIdAndUpdate(userId, dto, {
      new: true,
      runValidators: true,
    }).lean();
    if (!user) return { success: false, message: 'User not found' };
    return { success: true, data: sanitizeUser(user), message: 'Profile updated' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ─── Change Password ───────────────────────────────────────────────────────────
export const changePasswordService = async (
  userId: string,
  dto: IChangePasswordDTO
): Promise<IUserServiceResponse> => {
  try {
    const user = await User.findById(userId).select('+password');
    if (!user) return { success: false, message: 'User not found' };

    const isMatch = await user.comparePassword(dto.currentPassword);
    if (!isMatch) return { success: false, message: 'Current password is incorrect' };

    user.password = dto.newPassword; // pre-save hook will re-hash
    await user.save();

    return { success: true, message: 'Password changed successfully' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ─── Forgot Password ───────────────────────────────────────────────────────────
export const forgotPasswordService = async (dto: IForgotPasswordDTO): Promise<IUserServiceResponse> => {
  try {
    const user = await User.findOne({ email: dto.email.toLowerCase() });

    // Always return success — don't reveal whether email exists
    if (!user) return { success: true, message: 'If that email exists, a reset link has been sent' };

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken   = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save({ validateBeforeSave: false });

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    sendPasswordResetEmail({ name: user.firstName, email: user.email, resetLink }).catch(console.error);

    return { success: true, message: 'If that email exists, a reset link has been sent' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ─── Reset Password ────────────────────────────────────────────────────────────
export const resetPasswordService = async (dto: IResetPasswordDTO): Promise<IUserServiceResponse> => {
  try {
    const user = await User.findOne({
      passwordResetToken: dto.token,
      passwordResetExpires: { $gt: new Date() }, // token must not be expired
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) return { success: false, message: 'Invalid or expired reset token' };

    user.password             = dto.newPassword; // pre-save hook re-hashes
    user.passwordResetToken   = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return { success: true, message: 'Password reset successful. Please log in.' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ─── Admin: Get All Users ──────────────────────────────────────────────────────
export const getAllUsersService = async (
  page = 1,
  limit = 20
): Promise<IUserServiceResponse> => {
  try {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(),
    ]);
    return {
      success: true,
      data: users.map(sanitizeUser),
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ─── Admin: Get User By ID ─────────────────────────────────────────────────────
export const getUserByIdService = async (id: string): Promise<IUserServiceResponse> => {
  try {
    const user = await User.findById(id).lean();
    if (!user) return { success: false, message: 'User not found' };
    return { success: true, data: sanitizeUser(user) };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ─── Admin: Suspend / Activate User ───────────────────────────────────────────
export const toggleUserStatusService = async (id: string): Promise<IUserServiceResponse> => {
  try {
    const user = await User.findById(id);
    if (!user) return { success: false, message: 'User not found' };

    user.status = user.status === UserStatus.ACTIVE ? UserStatus.SUSPENDED : UserStatus.ACTIVE;
    await user.save({ validateBeforeSave: false });

    return { success: true, data: sanitizeUser(user), message: `User ${user.status}` };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};
