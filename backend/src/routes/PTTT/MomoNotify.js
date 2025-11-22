import express from "express";
import { Payment } from "../../model/schemas/Payment.js";


import { Ticket } from "../../model/schemas/Ticket.js";
import crypto from "crypto";

const momoNotify = express.Router();

momoNotify.post("/notify", async (req, res) => {
  try {
    const data = req.body;
    console.log("MoMo IPN:", data);

    if (data.resultCode !== 0) {
      return res.status(200).json({ message: "Payment failed" });
    }

    const { orderId, amount, transId, extraData } = data;

    // parse extraData để lấy rid + userId
    let parsedExtra = {};
    try {
      parsedExtra = JSON.parse(extraData || "{}");
    } catch (err) {
      console.warn("Cannot parse extraData:", extraData);
    }
    const rid = parsedExtra.rid;
    const userId = parsedExtra.userId;

    // kiểm tra Payment đã tồn tại chưa
    let payment = await Payment.findOne({ orderId: data.orderId });
    if (!payment) {
      payment = new Payment({
        provider: "MoMo",
        txnId: data.transId,
        amount: Number(data.amount),
        status: "succeeded",
        paidAt: new Date(),
        rawPayload: data,
        orderId: data.orderId,
      });
      await payment.save();
    }

    

    

    // tạo Ticket cho từng item
    const ticketsToInsert = [];
    items.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        const qrCode = crypto.randomBytes(6).toString("hex"); // random QR code
        ticketsToInsert.push({
          orderId: order._id,
          userId: order.userId,
          categoryCode: item.categoryCode,
          visitDate: order.visitDate,
          status: "active",
          qrCode
        });
      }
    });

    if (ticketsToInsert.length > 0) {
      await Ticket.insertMany(ticketsToInsert);
    }

    res.status(200).json({ message: "Payment processed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default momoNotify;
