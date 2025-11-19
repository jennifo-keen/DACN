import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
    usingDate: { type: Date, required: true },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, default: "momo" },
    promoCodeId: { type: mongoose.Schema.Types.ObjectId, ref: "Promo_codes", default: null },
    expireAt: { type: Date },
    status: {
      type: String,
      enum: ["holding", "paid", "expired"],
      default: "holding",
    },
  },
  { timestamps: true }
);

// Tự động set expireAt sau 5 phút
bookingSchema.pre("save", function (next) {
  if (!this.expireAt) {
    this.expireAt = new Date(Date.now() + 5 * 60 * 1000);
  }
  next();
});

const Booking = mongoose.model("Bookings", bookingSchema);
export default Booking;
