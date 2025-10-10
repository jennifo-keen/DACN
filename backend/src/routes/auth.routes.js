import express from "express";
import { User } from "../models/User.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// 📌 Đăng ký
router.post("/register", async (req, res) => {
  try {
    const { fullname, email, phone, password } = req.body;
    if (!fullname || !email || !phone || !password) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email đã tồn tại" });

    const newUser = new User({ name: fullname, email, phone, password });
    await newUser.save();

    res.json({ message: "Đăng ký thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Đăng nhập (đối chiếu với bcrypt)
router.post("/login-plain", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Thiếu email hoặc mật khẩu" });

    const user = await User.findOne({ email: email.toLowerCase(), status: "active" }).select("+password");
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    res.json({
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
