import mongoose from "mongoose";

const BookingDetailSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "bookings", required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "branches", required: true },
    ticketTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "tickettypes", required: true },
    quantityAdult: { type: Number, default: 0 },
    quantityChild: { type: Number, default: 0 },
    priceAdult: { type: Number, required: true },
    priceChild: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
  },
  { timestamps: true }
);

export const BookingDetail = mongoose.model("BookingDetail", BookingDetailSchema, "bookingDetails");

