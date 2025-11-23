import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./CheckoutResultPage.css";

export default function CheckoutResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderId = params.get("orderId");
    const amount = params.get("amount");

    const verifyPayment = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/PTTT/momo/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, amount }),
        });

        const data = await res.json();
        if (data.success) {
          setStatus("success");
          setTimeout(() => navigate("/orders"), 4000);
        } else {
          setStatus("failed");
        }
      } catch (err) {
        console.error("Verify error:", err);
        setStatus("error");
      }
    };

    verifyPayment();
  }, [location.search, navigate]);

  if (status === "loading") return <div className="payment-page">⏳ Đang xác minh thanh toán...</div>;

  return (
    <div className="payment-page">
      {status === "success" && (
        <div className="result success">
          <h2>🎉 Thanh toán thành công!</h2>
          <p>Bạn sẽ được chuyển đến trang Đơn hàng trong giây lát...</p>
          <Link className="btn" to="/orders">Xem đơn hàng</Link>
        </div>
      )}
      {status === "failed" && (
        <div className="result failed">
          <h2>❌ Thanh toán thất bại</h2>
          <p>Vui lòng thử lại hoặc liên hệ hỗ trợ.</p>
          <Link className="btn" to="/">Về trang chủ</Link>
        </div>
      )}
      {status === "error" && (
        <div className="result error">
          <h2>⚠️ Lỗi hệ thống</h2>
          <p>Không thể xác minh trạng thái thanh toán.</p>
          <Link className="btn" to="/">Thử lại</Link>
        </div>
      )}
    </div>
  );
}
