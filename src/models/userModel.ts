import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types/userType';
import { UserRole, UserStatus, AuthProvider, Gender } from '../utils/enums/userEnum';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  getFullName(): string;
}

const AddressSchema = new Schema(
  {
    street:     { type: String, required: true },
    city:       { type: String, required: true },
    state:      { type: String, required: true },
    country:    { type: String, required: true },
    postalCode: { type: String },
  },
  { _id: false } // no separate _id for subdocument
);

const UserSchema = new Schema<IUserDocument>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:  { type: String, select: false }, // excluded from queries by default
    phone:     { type: String },
    gender:    { type: String, enum: Object.values(Gender) },
    role:      { type: String, enum: Object.values(UserRole), default: UserRole.CUSTOMER },
    status:    { type: String, enum: Object.values(UserStatus), default: UserStatus.PENDING_VERIFICATION },
    provider:  { type: String, enum: Object.values(AuthProvider), default: AuthProvider.LOCAL },
    avatar:    { type: String },
    address:   { type: AddressSchema },

    isEmailVerified:       { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    passwordResetToken:    { type: String, select: false },
    passwordResetExpires:  { type: Date,   select: false },
    lastLogin:             { type: Date },
  },
  { timestamps: true, versionKey: false }
);

// ─── Indexes ───────────────────────────────────────────────────────────────────
UserSchema.index({ role: 1, status: 1 });

// ─── Hash password before saving ──────────────────────────────────────────────
UserSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// ─── Instance method: compare password ────────────────────────────────────────
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Instance method: full name helper ────────────────────────────────────────
UserSchema.methods.getFullName = function (): string {
  return `${this.firstName} ${this.lastName}`;
};

export default mongoose.model<IUserDocument>('User', UserSchema);
