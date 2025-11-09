import { Router } from "express";
import { Province } from "../models/Province.js";
import { Branch } from "../models/Branch.js";

const router = Router();

router.get("/provincesBranches", async (_req, res) => {
  try {
    const provinces = await Province.find({});

    const searchs = await Promise.all(
      provinces.map(async (province) => {
        // Tìm các chi nhánh thuộc tỉnh đó
        const branches = await Branch.find({ provincesId: province._id });

        return {
          id: province._id,
          provinceName: province.provinceName,
          description: province.description || "",
          // ✅ Lấy ảnh từ bảng provinces
          image:
            Array.isArray(province.image_province) && province.image_province.length > 0
              ? province.image_province[0]
              : null,
          // ✅ Giữ nguyên danh sách chi nhánh
          branches: branches.map((branch) => ({
            branchId: branch._id,
            branchName: branch.branchName,
            description_branch: branch.description_branch || "",
          })),
        };
      })
    );

    res.json(searchs);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy dữ liệu tỉnh và chi tiết", error: error.message });
  }
});

export default router;
