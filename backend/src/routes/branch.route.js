import { Router } from "express";
import { Branch } from "../models/Branch.js";

const router = Router();

// ===== LẤY TOÀN BỘ CHI NHÁNH =====
router.get("/branches", async (req, res) => {
  try {
    const branches = await Branch.find()
      .select("branchName provincesName provincesId description_branch image_branch address isFeatured createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: branches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ===== TẠO CHI NHÁNH MỚI =====
router.post("/branches", async (req, res) => {
  try {
    const { provincesId, branchName, description_branch, provincesName, image_branch, address } = req.body;

    if (!branchName) {
      return res.status(400).json({
        success: false,
        error: "branchName is required",
      });
    }

    const doc = await Branch.create({
      provincesId: provincesId || null,
      branchName,
      provincesName: provincesName || "",
      description_branch: description_branch || "",
      image_branch: image_branch || [], // ✅ đảm bảo luôn có ảnh
      address: address || "",
    });

    res.status(201).json({
      success: true,
      message: "Tạo chi nhánh thành công!",
      data: doc,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ===== LẤY CHI NHÁNH THEO ID =====
router.get("/branches/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Branch.findById(id).select("branchName provincesName provincesId description_branch image_branch address");

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chi nhánh",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy chi nhánh theo ID thành công!",
      data,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: e.message,
    });
  }
});

// ===== LẤY CHI NHÁNH (GẮN VỚI KHU ZONE) =====
router.get("/branchesZone/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Branch.findById(id).select("branchName description_branch image_branch provincesId");

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chi nhánh",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy chi nhánh thành công!",
      data,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: e.message,
    });
  }
});

export default router;
