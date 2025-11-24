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

    // resultCode !== 0 là thất bại
    if (data.resultCode !== 0) {
      console.log("❌ Payment failed:", data.message);
      return res.status(200).json({ message: "Payment failed" });
    }

    const { orderId, amount, transId, extraData } = data;

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

    console.log("Parsed - BookingID:", bookingId);

    if (!bookingId) {
      return res.status(400).json({ error: "Missing booking ID" });
    }

    // ===== 1. Lấy thông tin Booking =====
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Kiểm tra booking đã thanh toán chưa
    if (booking.status === "paid") {
      console.log("⚠️ Booking already paid, skipping...");
      return res.status(200).json({ message: "Already processed" });
    }

    // ===== 2. Kiểm tra Payment đã tồn tại chưa (tránh duplicate) =====
    const existingPayment = await Payment.findOne({ transaction: transId });
    if (existingPayment) {
      console.log("⚠️ Payment transaction already exists, skipping...");
      return res.status(200).json({ message: "Transaction already processed" });
    }

    // ===== 3. Kiểm tra BookingDetails đã tồn tại chưa =====
    let bookingDetails = await BookingDetail.find({ bookingId: bookingId });
    
    if (!bookingDetails || bookingDetails.length === 0) {
      console.log("⚠️ No BookingDetails found for this booking");
      return res.status(400).json({ error: "No booking details found" });
    }

    console.log(`✅ Found ${bookingDetails.length} BookingDetails`);

    // ===== 4. Tạo Payment =====
    const payment = await Payment.create({
      bookingId: bookingId,
      method: "momo",
      transaction: transId,
      amount: amount,
      paidAt: new Date(),
      status: "success",
    });
    console.log("✅ Payment created:", payment._id);

    // ===== 5. Tạo Ticket cho từng BookingDetail =====
    const ticketsToInsert = [];

    for (const detail of bookingDetails) {
      // Kiểm tra xem tickets cho BookingDetail này đã tồn tại chưa
      const existingTickets = await Ticket.find({ bookingDetailId: detail._id });
      
      if (existingTickets && existingTickets.length > 0) {
        console.log(`⚠️ Tickets already exist for BookingDetail ${detail._id}, updating status...`);
        
        // Cập nhật status của tickets đã tồn tại
        await Ticket.updateMany(
          { bookingDetailId: detail._id },
          { $set: { status: "confirmed" } }
        );
        
        continue; // Bỏ qua việc tạo tickets mới
      }

      // Tạo tickets mới dựa vào quantity
      const quantity = detail.quantity || 1;
      
      for (let i = 0; i < quantity; i++) {
        const qrCode = await generateUniqueQRCode(detail.audience);
        ticketsToInsert.push({
          bookingDetailId: detail._id,
          ticketTypeId: detail.ticketTypeId,
          qrCode: qrCode,
          status: "confirmed",
        });
      }
    }

    // Insert tickets mới nếu có
    if (ticketsToInsert.length > 0) {
      await Ticket.insertMany(ticketsToInsert);
      console.log(`✅ Created ${ticketsToInsert.length} new tickets`);
    }

    // ===== 6. Cập nhật BookingDetails status =====
    await BookingDetail.updateMany(
      { bookingId: bookingId },
      { $set: { status: "confirmed" } }
    );
    console.log("✅ BookingDetails updated to confirmed");

    // ===== 7. Cập nhật trạng thái Booking =====
    booking.status = "paid";
    booking.paymentMethod = "momo";
    await booking.save();
    console.log("✅ Booking updated to PAID");

    // Đếm tổng số tickets
    const totalTickets = await Ticket.countDocuments({ 
      bookingDetailId: { $in: bookingDetails.map(d => d._id) } 
    });

    res.status(200).json({ 
      message: "Payment processed successfully",
      bookingId: bookingId,
      paymentId: payment._id,
      totalTickets: totalTickets
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