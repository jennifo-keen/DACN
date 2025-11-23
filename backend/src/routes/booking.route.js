import express from "express";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";

const router = express.Router();

/**
 * 🟢 API: POST /api/bookings
 * Tạo đơn booking giữ chỗ 5 phút
 */
router.post("/", async (req, res) => {
  try {
    const { userId, usingDate, totalAmount, paymentMethod } = req.body;

    if (!userId || !usingDate || !totalAmount) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin booking" });
    }

    const expireAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút
    const newBooking = new Booking({
      userId,
      usingDate,
      totalAmount,
      paymentMethod,
      expireAt,
      status: "holding",
    });

    await newBooking.save();

    // Hẹn tự động chuyển expired sau 5 phút
    setTimeout(async () => {
      const b = await Booking.findById(newBooking._id);
      if (b && b.status === "holding") {
        b.status = "expired";
        await b.save();
        console.log(`⏰ Booking ${b._id} đã hết hạn (5 phút).`);
      }
    }, 5 * 60 * 1000);

    res.json({ success: true, booking: newBooking });
  } catch (err) {
    console.error("Lỗi tạo booking:", err);
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

    // ✅ Khi thanh toán thành công thì mới lưu chi tiết vé
    if (tickets?.length) {
      const BookingDetail = mongoose.model("BookingDetails");
      const detailDocs = tickets.map((t) => ({
        bookingId: booking._id,
        branchId: t.branchId,
        ticketTypeId: t.ticketTypeId,
        quantityAdult: t.quantityAdult || 0,
        quantityChild: t.quantityChild || 0,
        priceAdult: t.priceAdult || 0,
        priceChild: t.priceChild || 0,
        totalPrice: t.totalPrice || 0,
        status: "paid",
      }));
      await BookingDetail.insertMany(detailDocs);
    }

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
