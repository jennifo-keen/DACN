import { Router } from "express";
import { TicketType } from "../models/TicketType.js";
import mongoose from "mongoose";

const router = Router();

router.get("/ticketType/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "Thiếu id chi nhánh" });
    }

    const tickets = await TicketType.find({ branchId: id });

    if (!tickets || tickets.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy vé cho chi nhánh này" });
    }

    res.status(200).json({
      success: true,
      message: "Lấy dữ liệu vé thành công",
      tickets,
    });
  } 
  catch (error) {
    console.error("Lỗi khi lấy dữ liệu vé:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy dữ liệu vé",
      error: error.message,
    });
  }
});

export default router;
