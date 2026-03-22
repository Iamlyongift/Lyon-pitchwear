import { Response, NextFunction } from "express";
import User from "../models/userModel";
import { verifyToken } from "../library/helpers/jwtHelper";
import { IAuthRequest } from "../types/userType";
import { UserStatus } from "../utils/enums/userEnum";

// ─── Protect: verifies JWT + DB check for suspended/deleted users ──────────────
export const protect = async (
  req: any,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // 1. Check token exists
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
      res
        .status(401)
        .json({ success: false, message: "Kindly sign in as a user" });
      return;
    }

    // 2. Verify token is valid and not tampered/expired
    const token = authorization.split(" ")[1];
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (jwtError) {
      res
        .status(401)
        .json({ success: false, message: "Invalid or expired token" });
      return;
    }

    // 3. DB lookup — catches suspended or deleted users in real time
    const user = await User.findById(decoded.id);
    if (!user) {
      res
        .status(404)
        .json({ success: false, message: "User no longer exists" });
      return;
    }
    if (user.status === UserStatus.SUSPENDED) {
      res
        .status(403)
        .json({
          success: false,
          message: "Account suspended. Contact support.",
        });
      return;
    }
    if (user.status === UserStatus.INACTIVE) {
      res
        .status(403)
        .json({
          success: false,
          message: "Account inactive. Please verify your email.",
        });
      return;
    }

    // 4. Attach minimal user info to request — not the whole document
    req.user = { id: user._id.toString(), email: user.email, role: user.role };
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ success: false, message: "Authentication error" });
  }
};
