import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const url = process.env.MONGODB_URI;

if (!url) {
  throw new Error("❌ MONGODB_URI is missing in .env");
}

export async function connectDB() {
  try {
    await mongoose.connect(url);
    console.log("✅ Database connected");
  } catch (error) {
    console.error("❌ Database connection error:", error);
    process.exit(1);
  }
}