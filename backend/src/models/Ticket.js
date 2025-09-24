import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    eventName: { type: String, required: true },
    customerName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["pending", "paid", "canceled"], default: "pending" }
  },
  { timestamps: true }
);

export const Ticket = mongoose.model("Ticket", ticketSchema);
