import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { User } from "./models/User.js";
import bcrypt from "bcryptjs";

// Import routes
import branchRoutes from "./routes/branch.route.js";
import uploadRoutes from "./admin/upload.route.js";
import authRoutes from "./routes/auth.routes.js";
import provinceRouter from "./routes/provinceRouter.js";
import ticketTypeRouter from "./routes/ticketTypeRouter.js"
import zoneRouter from "./routes/zoneRouter.js"
import bookingRouterAdmin from "./admin/bookingRouter.js"
import bookingRouter from './routes/booking.route.js'
import promoRoutes from "./routes/promoCode.routes.js";
import momo from "./routes/PTTT/Momo.js";
import momoNotify from "./routes/PTTT/MomoNotify.js";
import adminRouter from './admin/adminRouter.js'

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*", // Cấu hình CORS linh hoạt
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));


// Route kiểm tra server
app.get("/", (_req, res) => res.json({ ok: true }));

// Mount API routes
app.use("/api", branchRoutes);
app.use("/api/admin", uploadRoutes);
app.use("/auth", authRoutes);
app.use("/api", provinceRouter); 
app.use("/api", ticketTypeRouter);
app.use("/api", zoneRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/promo", promoRoutes);
app.use("/api/PTTT/momo", momo);
app.use("/api/PTTT/momo", momoNotify);
app.use("/api", adminRouter);
app.use("/api", bookingRouterAdmin);

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to database:", error);
    process.exit(1); // Thoát nếu không kết nối được DB
  });