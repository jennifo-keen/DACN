import mongoose from "mongoose";

const zoneSchema = new mongoose.Schema(
  {
    branchesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'branches',
      required: true,
    },
    zoneName: { type: String, required: true },
    description_zone: { type: String, required: true },
    openingTime_zone: { type: Date, required: true },
    closingTime_zone: { type: Date, required: true },
    image_zone: { type: [String], default: [] },
  },
);

export const Zone = mongoose.model("Zone", zoneSchema, "zones");