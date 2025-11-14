import mongoose from "mongoose";

const ProvinceSchema = new mongoose.Schema(
  {
    provinceName: { type: String, required: true },
    description: { type: String, default: "" }, 
    image_province: {
      type: [String], 
      default: [],  
    },
  },
  { timestamps: true } 
);

export const Province = mongoose.model("provinces", ProvinceSchema);
