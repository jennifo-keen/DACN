import mongoose from "mongoose";

const BranchSchema = new mongoose.Schema(
  {
    branchName: { type: String, required: true },
    provincesId: { type: mongoose.Schema.Types.ObjectId, ref: "provinces" },
    description_branch: { type: String, default: "" },
    image_branch: { type: [String], default: [] },
    isFeatured: { type: Boolean, default: false },
    address: { type: String, default: "" },
  },
  { timestamps: true }
);
export const Branch = mongoose.model("branches", BranchSchema);