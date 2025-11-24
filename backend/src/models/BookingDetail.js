import mongoose from "mongoose";

const BookingDetailSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "bookings", required: true },
    ticketTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "tickettypes", required: true },
    audience: { type: String, enum: ["adult", "child"], required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
  },
  { timestamps: true }
);

export const BookingDetail = mongoose.model("bookingDetails", BookingDetailSchema);
export default BookingDetail;
