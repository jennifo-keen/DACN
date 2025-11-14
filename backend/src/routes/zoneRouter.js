import { Router } from "express";
import { Zone } from "../models/Zone.js"
import mongoose from "mongoose";

const router = Router();

router.get("/zones/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "Không có thông tin id zone" });
    }

    const zones = await Zone.find({ _id: id });

    res.status(200).json({
      success: true,
      message: "Lấy dữ liệu zone thành công",
      zones,
    });
  } 
  catch (error) {
    console.error("Lỗi khi lấy dữ liệu vé:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy dữ liệu zone",
      error: error.message,
    });
  }
});

export default router;
