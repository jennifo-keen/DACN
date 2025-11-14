import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "bookings", required: true },
    method: { type: String, required: true},
    transaction: { type: String, required: true},
    paidAt: { type: Date, required: true },
    status: { type: String, required: true },
  },
  { timestamps: true } 
);

export const Payment = mongoose.model("Payment", PaymentSchema, "payments");
