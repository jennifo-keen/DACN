import mongoose from "mongoose";

const BranchSchema = new mongoose.Schema(
  {
    branchName: { type: String, required: true },
    provincesId: { type: mongoose.Schema.Types.ObjectId, ref: "provinces" },
    provincesName: { type: String, required: true },
    description_branch: { type: String, default: "" },
    // LƯU MẢNG URL ẢNH (String)
    image_branch: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Branch = mongoose.model("branches", BranchSchema);
