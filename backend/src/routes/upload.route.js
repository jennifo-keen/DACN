import { Router } from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import { Branch } from "../models/Branch.js";

const router = Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req) => ({
    folder: `funworld/branches/${req.params.branchId}`,
    resource_type: "image",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  }),
});
const upload = multer({ storage });

/** POST /api/admin/branches/:branchId/images — upload nhiều ảnh, push URL vào image_branch */
router.post("/branches/:branchId/images", upload.array("images", 10), async (req, res) => {
  try {
    const { branchId } = req.params;
    const urls = (req.files || []).map(f => f.path);
    if (!urls.length) return res.status(400).json({ error: "No files" });

    const updated = await Branch.findByIdAndUpdate(
      branchId,
      { $push: { image_branch: { $each: urls } } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Branch not found" });
    res.json({ success: true, data: updated });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
// DELETE /api/admin/branches/:branchId/images?url=<encodedUrl>
router.delete("/branches/:branchId/images", async (req, res) => {
  try {
    const { branchId } = req.params;
    const url = decodeURIComponent(req.query.url || ""); // 🩵 GIẢI MÃ lại URL

    if (!branchId) return res.status(400).json({ error: "Thiếu branchId" });
    if (!url) return res.status(400).json({ error: "Thiếu URL ảnh" });

    const updated = await Branch.findByIdAndUpdate(
      branchId,
      { $pull: { image_branch: url } },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ error: "Không tìm thấy chi nhánh" });

    res.json({ success: true, data: updated });
  } catch (e) {
    console.error("DELETE /branches/:branchId/images error:", e);
    res.status(500).json({ error: e.message });
  }
});
export default router;
