import mongoose from "mongoose";

const ticketTypeSchema = new mongoose.Schema(
  {
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "branches",
      required: true,
    },
    ticketName: { type: String, required: true },
    description_ticket: { type: String, required: true },
    priceAdult: { type: Number, required: true, min: 0 },
    priceChild: { type: Number, required: true, min: 0 },
    includedZones: [{ type: mongoose.Schema.Types.ObjectId, ref: "Zone" }],
    image_tktypes: [{ type: String }],
    status: { type: String, default: "hoạt động" },
  },
  { timestamps: true }
);

export const TicketType = mongoose.model("TicketType", ticketTypeSchema, "ticket_types");
