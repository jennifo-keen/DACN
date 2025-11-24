import mongoose from "mongoose";

const BookingDetailSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    ticketTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "TicketType", required: true },
    audience: { type: String, enum: ["adult", "child"], required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number },
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
  },
  { timestamps: true }
);

//    ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
//         PARAM THỨ 3 ÉP CHÍNH XÁC COLLECTION
export const BookingDetail = mongoose.model(
  "BookingDetail",
  BookingDetailSchema,
  "bookingDetails"        // <--- ép đúng tên collection
);

export default BookingDetail;
