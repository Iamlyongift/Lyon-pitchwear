import Admin from '../models/adminModel';
import {
  ICreateAdminDTO,
  IUpdateAdminDTO,
  IAdminLoginDTO,
  IAdminChangePasswordDTO,
  IAdminServiceResponse,
} from '../types/adminType';
import { AdminRole, AdminPermission, AdminStatus } from '../utils/enums/adminEnum';
import { signAdminToken, sanitizeAdmin } from '../library/helpers/adminjwtHelper';

// ─── Seed Super Admin (run once on startup if no admin exists) ─────────────────
export const seedSuperAdminService = async (): Promise<void> => {
  try {
    const existing = await Admin.findOne({ role: AdminRole.SUPER_ADMIN });
    if (existing) return; // already seeded

    await Admin.create({
      firstName: 'Super',
      lastName:  'Admin',
      email:     process.env.SUPER_ADMIN_EMAIL || 'superadmin@lyonpitchwear.com',
      password:  process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role:      AdminRole.SUPER_ADMIN,
      status:    AdminStatus.ACTIVE,
      permissions: Object.values(AdminPermission), // super admin gets all permissions
    });

    console.log('👑 Super admin seeded successfully');
  } catch (error: any) {
    console.error('❌ Super admin seed failed:', error.message);
  }
};

// ─── Admin Login ───────────────────────────────────────────────────────────────
export const adminLoginService = async (
  dto: IAdminLoginDTO
): Promise<IAdminServiceResponse> => {
  try {
    const admin = await Admin.findOne({ email: dto.email.toLowerCase() }).select('+password');
    if (!admin) return { success: false, message: 'Invalid email or password' };

    if (admin.status === AdminStatus.SUSPENDED)
      return { success: false, message: 'Account suspended. Contact super admin.' };

    const isMatch = await admin.comparePassword(dto.password);
    if (!isMatch) return { success: false, message: 'Invalid email or password' };

    admin.lastLogin = new Date();
    await admin.save();

    const token = signAdminToken({
      id:          admin._id.toString(),
      email:       admin.email,
      role:        admin.role,
      isAdmin:     true,
    });

    return { success: true, token, data: sanitizeAdmin(admin), message: 'Login successful' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ─── Create Admin (by super admin) ────────────────────────────────────────────
export const createAdminService = async (
  dto: ICreateAdminDTO,
  createdById: string
): Promise<IAdminServiceResponse> => {
  try {
    const existing = await Admin.findOne({ email: dto.email.toLowerCase() });
    if (existing) return { success: false, message: 'Email already registered' };

    const admin = await Admin.create({ ...dto, createdBy: createdById });
    return { success: true, data: sanitizeAdmin(admin), message: 'Admin created successfully' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ─── Get All Admins ────────────────────────────────────────────────────────────
export const getAllAdminsService = async (
  page = 1,
  limit = 20
): Promise<IAdminServiceResponse> => {
  try {
    const skip = (page - 1) * limit;
    const [admins, total] = await Promise.all([
      Admin.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Admin.countDocuments(),
    ]);
    return {
      success: true,
      data: admins.map(sanitizeAdmin),
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ─── Get Admin By ID ───────────────────────────────────────────────────────────
export const getAdminByIdService = async (id: string): Promise<IAdminServiceResponse> => {
  try {
    const admin = await Admin.findById(id).lean();
    if (!admin) return { success: false, message: 'Admin not found' };
    return { success: true, data: sanitizeAdmin(admin) };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ─── Get My Profile ────────────────────────────────────────────────────────────
export const getMyAdminProfileService = async (id: string): Promise<IAdminServiceResponse> => {
  return getAdminByIdService(id);
};

// ─── Update Admin ──────────────────────────────────────────────────────────────
export const updateAdminService = async (
  id: string,
  dto: IUpdateAdminDTO
): Promise<IAdminServiceResponse> => {
  try {
    const admin = await Admin.findByIdAndUpdate(id, dto, {
      new: true,
      runValidators: true,
    }).lean();
    if (!admin) return { success: false, message: 'Admin not found' };
    return { success: true, data: sanitizeAdmin(admin), message: 'Admin updated successfully' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ─── Change Password ───────────────────────────────────────────────────────────
export const adminChangePasswordService = async (
  id: string,
  dto: IAdminChangePasswordDTO
): Promise<IAdminServiceResponse> => {
  try {
    const admin = await Admin.findById(id).select('+password');
    if (!admin) return { success: false, message: 'Admin not found' };

    const isMatch = await admin.comparePassword(dto.currentPassword);
    if (!isMatch) return { success: false, message: 'Current password is incorrect' };

    admin.password = dto.newPassword;
    await admin.save();

    return { success: true, message: 'Password changed successfully' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ─── Toggle Admin Status ───────────────────────────────────────────────────────
export const toggleAdminStatusService = async (
  id: string,
  requesterId: string
): Promise<IAdminServiceResponse> => {
  try {
    if (id === requesterId)
      return { success: false, message: 'You cannot suspend yourself' };

    const admin = await Admin.findById(id);
    if (!admin) return { success: false, message: 'Admin not found' };
    if (admin.role === AdminRole.SUPER_ADMIN)
      return { success: false, message: 'Cannot suspend a super admin' };

    admin.status = admin.status === AdminStatus.ACTIVE
      ? AdminStatus.SUSPENDED
      : AdminStatus.ACTIVE;
    await admin.save();

    return { success: true, data: sanitizeAdmin(admin), message: `Admin ${admin.status}` };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ─── Delete Admin ──────────────────────────────────────────────────────────────
export const deleteAdminService = async (
  id: string,
  requesterId: string
): Promise<IAdminServiceResponse> => {
  try {
    if (id === requesterId)
      return { success: false, message: 'You cannot delete yourself' };

    const admin = await Admin.findById(id);
    if (!admin) return { success: false, message: 'Admin not found' };
    if (admin.role === AdminRole.SUPER_ADMIN)
      return { success: false, message: 'Cannot delete a super admin' };

    await Admin.findByIdAndDelete(id);
    return { success: true, message: 'Admin deleted successfully' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};
