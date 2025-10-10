import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  email:  { type: String, required: true, unique: true, lowercase: true, trim: true },
  name:   { type: String, required: true },
  phone:  { type: String, required: true, trim: true },
  role:   { type: String, enum: ["user", "admin"], default: "user" },
  status: { type: String, enum: ["active", "blocked"], default: "active" },
  password: { type: String, required: true, select: false },
}, { timestamps: true });

// 🔒 Mã hóa mật khẩu trước khi lưu
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export const User = mongoose.model("User", userSchema, "users");
