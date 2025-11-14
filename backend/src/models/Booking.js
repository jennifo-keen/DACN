import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    usingDate: { type: Date, required: true },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, required: true }, 
    promoCodeId: { type: mongoose.Schema.Types.ObjectId, ref: "promocodes", default: null },
    expireAt: { type: Date, required: true },
    status: { type: String, required: true }, 
  },
  { timestamps: true }
);

export const Booking = mongoose.model("Booking", BookingSchema, "bookings");
