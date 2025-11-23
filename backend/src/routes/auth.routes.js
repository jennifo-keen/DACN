import express from "express";
import { User } from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const router = express.Router();

function signToken(user) {
  const secret = process.env.JWT_SECRET || "funworld_backup_secret_key_2024_minimum_32_chars_long";
  
  // ✅ Nhét toàn bộ user info vào payload
  const payload = { 
    sub: user._id.toString(),
    _id: user._id.toString(),
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
    status: user.status
  };
  
  const expiresIn = process.env.JWT_EXPIRES || "7d";
  const token = jwt.sign(payload, secret, { expiresIn });
  
  console.log("✅ Token created with user data inside");
  return token;
}
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

    const token = signToken(user);
    res.json({
      success: true,
      message: "Đăng nhập thành công",
      token,
      user: {
         _id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 CẬP NHẬT THÔNG TIN USER
router.put("/update-profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
    }

    if (!phone.match(/^0\d{9}$/)) {
      return res.status(400).json({ error: "Số điện thoại không hợp lệ (phải có 10 chữ số, bắt đầu bằng 0)" });
    }

    const existingUser = await User.findOne({ 
      email: email.toLowerCase(), 
      _id: { $ne: userId } 
    });
    
    if (existingUser) {
      return res.status(400).json({ error: "Email đã được sử dụng bởi tài khoản khác" });
    }

    // Cập nhật user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim()
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    }

    // Trả về thông tin đã cập nhật
    res.json({
      _id: updatedUser._id,
      email: updatedUser.email,
      name: updatedUser.name,
      phone: updatedUser.phone,
      role: updatedUser.role,
      status: updatedUser.status,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;