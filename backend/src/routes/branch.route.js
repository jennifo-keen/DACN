import { Router } from "express";
import { Branch } from "../models/Branch.js";

const router = Router();

/** GET /api/branches — danh sách */
router.get("/branches", async (_req, res) => {
  const docs = await Branch.find().sort({ createdAt: -1 });
  res.json(docs);
});

/** POST /api/branches — tạo branch mới (chưa có ảnh) */
router.post("/branches", async (req, res) => {
  const { provincesId, branchName, description_branch } = req.body;
  if (!branchName) return res.status(400).json({ error: "branchName is required" });
  const doc = await Branch.create({
    provincesId: provincesId || null,
    branchName,
    description_branch: description_branch || "",
    image_branch: [],
  });
  res.json(doc);
});

/** GET /api/branches/:id — chi tiết 1 branch */
router.get("/branches/:id", async (req, res) => {
  const doc = await Branch.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: "Not found" });
  res.json(doc);
});

export default router;
