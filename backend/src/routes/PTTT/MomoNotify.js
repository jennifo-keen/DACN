import express from "express";
import { Payment } from "../../models/Payment.js";
import { BookingDetail } from "../../models/BookingDetail.js";
import { Ticket } from "../../models/Ticket.js";
import { Booking } from "../../models/Booking.js";

const momoNotify = express.Router();

momoNotify.post("/notify", async (req, res) => {
  try {
    const data = req.body;
    console.log("=== MoMo IPN Callback ===");
    console.log(JSON.stringify(data, null, 2));

    // resultCode !== 0 là thất bại
    if (data.resultCode !== 0) {
      console.log("❌ Payment failed:", data.message);
      return res.status(200).json({ message: "Payment failed" });
    }

    const { orderId, amount, transId, extraData } = data;

    // Parse extraData để lấy rid (bookingId) + userId
    let parsedExtra = {};
    try {
      // extraData có thể là base64 hoặc JSON string
      const decoded = Buffer.from(extraData, "base64").toString("utf8");
      parsedExtra = JSON.parse(decoded);
    } catch (err) {
      try {
        parsedExtra = JSON.parse(extraData || "{}");
      } catch (e) {
        console.warn("Cannot parse extraData:", extraData);
      }
    }

    const rid = parsedExtra.rid; // bookingId
    const userId = parsedExtra.userId;

    console.log("Parsed - RID:", rid, "UserID:", userId);

    if (!rid) {
      return res.status(400).json({ error: "Missing booking ID (rid)" });
    }

    // ===== 1. Lấy thông tin Booking =====
    const booking = await Booking.findById(rid);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // ===== 2. Kiểm tra Payment đã tồn tại chưa (tránh duplicate) =====
    const existingPayment = await Payment.findOne({ transaction: transId });
    if (existingPayment) {
      console.log("⚠️ Payment already exists, skipping...");
      return res.status(200).json({ message: "Already processed" });
    }

    // ===== 3. Tạo Payment =====
    const payment = await Payment.create({
      bookingId: rid,
      method: "momo",
      transaction: transId,
      paidAt: new Date(),
      status: "success",
    });
    console.log("✅ Payment created:", payment._id);

    // ===== 4. Tạo BookingDetail từ booking.tickets =====
    const bookingDetails = [];
    
    if (booking.tickets && booking.tickets.length > 0) {
      for (const ticket of booking.tickets) {
        const detail = await BookingDetail.create({
          bookingId: rid,
          branchId: ticket.branchId,
          ticketTypeId: ticket.ticketTypeId,
          quantityAdult: ticket.quantityAdult || 0,
          quantityChild: ticket.quantityChild || 0,
          priceAdult: ticket.priceAdult || 0,
          priceChild: ticket.priceChild || 0,
          totalPrice: ticket.totalPrice || 0,
        });
        bookingDetails.push(detail);
        console.log("✅ BookingDetail created:", detail._id);
      }
    }

    // ===== 5. Tạo Ticket cho từng người =====
    const ticketsToInsert = [];

    for (const detail of bookingDetails) {
      // Tạo ticket cho người lớn
      for (let i = 0; i < detail.quantityAdult; i++) {
        const qrCode = await generateQRCode();
        ticketsToInsert.push({
          bookingId: rid,
          bookingDetailId: detail._id,
          ticketTypeId: detail.ticketTypeId,
          userId: userId || booking.userId,
          qrCode: qrCode,
          issueDate: new Date(),
          validUntil: booking.usingDate || addDays(new Date(), 30),
          status: "valid",
        });
      }

      // Tạo ticket cho trẻ em
      for (let i = 0; i < detail.quantityChild; i++) {
        const qrCode = await generateQRCode();
        ticketsToInsert.push({
          bookingId: rid,
          bookingDetailId: detail._id,
          ticketTypeId: detail.ticketTypeId,
          userId: userId || booking.userId,
          qrCode: qrCode,
          issueDate: new Date(),
          validUntil: booking.usingDate || addDays(new Date(), 30),
          status: "valid",
        });
      }
    }

    if (ticketsToInsert.length > 0) {
      await Ticket.insertMany(ticketsToInsert);
      console.log(`✅ Created ${ticketsToInsert.length} tickets`);
    }

    // ===== 6. Cập nhật trạng thái Booking =====
    booking.status = "paid";
    booking.paymentMethod = "momo";
    booking.paymentId = payment._id;
    await booking.save();
    console.log("✅ Booking updated to PAID");

    res.status(200).json({ message: "Payment processed successfully" });
  } catch (err) {
    console.error("❌ MoMo Notify Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ===== Helper: Tạo QR Code unique =====
async function generateQRCode() {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `FWPQ-${dateStr}-${random}`;
}

// ===== Helper: Thêm ngày =====
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export default momoNotify;