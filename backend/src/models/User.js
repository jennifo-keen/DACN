import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email:  { type: String, required: true, unique: true, lowercase: true, trim: true },
  name:   { type: String, required: true },
  role:   { type: String, enum: ["user", "admin"], default: "user" },
  status: { type: String, enum: ["active", "blocked"], default: "active" },
  // mật khẩu chưa được mã hóa chỉ để test thôi
  password: { type: String, required: true }
}, { timestamps: true });

export const User = mongoose.model("User", userSchema, "users");
