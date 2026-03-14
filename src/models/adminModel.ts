import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IAdmin } from '../types/adminType';
import { AdminRole, AdminStatus, AdminPermission } from '../utils/enums/adminEnum';

export interface IAdminDocument extends Omit<IAdmin, '_id'>, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  getFullName(): string;
}

const AdminSchema = new Schema<IAdminDocument>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:  { type: String, required: true, select: false },
    role:      { type: String, enum: Object.values(AdminRole), default: AdminRole.ADMIN },
    status:    { type: String, enum: Object.values(AdminStatus), default: AdminStatus.ACTIVE },
    permissions: {
      type: [String],
      enum: Object.values(AdminPermission),
      default: [
        // Default permissions for a regular admin
        AdminPermission.VIEW_PRODUCTS,
        AdminPermission.CREATE_PRODUCT,
        AdminPermission.UPDATE_PRODUCT,
        AdminPermission.VIEW_ORDERS,
        AdminPermission.UPDATE_ORDER,
        AdminPermission.VIEW_USERS,
      ],
    },
    lastLogin:  { type: Date },
    createdBy:  { type: Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true, versionKey: false }
);

// ─── Indexes ───────────────────────────────────────────────────────────────────
AdminSchema.index({ role: 1, status: 1 });

// ─── Hash password before saving ──────────────────────────────────────────────
AdminSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// ─── Compare password ──────────────────────────────────────────────────────────
AdminSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Full name helper ──────────────────────────────────────────────────────────
AdminSchema.methods.getFullName = function (): string {
  return `${this.firstName} ${this.lastName}`;
};

export default mongoose.model<IAdminDocument>('Admin', AdminSchema);
