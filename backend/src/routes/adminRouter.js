import express from "express";
import jwt from "jsonwebtoken";
import { Admin } from "../models/Admin.js";

const router = express.Router();

router.post("/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin" });
    }

    const admin = await Admin.findOne({ admin_login: username });

    if (!admin || admin.password !== password) {
      return res.status(401).json({ error: "Tên đăng nhập hoặc mật khẩu không đúng" });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        admin_login: admin.admin_login,
        role: admin.role,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7h" }
    );

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: admin._id,
        admin_login: admin.admin_login,
        fullName_admin: admin.fullName_admin,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
});

router.post("/admin/register", async (req, res) => {
  try {
    const { admin_login, email, phone, password, fullName_admin, role } = req.body;

    if (!admin_login || !email || !password || !fullName_admin || !role) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
    }

    const existingAdmin = await Admin.findOne({
      $or: [{ email }, { admin_login }],
    });

    if (existingAdmin) {
      return res.status(400).json({ error: "Tên đăng nhập hoặc email đã tồn tại" });
    }

    const newAdmin = new Admin({
      admin_login,
      email,
      phone,
      password,
      fullName_admin,
      role,
    });

    await newAdmin.save();

    res.status(201).json({
      message: "Đăng ký thành công",
      user: {
        id: newAdmin._id,
        admin_login: newAdmin.admin_login,
        email: newAdmin.email,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
});

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Không có token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Token không hợp lệ" });
  }
};

router.get("/admin/profile", verifyToken, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password");
    if (!admin) return res.status(404).json({ error: "Admin không tồn tại" });

    res.json({ user: admin });
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
});

export default router;
