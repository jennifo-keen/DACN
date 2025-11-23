import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./OrdersPage.css";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      setError("Bạn cần đăng nhập để xem đơn hàng.");
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/bookings/user/${user._id}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Không thể lấy đơn hàng.");
        setOrders(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <p className="loading">Đang tải đơn hàng...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="orders-container">
      <h2>🧾 Đơn hàng của tôi</h2>
      {orders.length === 0 ? (
        <p>Chưa có đơn hàng nào.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-info">
                <p><b>Mã đơn:</b> {order._id}</p>
                <p><b>Ngày sử dụng:</b> {new Date(order.usingDate).toLocaleDateString()}</p>
                <p><b>Tổng tiền:</b> {order.totalAmount.toLocaleString()}₫</p>
                <p><b>Trạng thái:</b> {order.status}</p>
              </div>
              <Link to={`/ticket-detail/${order._id}`} className="btn-view">
                Xem chi tiết vé
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
