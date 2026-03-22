import { Router } from "express";
import {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMyProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  getUserById,
  toggleUserStatus,
} from "../controller/userController";
import { protect } from "../middleware/auth";
import { adminProtect } from "../middleware/adminAuth";
import passport from "../configs/passportConfig";
import { signToken } from "../library/helpers/jwtHelper";

// ─── Auth Routes (/api/auth) ───────────────────────────────────────────────────
export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/verify-email", verifyEmail);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
// ─── Google OAuth ──────────────────────────────────────────────────────────────
authRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed`,
    session: false,
  }),
  (req: any, res: any) => {
    const user = req.user as any;
    const token = signToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });
    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  },
);

// ─── User Routes (/api/user) ──────────────────────────────────────────────────
export const userRouter = Router();

// Customer routes — user token
userRouter.get("/me", protect, getMyProfile);
userRouter.put("/me", protect, updateProfile);
userRouter.patch("/me/change-password", protect, changePassword);

// Admin routes — admin token
userRouter.get("/", adminProtect, getAllUsers);
userRouter.get("/:id", adminProtect, getUserById);
userRouter.patch("/:id/status", adminProtect, toggleUserStatus);
