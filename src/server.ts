import 'dotenv/config'; 

import app from "./app";
import { connectDB } from "./configs/DB";
import { verifyEmailConnection } from './function/sendEmail';
import { seedSuperAdminService } from './service/adminService';

const PORT = process.env.PORT || 4000;

async function startServer() {
  await connectDB();
await seedSuperAdminService(); // seeds super admin once if none exists
  await verifyEmailConnection();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer();