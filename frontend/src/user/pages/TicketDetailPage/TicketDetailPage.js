import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./TicketDetailPage.css";

export default function TicketDetailPage() {
  const { bookingId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/bookings/${bookingId}/tickets`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Không thể lấy dữ liệu vé");
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [bookingId]);

  if (loading) return <p className="loading">Đang tải vé...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!data) return <p className="error">Không có dữ liệu vé</p>;

  return (
    <div className="ticket-detail-container">
      <h2>🎟 Chi tiết vé đặt</h2>

      <div className="booking-info">
        <p><b>Mã đơn:</b> {data.booking._id}</p>
        <p><b>Ngày sử dụng:</b> {new Date(data.booking.usingDate).toLocaleDateString()}</p>
        <p><b>Tổng tiền:</b> {data.booking.totalAmount.toLocaleString()}₫</p>
        <p><b>Trạng thái:</b> {data.booking.status}</p>
      </div>

      {data.details.map((detail, i) => (
        <div key={i} className="ticket-block">
          <h3>Vé {detail.ticketTypeId?.ticketName || "Không xác định"}</h3>
          <div className="ticket-list">
            {detail.tickets.map((t, idx) => (
              <div key={idx} className="ticket-card">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${t.qrCode}`}
                  alt="QR"
                  className="qr-img"
                />
                <p><b>Mã QR:</b> {t.qrCode}</p>
                <p>Loại vé: {t.ticketTypeId?.ticketName}</p>
                <p>Tình trạng: {t.status}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
