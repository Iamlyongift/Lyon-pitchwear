import express, { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import passport from "./configs/passportConfig";
import session from "express-session";

import adminRouter from "./routes/adminRouter";
import { userRouter, authRouter } from "./routes/userRouter";
import productRouter from "./routes/productRouter";
import orderRouter from "./routes/orderRouter";
import reviewRouter from "./routes/reviewRouter";

const app = express();

// Middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("MIDDLEWARE ERROR:", err.message);
  res.status(500).json({ success: false, message: err.message });
});

// Add before routes
app.use(
  session({
    secret: process.env.JWT_SECRET!,
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.initialize());

// Routes
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);
app.use("/api/reviews", reviewRouter);

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404, "Route not found"));
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || 500;

  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

export default app;
