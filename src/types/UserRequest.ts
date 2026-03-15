const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("DATABASE connected successfully.");
    return true;
  } catch (error) {
    console.log((error as Error).message);
    process.exit(1);
  }
};

module.exports = connectDB;
