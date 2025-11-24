import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./PaymentPage.css";

const API_BASE = "http://localhost:4000";

export default function PaymentPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [rid, setRid] = useState(null); // booking ID
  const [remainingTime, setRemainingTime] = useState(null);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(state?.totalPrice || 0);
  const [promoMessage, setPromoMessage] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("");

  // ===== TẠO BOOKING KHI VÀO TRANG =====
  useEffect(() => {
    console.log("State received in PaymentPage:", state);
    console.log("TicketItems:", state?.ticketItems);
    const createBooking = async () => {
      try {
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

        let usingDateISO = null;
        if (state?.usingDate) {
          const [day, month, year] = (state.usingDate || "").split("/");
          usingDateISO = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
        }

        const ticketsPayload = state?.ticketItems?.map(item => {
        const unitPrice = item.audienceType === "adult" ? item.priceAdult : item.priceChild;
          return {
            ticketTypeId: item.ticketTypeId,
            audienceType: item.audienceType,
            quantity: item.quantity,
            unitPrice
          };
        }) || [];

        const payload = {
          userId,
          usingDate: usingDateISO,
          totalAmount: Number(finalTotal || 0),
          paymentMethod: "pending",
          tickets: ticketsPayload
        };



        const res = await fetch(`${API_BASE}/api/bookings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (data.success) {
          setBooking(data.booking);
          setRid(data.booking._id);
        } else {
          alert(data.message || "Lỗi khi lưu booking");
        }
      } catch (err) {
        console.error("❌ Lỗi tạo booking:", err);
      }
    };

    createBooking();
  }, [state, finalTotal, navigate]);

  // ===== COUNTDOWN HẾT HẠN =====
  useEffect(() => {
    if (!booking?.expireAt) return;

    const expireTime = new Date(booking.expireAt).getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((expireTime - now) / 1000));
      setRemainingTime(diff);

      if (diff <= 0) {
        clearInterval(timer);
        handleExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [booking]);

  const handleExpire = async () => {
    if (!booking?._id) return;
    await fetch(`${API_BASE}/api/bookings/${booking._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "expired" }),
    });
    alert("Đơn hàng đã hết hạn. Vui lòng đặt lại!");
    navigate("/search");
  };

  // ===== CHỌN PHƯƠNG THỨC THANH TOÁN =====
  const handleSelectPayment = (method) => {
    setSelectedPayment(method);
  };

  // ===== THANH TOÁN =====
  const handlePayment = async () => {
    if (!selectedPayment) return alert("Vui lòng chọn phương thức thanh toán");
    if (!rid) return alert("Đang tạo đơn hàng, vui lòng chờ...");

    try {
      let res;
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      const paymentBody = { amount: finalTotal, rid };
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      if (selectedPayment === "momo") {
        res = await fetch(`${API_BASE}/api/PTTT/momo`, { method: "POST", headers, body: JSON.stringify(paymentBody) });
      } else if (selectedPayment === "vnpay") {
        res = await fetch(`${API_BASE}/api/PTTT/vnpay`, { method: "POST", headers, body: JSON.stringify(paymentBody) });
      } else if (selectedPayment === "zalopay") {
        res = await fetch(`${API_BASE}/api/PTTT/zalopay`, { method: "POST", headers, body: JSON.stringify(paymentBody) });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Không tạo được link thanh toán");

      window.location.href = data.payUrl;
    } catch (err) {
      console.error("❌ Lỗi thanh toán:", err);
      alert(err.message);
    }
  };

  // ===== ÁP DỤNG MÃ GIẢM GIÁ =====
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return alert("Vui lòng nhập mã giảm giá");

    try {
      const res = await fetch(`${API_BASE}/api/promo/check-promo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode.trim() }),
      });
      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Mã giảm giá không hợp lệ hoặc hết hạn");
        setPromoMessage("");
        return;
      }

      const discountValue = (state?.totalPrice * data.discountPercent) / 100;
      setDiscount(discountValue);
      setFinalTotal(state?.totalPrice - discountValue);
      setPromoMessage(`Áp dụng thành công! Giảm ${data.discountPercent}%`);
    } catch (err) {
      console.error(err);
      setPromoMessage("Lỗi khi áp dụng mã");
    }
  };

  const fmtMoney = (n) => n?.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
  const fmtTime = (sec) => {
    if (sec == null) return "--:--";
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="payment-page">
      <div className="payment-page__step">
        <div className="payment-page__step-item completed">
          <div className="payment-page__step-icon">01</div>
          <span>Chọn sản phẩm</span>
        </div>
        <div className="payment-page__step-item completed">
          <div className="payment-page__step-icon">02</div>
          <span>Xác nhận</span>
        </div>
        <div className="payment-page__step-item active">
          <div className="payment-page__step-icon">03</div>
          <span>Thanh toán</span>
        </div>
      </div>

      <div className="payment-page__content">
        <div className="payment-page__left">
          <div className="payment-page__ticket-card">
            <img src={state?.ticketImage} alt="ticket" className="payment-page__ticket-image" />
            <div className="payment-page__ticket-info">
              <h4>[{state?.promoTitle || "Ưu đãi 50% HSSV"}] - {state?.ticketName}</h4>
              <p className="branch">{state?.branchName}</p>
              <p className="date">📅 {state?.usingDate}</p>
              <div>
                {state?.ticketItems?.map((t, idx) => (
                  <p key={idx}>
                    {t.audienceType === "adult" ? "👤 Người lớn" : "👶 Trẻ em"} x {t.quantity}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="payment-page__right">
          <h3>Chi tiết đơn</h3>
          <div className="payment-page__order-box">
            {state?.ticketItems?.map((t, idx) => (
              <div className="payment-page__order-row" key={idx}>
                <span>{t.audienceType === "adult" ? "Người lớn" : "Trẻ em"} x {t.quantity}</span>
                <span>{fmtMoney(t.quantity * (t.audienceType === "adult" ? state?.priceAdult : state?.priceChild))}</span>
              </div>
            ))}

          <div className="payment-page__promo-section">
              <label>Mã giảm giá:</label>
              <div className="payment-page__promo-input">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Nhập mã..."
                />
                <button onClick={handleApplyPromo}>Áp dụng</button>
              </div>
              {promoMessage && <p className="payment-page__promo-message">{promoMessage}</p>}
            </div>  

            <div className="payment-page__order-row total">
              <span>Tổng tiền gốc</span>
              <span>{fmtMoney(state?.totalPrice)}</span>
            </div>

            {discount > 0 && (
              <div className="payment-page__order-row">
                <span>Giảm giá</span>
                <span className="payment-page__discount-amount">- {fmtMoney(discount)}</span>
              </div>
            )}

            <div className="payment-page__order-row total">
              <span>Thành tiền</span>
              <span className="payment-page__total-amount">{fmtMoney(finalTotal)}</span>
            </div>

            <p className="payment-page__expire">⏱ Thời gian còn lại: {fmtTime(remainingTime)}</p>
          </div>

          <div className="funword-checkout-payment">
            <p>Chọn phương thức thanh toán</p>
            <div className="checkout-payment-img">
              <div
                className={`payment-option-box ${selectedPayment === "momo" ? "payment-selected" : ""}`}
                onClick={() => handleSelectPayment("momo")}
              >
                <img src="/img/momo.png" alt="MoMo" />
              </div>
            </div>

            {selectedPayment && (
              <p style={{ marginTop: 10, color: "#28a745", fontWeight: 600 }}>
                ✓ Đã chọn: {selectedPayment.toUpperCase()}
              </p>
            )}
          </div>

          <button className="payment-page__btn-continue" onClick={handlePayment}>
            Tiếp tục thanh toán
          </button>
        </div>
      </div>
    </div>
  );
}
