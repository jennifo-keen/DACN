import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function CheckoutResult() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState(null); // "success" | "fail"
  const [rid, setRid] = useState(null);

  useEffect(() => {
    const resultCode = searchParams.get("errorCode") || searchParams.get("resultCode"); 
    const orderId = searchParams.get("orderId");
    setRid(orderId);

    if (resultCode === "0") {
      setStatus("success");
    } else {
      setStatus("fail");
    }
  }, [searchParams]);

  const handleBack = () => {
    if (status === "success") {
      navigate("/"); // trang thành công
    } else {
      navigate(`/checkout?rid=${rid}`); // quay lại giỏ hàng
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: 50 }}>
      {status === null && <p>Đang xử lý thanh toán...</p>}
      {status === "success" && (
        <>
          <h2>🎉 Thanh toán thành công!</h2>
          <p>Cảm ơn bạn đã đặt vé. Chúng tôi sẽ gửi thông tin chi tiết về email của bạn.</p>
          <button onClick={handleBack}>Về trang chính</button>
        </>
      )}
      {status === "fail" && (
        <>
          <h2>❌ Thanh toán thất bại.</h2>
          <p>Vui lòng kiểm tra lại thông tin hoặc thử lại.</p>
          <button onClick={handleBack}>Quay lại giỏ hàng</button>
        </>
      )}
    </div>
  );
}
