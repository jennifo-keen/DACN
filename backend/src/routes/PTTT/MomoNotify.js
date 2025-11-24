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

    if (data.resultCode !== 0) {
      console.log("❌ Payment failed:", data.message);
      return res.status(200).json({ message: "Payment failed" });
    }

    const { transId, extraData } = data;

    // Parse extraData để lấy bookingId và ticketItems
    let parsedExtra = {};
    try {
      const decoded = Buffer.from(extraData, "base64").toString("utf8");
      parsedExtra = JSON.parse(decoded);
    } catch (err) {
      try {
        parsedExtra = JSON.parse(extraData || "{}");
      } catch (e) {
        console.warn("Cannot parse extraData:", extraData);
      }
    }

    const bookingId = parsedExtra.rid || parsedExtra.bookingId;
    const ticketItems = parsedExtra.ticketItems || [];

    if (!bookingId) {
      return res.status(400).json({ error: "Missing booking ID" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.status === "paid") return res.status(200).json({ message: "Already processed" });

    const existingPayment = await Payment.findOne({ transaction: transId });
    if (existingPayment) return res.status(200).json({ message: "Transaction already processed" });

    // ===== 1. Tạo Payment =====
    const payment = await Payment.create({
      bookingId,
      method: "momo",
      transaction: transId,
      amount: data.amount,
      paidAt: new Date(),
      status: "success",
    });
    console.log("✅ Payment created:", payment._id);

    // ===== 2. Tạo BookingDetails từ ticketItems =====
    const bookingDetailsToInsert = [];

    for (const item of ticketItems) {
      if (!item.quantity || item.quantity <= 0) continue; // bỏ qua quantity = 0

      const ticketType = await TicketType.findById(item.ticketTypeId);
      if (!ticketType) continue;

      const unitPrice =
        item.audienceType === "adult" ? ticketType.priceAdult : ticketType.priceChild;

      const totalPrice = unitPrice * item.quantity;

      bookingDetailsToInsert.push({
        bookingId,
        ticketTypeId: item.ticketTypeId,
        audience: item.audienceType,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      });
    }

    const createdBookingDetails = await BookingDetail.insertMany(bookingDetailsToInsert);
    console.log(`✅ Created ${createdBookingDetails.length} BookingDetails`);

    // ===== 3. Tạo tickets cho từng BookingDetail =====
    const ticketsToInsert = [];
    for (const detail of createdBookingDetails) {
      for (let i = 0; i < detail.quantity; i++) {
        const qrCode = await generateUniqueQRCode(detail.audience);
        ticketsToInsert.push({
          bookingDetailId: detail._id,
          ticketTypeId: detail.ticketTypeId,
          qrCode,
          status: "confirmed",
        });
      }
    }

    if (ticketsToInsert.length > 0) {
      await Ticket.insertMany(ticketsToInsert);
      console.log(`✅ Created ${ticketsToInsert.length} Tickets`);
    }

    // ===== 4. Cập nhật Booking status =====
    booking.status = "paid";
    booking.paymentMethod = "momo";
    await booking.save();
    console.log("✅ Booking updated to PAID");

    res.status(200).json({
      message: "Payment processed successfully",
      bookingId,
      paymentId: payment._id,
      totalTickets: ticketsToInsert.length,
    });
  } catch (err) {
    console.error("❌ MoMo Notify Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ===== Helper: Tạo QR Code unique =====
async function generateUniqueQRCode(audience = "TICKET") {
  let qrCode;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;
  
  while (!isUnique && attempts < maxAttempts) {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const typePrefix = audience ? audience.toUpperCase().substring(0, 3) : "TKT";
    
    qrCode = `QR-${typePrefix}-${dateStr}-${timestamp}${random}`;
    
    // Check xem QR code đã tồn tại chưa
    const existing = await Ticket.findOne({ qrCode: qrCode });
    if (!existing) {
      isUnique = true;
    }
    attempts++;
  }
  
  if (!isUnique) {
    // Fallback: dùng UUID-like format
    qrCode = `QR-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
  
  return qrCode;
}

export default momoNotify;