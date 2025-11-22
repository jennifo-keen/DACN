import express from "express";
import PromoCode from "../models/PromoCodes.js";

const router = express.Router();

router.post("/check-promo", async (req, res) => {
  try {
    const { code } = req.body;
    console.log("📩 Mã nhận từ client:", code); // 👈 thêm dòng này

    const promo = await PromoCode.findOne({ code });
    if (!promo) {
      console.log("❌ Không tìm thấy mã:", code); // 👈 thêm dòng này
      return res.status(404).json({ success: false, message: "Mã không tồn tại" });
    }

    const now = new Date();
    if (now < promo.validFrom || now > promo.validTo) {
      console.log("⚠️ Mã hết hạn:", code); // 👈 thêm dòng này
      return res.status(400).json({ success: false, message: "Mã đã hết hạn" });
    }

    res.json({
      success: true,
      discountPercent: promo.discountPercent,
      description: promo.Description_promo,
    });
  } catch (err) {
    console.error("🔥 Lỗi API:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});


export default router;
