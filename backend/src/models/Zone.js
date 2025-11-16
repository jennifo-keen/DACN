import mongoose from "mongoose";

const zoneSchema = new mongoose.Schema(
  {
    branchesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    zoneName: { type: String, required: true },
    description: { type: String, required: true },
    openingTime: { type: Date, required: true },
    closingTime: { type: Date, required: true },
    image_zone: { type: [String], default: [] },
  },
);

export const Zone = mongoose.model("Zone", zoneSchema, "zones");