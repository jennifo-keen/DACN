import express from "express";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import BookingDetail from "../models/BookingDetail.js";
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { userId, usingDate, totalAmount, tickets } = req.body;

    if (!userId || !usingDate || !totalAmount || !tickets?.length) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin booking" });
    }

    const expireAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút
    const newBooking = new Booking({
      userId,
      usingDate,
      totalAmount,
      paymentMethod: "pending",
      expireAt,
      status: "holding",
    });
    await newBooking.save();

    const detailDocs = tickets.map(t => {
      const unitPrice = t.priceAdult || t.priceChild;
      if (t.unitPrice == null || t.quantity == null || !t.audienceType) {
        throw new Error("Ticket missing required fields");
      }

      return {
        bookingId: newBooking._id,
        ticketTypeId: t.ticketTypeId,
        audience: t.audienceType,
        quantity: t.quantity,
        unitPrice,
        totalPrice: t.unitPrice * t.quantity,
        status: "pending",
      };
    });

    const createdDetails = await BookingDetail.insertMany(detailDocs);

    // ===== TỰ XÓA NẾU QUÁ HẠN 5 PHÚT =====
    setTimeout(async () => {
      const bookingCheck = await Booking.findById(newBooking._id);
      if (bookingCheck && bookingCheck.status === "holding") {
        await BookingDetail.deleteMany({ bookingId: newBooking._id });
        await Booking.findByIdAndDelete(newBooking._id);
        console.log(`⏰ Booking ${newBooking._id} và chi tiết vé đã bị xóa do quá hạn 5 phút`);
      }
    }, 5 * 60 * 1000);

    res.json({ success: true, booking: newBooking, details: createdDetails });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});


/**
 * 🟡 API: PUT /api/bookings/:id/pay
 * Thanh toán thành công → cập nhật status + tạo BookingDetails
 */
router.put("/:id/pay", async (req, res) => {
  try {
    const { id } = req.params;
    const { tickets } = req.body;

    const booking = await Booking.findById(id);
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy booking" });

    if (booking.status === "expired")
      return res
        .status(400)
        .json({ success: false, message: "Booking đã hết hạn" });

    // ✅ Cập nhật trạng thái sang paid
    booking.status = "paid";
    await booking.save();

    res.json({ success: true, booking });
  } catch (err) {
    console.error("Lỗi thanh toán:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

/**
 * 🟠 API: PUT /api/bookings/:id
 * Hủy / cập nhật status (vd: hết hạn)
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findById(id);
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy booking" });

    booking.status = status || booking.status;
    await booking.save();

    res.json({ success: true, booking });
  } catch (err) {
    console.error("Lỗi cập nhật booking:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await Booking.find({ userId }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
export default router;
