import { Router } from "express";
import { Branch } from "../models/Branch.js";

const router = Router();

router.get("/branches", async (req, res) => {
  try {
    const branches = await Branch.find()
      .select("branchName provincesName provincesId description_branch image_branch")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: branches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post("/branches", async (req, res) => {
  try {
    const { provincesId, branchName, description_branch, provincesName } = req.body;
    
    if (!branchName) {
      return res.status(400).json({ 
        success: false,
        error: "branchName is required" 
      });
    }
    
    const doc = await Branch.create({
      provincesId: provincesId || null,
      branchName,
      provincesName: provincesName || "",
      description_branch: description_branch || "",
      image_branch: [],
    });
    
    res.status(201).json({
      success: true,
      message: "Tạo chi nhánh thành công",
      data: doc
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get("/branches/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const data = await Branch.findOne({ _id: id });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chi nhánh"
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy chi nhánh theo ID thành công!",
      data: data,
    });
  } catch (e) {
    res.status(500).json({ 
      success: false,
      message: "Lỗi server",
      error: e.message
    });
  }
});

router.get("/branchesZone/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const data = await Branch.findOne({ _id: id });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chi nhánh"
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy chi nhánh thành công!",
      data: data,
    });
  } catch (e) {
    res.status(500).json({ 
      success: false,
      message: "Lỗi server",
      error: e.message
    });
  }
});

export default router;
