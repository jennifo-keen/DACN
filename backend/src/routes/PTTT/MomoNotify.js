import express from "express";
import { Payment } from "../../models/Payment.js";
import { BookingDetail } from "../../models/BookingDetail.js";
import { Ticket } from "../../models/Ticket.js";
import Booking from "../../models/Booking.js";

const momoNotify = express.Router();

momoNotify.post("/notify", async (req, res) => {
  try {
    const data = req.body;
    console.log("=== MoMo IPN Callback ===");
    console.log(JSON.stringify(data, null, 2));

    // Thanh toán thất bại
    if (data.resultCode !== 0) {
      console.log("❌ Payment failed:", data.message);
      return res.status(200).json({ message: "Payment failed" });
    }

    const { orderId, amount, transId, extraData } = data;

    // ===== Giải mã extraData =====
    let parsedExtra = {};
    try {
      const decoded = Buffer.from(extraData, "base64").toString("utf8");
      parsedExtra = JSON.parse(decoded);
    } catch (err) {
      parsedExtra = JSON.parse(extraData || "{}");
    }

    const rid = parsedExtra.rid;
    const userId = parsedExtra.userId;
    const tickets = parsedExtra.tickets || [];

    console.log("Parsed Extra:", parsedExtra);

    if (!rid) return res.status(400).json({ error: "Thiếu booking ID" });

    // ===== 1. Lấy thông tin booking =====
    const booking = await Booking.findById(rid);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // ===== 2. Tạo hoặc lấy Payment =====
    let payment = await Payment.findOne({ transaction: transId });
    if (!payment) {
      payment = await Payment.create({
        bookingId: rid,
        method: "momo",
        transaction: transId,
        amount,
        paidAt: new Date(),
        status: "success",
      });
      console.log("✅ Payment created:", payment._id);
    } else {
      console.log("⚠️ Payment already exists:", payment._id);
    }

    // ===== 3. Lấy hoặc tạo BookingDetails =====
    let bookingDetails = await BookingDetail.find({ bookingId: rid });
    if (bookingDetails.length === 0 && tickets.length > 0) {
      console.log("🆕 Tạo BookingDetails mới:", tickets.length);
      bookingDetails = [];
      for (const t of tickets) {
        const detail = await BookingDetail.create({
          bookingId: rid,
          branchId: t.branchId,
          ticketTypeId: t.ticketTypeId,
          quantityAdult: t.quantityAdult || 0,
          quantityChild: t.quantityChild || 0,
          priceAdult: t.priceAdult || 0,
          priceChild: t.priceChild || 0,
          totalPrice: t.totalPrice || 0,
          status: "paid",
        });
        bookingDetails.push(detail);
      }
    } else {
      console.log("📦 BookingDetails tìm thấy:", bookingDetails.length);
    }

    // ===== 4. Tạo vé cho từng người =====
    const ticketsToInsert = [];
    for (const detail of bookingDetails) {
      // Vé người lớn
      for (let i = 0; i < (detail.quantityAdult || detail.quantity || 0); i++) {
        const qrCode = await generateQRCode();
        ticketsToInsert.push({
          bookingId: rid,
          bookingDetailId: detail._id,
          ticketTypeId: detail.ticketTypeId,
          userId: userId || booking.userId,
          qrCode,
          issueDate: new Date(),
          validUntil: booking.usingDate || addDays(new Date(), 30),
          status: "valid",
        });
      }
      // Vé trẻ em
      for (let i = 0; i < (detail.quantityChild || 0); i++) {
        const qrCode = await generateQRCode();
        ticketsToInsert.push({
          bookingId: rid,
          bookingDetailId: detail._id,
          ticketTypeId: detail.ticketTypeId,
          userId: userId || booking.userId,
          qrCode,
          issueDate: new Date(),
          validUntil: booking.usingDate || addDays(new Date(), 30),
          status: "valid",
        });
      }
      detail.status = "confirmed";
      await detail.save();
    }

    if (ticketsToInsert.length > 0) {
      await Ticket.insertMany(ticketsToInsert);
      console.log(`✅ Đã tạo ${ticketsToInsert.length} vé cho booking ${rid}`);
    } else {
      console.log("⚠️ Không có vé nào được tạo");
    }

    // ===== 5. Cập nhật booking =====
    booking.status = "paid";
    booking.paymentMethod = "momo";
    booking.paymentId = payment._id;
    await booking.save();

    console.log("✅ Booking cập nhật thành PAID");
    return res.status(200).json({ message: "Payment processed successfully" });
  } catch (err) {
    console.error("❌ MoMo Notify Error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ===== Helpers =====
async function generateQRCode() {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `FWPQ-${dateStr}-${random}`;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// ===== Xác minh thanh toán =====
momoNotify.post("/verify", async (req, res) => {
  try {
    const { orderId, requestId } = req.body;
    const payment = await Payment.findOne({
      $or: [{ transaction: orderId }, { transaction: requestId }],
    });
    if (!payment) return res.json({ success: false, message: "Không tìm thấy giao dịch" });
    if (payment.status === "success")
      return res.json({ success: true, message: "Thanh toán thành công" });
    return res.json({ success: false, message: "Thanh toán thất bại" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

export default momoNotify;
