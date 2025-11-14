import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema(
  {
    admin_login: { type: String, required: true },
    fullName_admin: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
  },
  { timestamps: true }
);

export const Admin = mongoose.model("admins", AdminSchema);
