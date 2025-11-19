import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./PaymentPage.css";

export default function PaymentPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null); // thời gian còn lại (giây)

  // 🟢 Khi load trang → tạo booking nếu chưa có
  useEffect(() => {
    const createBooking = async () => {
      try {
        // ✅ Lấy userId từ localStorage
        let userId = null;
        const authUserRaw = localStorage.getItem("authUser");
        const userRaw = localStorage.getItem("user");
        const authUser = authUserRaw ? JSON.parse(authUserRaw) : null;
        const userObj = userRaw ? JSON.parse(userRaw) : null;

        userId =
          authUser?.id ||
          authUser?._id ||
          userObj?._id ||
          userObj?.id ||
          userObj?.user?._id ||
          userObj?.user?.id ||
          null;

        if (!userId) {
          alert("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
          return navigate("/login");
        }

        // ✅ Chuyển đổi ngày sang ISO
        let usingDateISO = null;
        if (state?.usingDate) {
          const [day, month, year] = (state.usingDate || "").split("/");
          usingDateISO = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
        }

        // ✅ Gửi booking mới
        const payload = {
          userId,
          usingDate: usingDateISO,
          totalAmount: Number(state?.totalPrice || 0),
          paymentMethod: "momo",
          tickets: [
            {
              branchId: state?.branchId,
              ticketTypeId: state?.ticketId,
              quantityAdult: state?.adultCount,
              quantityChild: state?.childCount,
              priceAdult: state?.priceAdult,
              priceChild: state?.priceChild,
              totalPrice: state?.totalPrice,
            },
          ],
        };

        const res = await fetch("http://localhost:4000/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        console.log("📦 Booking Response:", data);

        if (data.success) {
          setBooking(data.booking);
        } else {
          alert(data.message || "Lỗi khi lưu booking");
        }
      } catch (err) {
        console.error("❌ Lỗi tạo booking:", err);
      }
    };

    createBooking();
  }, [state, navigate]);

  // 🕒 Cập nhật đếm ngược dựa trên expireAt từ DB
  useEffect(() => {
    if (!booking?.expireAt) return;

    const expireTime = new Date(booking.expireAt).getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((expireTime - now) / 1000)); // giây còn lại
      setRemainingTime(diff);

      if (diff <= 0) {
        clearInterval(timer);
        handleExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [booking]);

  // 🧨 Khi hết hạn
  const handleExpire = async () => {
    if (!booking?._id) return;
    await fetch(`http://localhost:4000/api/bookings/${booking._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "expired" }),
    });
    alert("Đơn hàng đã hết hạn. Vui lòng đặt lại!");
    navigate("/search");
  };

  // 💳 Khi thanh toán
  const handlePayment = async () => {
    if (!booking?._id) return;
    await fetch(`http://localhost:4000/api/bookings/${booking._id}/pay`, {
      method: "PUT",
    });
    alert("Thanh toán thành công!");
    navigate("/user/history");
  };

  // 🧮 Format tiền & thời gian
  const fmtMoney = (n) =>
    n?.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const fmtTime = (sec) => {
    if (sec == null) return "--:--";
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="payment-page">
      <div className="payment-container">
        {/* BÊN TRÁI */}
        <div className="payment-left">
          <h3>Thông tin vé</h3>
          <img src={state?.ticketImage} alt="ticket" />
          <p>{state?.ticketName}</p>
          <p>{state?.branchName}</p>
          <p>Ngày sử dụng: {state?.usingDate}</p>
          <p>
            {state?.adultCount} Người lớn – {state?.childCount} Trẻ em
          </p>
        </div>

        {/* BÊN PHẢI */}
        <div className="payment-right">
          <h3>Chi tiết thanh toán</h3>
          <p>Tổng tiền: {fmtMoney(state?.totalPrice)}</p>
          <p style={{ color: "#d9534f", fontWeight: 600 }}>
            Thời gian còn lại: {fmtTime(remainingTime)}
          </p>
          <button className="btn-pay" onClick={handlePayment}>
            Thanh toán
          </button>
        </div>
      </div>
    </div>
  );
}
