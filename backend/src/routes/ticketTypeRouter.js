import { Router } from "express";
import { TicketType } from "../models/TicketType.js";
import { Zone } from "../models/Zone.js";
import { Branch } from "../models/Branch.js";
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

router.get("/ticketDetail/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(404).json({ message: "Không có id vé" });
    }

    const ticketDetail = await TicketType.findOne({_id: id}).populate("includedZones");

    if (!ticketDetail) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy vé"
      });
    }

    res.status(200).json({
      success: true,
      data: ticketDetail,
      message: "Lấy thành công chi tiết vé"
    });
  }
  catch (e) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy chi tiết vé",
      error: e.message
    });
  }
});

router.get("/ticket-types", async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = {};
    
    if (search) {
      const branches = await Branch.find({
        branchName: { $regex: search, $options: "i" }
      });
      const branchIds = branches.map(b => b._id);
      
      const zones = await Zone.find({
        zoneName: { $regex: search, $options: "i" }
      });
      const zoneIds = zones.map(z => z._id);
      
      query = {
        $or: [
          { ticketName: { $regex: search, $options: "i" } },
          { branchId: { $in: branchIds } },
          { includedZones: { $in: zoneIds } }
        ]
      };
    }
    
    const ticketTypes = await TicketType.find(query)
      .populate("branchId", "branchName provincesName")
      .populate("includedZones", "zoneName description")
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: ticketTypes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get("/ticket-types/:id", async (req, res) => {
  try {
    const ticketType = await TicketType.findById(req.params.id)
      .populate("branchId", "branchName provincesName")
      .populate("includedZones", "zoneName description");
    
    if (!ticketType) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy ticket type"
      });
    }
    
    res.status(200).json({
      success: true,
      data: ticketType
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post("/ticket-types", async (req, res) => {
  try {
    const {
      branchId,
      ticketName,
      description_ticket,
      priceAdult,
      priceChild,
      includedZones,
      image_tktypes,
      status
    } = req.body;
    
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch không tồn tại"
      });
    }
    
    if (includedZones && includedZones.length > 0) {
      const zones = await Zone.find({ _id: { $in: includedZones } });
      if (zones.length !== includedZones.length) {
        return res.status(404).json({
          success: false,
          message: "Một hoặc nhiều zone không tồn tại"
        });
      }
    }
    
    const newTicketType = new TicketType({
      branchId,
      ticketName,
      description_ticket,
      priceAdult,
      priceChild,
      includedZones,
      image_tktypes,
      status: status || "hoạt động"
    });
    
    await newTicketType.save();
    
    const populatedTicket = await TicketType.findById(newTicketType._id)
      .populate("branchId", "branchName provincesName")
      .populate("includedZones", "zoneName description");
    
    res.status(201).json({
      success: true,
      message: "Tạo ticket type thành công",
      data: populatedTicket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.put("/ticket-types/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.body.branchId) {
      const branch = await Branch.findById(req.body.branchId);
      if (!branch) {
        return res.status(404).json({
          success: false,
          message: "Branch không tồn tại"
        });
      }
    }
    
    if (req.body.includedZones && req.body.includedZones.length > 0) {
      const zones = await Zone.find({ _id: { $in: req.body.includedZones } });
      if (zones.length !== req.body.includedZones.length) {
        return res.status(404).json({
          success: false,
          message: "Một hoặc nhiều zone không tồn tại"
        });
      }
    }
    
    const updatedTicket = await TicketType.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("branchId", "branchName provincesName")
      .populate("includedZones", "zoneName description");
    
    if (!updatedTicket) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy ticket type"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Cập nhật ticket type thành công",
      data: updatedTicket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.delete("/ticket-types/:id", async (req, res) => {
  try {
    const deletedTicket = await TicketType.findByIdAndDelete(req.params.id);
    
    if (!deletedTicket) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy ticket type"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Xóa ticket type thành công"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;