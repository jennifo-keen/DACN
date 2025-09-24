import "dotenv/config";
import express from "express";
import cors from "cors";                   // <— thêm
import { connectDB } from "./config/db.js";
import { User } from "./models/User.js";   // <— thêm

const app = express();
app.use(express.json());
app.use(cors()); // đơn giản cho mọi origin; cần chặt chẽ thì cấu hình origin cụ thể

// ===== ĐĂNG NHẬP PLAIN TEXT =====
app.post("/auth/login-plain", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Missing email or password" });

    // so khớp plain text và status active
    const user = await User.findOne({ email: email.toLowerCase(), password, status: "active" });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    // trả về thông tin cơ bản, không trả password
    res.json({
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// (giữ các route /tickets như cũ)
app.get("/", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
connectDB().then(() => app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`)));
