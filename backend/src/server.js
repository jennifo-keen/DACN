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

import adminRouter from './admin/adminRouter.js'

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*", // Cấu hình CORS linh hoạt
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

// ===== LOGIN DEMO =====
app.post("/auth/login-plain", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra trường bắt buộc
    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    // Tìm user với email và status active, bao gồm password
    const user = await User.findOne({ email: email.toLowerCase(), status: "active" })
      .select("+password")
      .lean(); // Sử dụng lean để tối ưu hóa hiệu suất

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Trả về thông tin user (loại bỏ password)
    const { password: _, ...userData } = user;
    res.json(userData);
  } catch (error) {
    console.error("Login error:", error); // Log lỗi để debug
    res.status(500).json({ error: "Internal server error" });
  }
});

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