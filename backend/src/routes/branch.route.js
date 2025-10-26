import { Router } from "express";
import { Branch } from "../models/Branch.js";

const router = Router();


router.get("/branches", async (_req, res) => {
  const docs = await Branch.find().sort({ createdAt: -1 });
  res.json(docs);
});

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


router.get("/branches/:id", async (req, res) => {
  try {

  }
  catch (e) {
    res.status(500).json({message: 'Lỗi server'})
  }
});

export default router;
