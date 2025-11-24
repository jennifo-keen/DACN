import express from "express";
import { Payment } from "../../models/Payment.js";
import { BookingDetail } from "../../models/BookingDetail.js";
import Tickets from "../../models/Tickets.js";
import Booking from "../../models/Booking.js";

const momoNotify = express.Router();

momoNotify.post("/notify", async (req, res) => {
  try {
    const data = req.body;
    console.log("=== MoMo IPN Callback ===", JSON.stringify(data, null, 2));

    if (data.resultCode !== 0) {
      console.log("❌ Payment failed:", data.message);
      return res.status(200).json({ message: "Payment failed" });
    }

    const { transId, extraData } = data;

    // Parse extraData để lấy bookingId
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
    if (!bookingId) return res.status(400).json({ error: "Missing booking ID" });

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

    // ===== 2. Lấy BookingDetails =====
    const bookingDetails = await BookingDetail.find({ bookingId });
    console.log(`📋 Found ${bookingDetails.length} booking details`);

    if (!bookingDetails.length) {
      console.warn("❌ Không tìm thấy BookingDetails cho booking này");
      return res.status(400).json({ error: "No BookingDetails found" });
    }

    // ===== 3. Tạo Tickets cho từng BookingDetail =====
    const ticketsToInsert = [];
    console.log("🎫 Starting ticket creation process...");

    for (const detail of bookingDetails) {
      console.log(`Processing detail ${detail._id}, quantity: ${detail.quantity}`);
      
      for (let i = 0; i < detail.quantity; i++) {
        const qrCode = await generateUniqueQRCode(detail.audience);
        
        const ticketData = {
          bookingDetailId: detail._id,
          ticketTypeId: detail.ticketTypeId,
          qrCode,
          status: "confirmed",
        };
        
        console.log(`➡️ Ticket ${i + 1}/${detail.quantity}:`, ticketData);
        ticketsToInsert.push(ticketData);
      }
    }

    console.log(`✅ Prepared ${ticketsToInsert.length} tickets for insertion`);

    if (ticketsToInsert.length > 0) {
      const insertedTickets = await Tickets.insertMany(ticketsToInsert);
      console.log(`✅ Successfully inserted ${insertedTickets.length} tickets into DB`);
    } else {
      console.warn("⚠️ No tickets to insert!");
      return res.status(400).json({ error: "Failed to prepare tickets" });
    }

    // ===== 4. Update Booking (CHỈ KHI ĐÃ TẠO TICKETS THÀNH CÔNG) =====
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

    const existing = await Tickets.findOne({ qrCode });
    if (!existing) isUnique = true;
    attempts++;
  }

  if (!isUnique) {
    qrCode = `QR-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  return qrCode;
}

export default momoNotify;