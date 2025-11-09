import mongoose from "mongoose";

const ProvinceSchema = new mongoose.Schema(
  {
    provinceName: { type: String, required: true }, // Tên tỉnh thành
    description: { type: String, default: "" }, // Mô tả tỉnh
    image_province: {
      type: [String], // Mảng đường dẫn ảnh (Cloudinary, local...)
      default: [],    // Mặc định rỗng
    },
  },
  { timestamps: true } // Tự động tạo createdAt, updatedAt
);

export const Province = mongoose.model("provinces", ProvinceSchema);
