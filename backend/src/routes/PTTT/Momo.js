import express from "express";
import crypto from "crypto";
import https from "https";
import jwt from "jsonwebtoken";

const momo = express.Router();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  console.log("=== AUTH CHECK ===");
  console.log("Authorization header:", authHeader);
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Không có token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);
    
    req.user = { 
      id: decoded.sub || decoded.userId || decoded.id || decoded._id 
    };
    
    console.log("req.user:", req.user);
    next();
  } catch (err) {
    console.error("Token error:", err.message);
    return res.status(401).json({ error: "Token không hợp lệ" });
  }
};
momo.post("/", verifyToken,async (req, res) => {
  try {
    const { amount, rid } = req.body; 
    if (!amount || !rid) return res.status(400).json({ error: "Thiếu amount hoặc rid" });

    // ==== Thông tin MoMo ====
    const partnerCode = "MOMO";
    const accessKey = "F8BBA842ECF85";
    const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
    const requestId = partnerCode + Date.now();
    const orderId = rid;
    const orderInfo = "Thanh toán vé Funword";
    const redirectUrl = `http://localhost:3000/checkout/result`;
    const ipnUrl = "https://mae-blastoporic-zetta.ngrok-free.dev/api/payments/momo/notify";
    const requestType = "captureWallet";

    // lấy userId từ token decode middleware
    const userId = req.user?.id;
    const extraData = JSON.stringify({ rid, userId }); 
    // ==== Tạo chữ ký ====
    const rawSignature =
      `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}` +
      `&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}` +
      `&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}` +
      `&requestId=${requestId}&requestType=${requestType}`;

    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    // ==== Request body gửi MoMo ====
    const requestBody = {
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData,
      requestType,
      signature,
      lang: "en",
    };

    console.log("--------------------REQUEST BODY----------------");
    console.log(requestBody);

    // ==== Gửi request tới MoMo test endpoint ====
    const options = {
      hostname: "test-payment.momo.vn",
      port: 443,
      path: "/v2/gateway/api/create",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(JSON.stringify(requestBody)),
      },
    };

    const request = https.request(options, (response) => {
      let data = "";
      response.on("data", (chunk) => (data += chunk));
      response.on("end", () => {
        try {
          const result = JSON.parse(data);
          if (result.payUrl) {
            res.status(200).json({ payUrl: result.payUrl });
          } else {
            res.status(400).json({ error: result.message || "Không lấy được link MoMo" });
          }
        } catch (err) {
          res.status(500).json({ error: "Lỗi phân tích dữ liệu từ MoMo" });
        }
      });
    });

    request.on("error", (e) => {
      console.error(e);
      res.status(500).json({ error: e.message });
    });

    request.write(JSON.stringify(requestBody));
    request.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default momo;
