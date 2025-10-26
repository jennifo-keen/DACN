import { Router } from "express";
import { Province } from "../models/Province.js";
import { Branch } from "../models/Branch.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const provinces = await Province.find({});

    const searchs = await Promise.all(
      provinces.map(async (province) => {

        const branches = await Branch.find({ provincesId: province._id });

        return {
          id: province._id,
          provinceName: province.provinceName,
          branches: branches.map((branch) => ({
            branchId: branch._id,
            branchName: branch.branchName,
            image: branch.image_branch ? branch.image_branch[0] : null,
          })),
        };
      })
    );


    res.json(searchs);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy dữ liệu tỉnh và chi tiết", error: error.message });
  }
});


export default router;