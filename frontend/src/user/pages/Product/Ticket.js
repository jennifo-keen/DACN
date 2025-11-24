import React, { useState, useEffect, userInfo } from "react";
import Loading from "../../components/Layout/loading";
import CurrentPage from "../../components/Layout/CurrentPage/currentPage";
import { useNavigate, useLocation } from "react-router-dom";
import "./Ticket.css";

export default function Ticket() {
  const { state } = useLocation();
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [initialDate, setInitialDate] = useState(null);
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("user"));
  // Popup và vé được chọn
  const [showPopup, setShowPopup] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Quản lý số lượng vé
  const [ticketCounts, setTicketCounts] = useState({
    adult: 0,
    child: 0,
  });
  const [totalPrice, setTotalPrice] = useState(0);

  const updateCount = (type, delta) => {
    setTicketCounts((prev) => {
      const newCount = Math.max(0, prev[type] + delta);
      const updated = { ...prev, [type]: newCount };
      const newTotal =
        updated.adult * (selectedTicket?.priceAdult || 0) +
        updated.child * (selectedTicket?.priceChild || 0);
      setTotalPrice(newTotal);
      return updated;
    });
  };

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 10;

  useEffect(() => {
    const hasReloaded = sessionStorage.getItem("ticketPageReloaded");
    if (!hasReloaded) {
      sessionStorage.setItem("ticketPageReloaded", "true");
      window.location.reload();
    }
    return () => sessionStorage.removeItem("ticketPageReloaded");
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const usingDate = params.get("usingDate");
    if (usingDate) {
      const [day, month, year] = usingDate.split("-");
      const dateObj = new Date(year, month - 1, day);
      setSelectedDate(dateObj);
      setInitialDate(dateObj);
    } else {
      const today = new Date();
      setSelectedDate(today);
      setInitialDate(today);
    }
  }, []);

  useEffect(() => {
    const getTicketById = async () => {
      if (!state?.branchId) return;
      setLoading(true);
      try {
        const id = state.branchId;
        const res = await fetch(`http://localhost:4000/api/ticketType/${id}`);
        const data = await res.json();
        if (data.success) setTickets(data.tickets);
      } catch (e) {
        console.error("Lỗi khi tải vé:", e);
      } finally {
        setLoading(false);
      }
    };
    getTicketById();
  }, [state?.branchId]);

  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = tickets.slice(indexOfFirstTicket, indexOfLastTicket);

  const formatDate = (date) => {
    if (!date) return "";
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const isToday = (d) => d.toDateString() === new Date().toDateString();
  const isTomorrow = (d) => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    return d.toDateString() === t.toDateString();
  };

  const formatDateForURL = (date) => {
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  };

  const updateDateInURL = (newDate) => {
    const params = new URLSearchParams(window.location.search);
    params.set("usingDate", formatDateForURL(newDate));
    navigate(`${window.location.pathname}?${params.toString()}`, {
      replace: true,
      state: state,
    });
    setSelectedDate(newDate);
  };

  return (
    <div className="ticketpage">
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="ticketpage__header">
            <CurrentPage current={state?.branchName || "Chi tiết vé"} />
            <div className="header-info">
              <h2>{state?.branchName}</h2>
              {state?.address && (
                <p className="header-address">{state.address}</p>
              )}
            </div>
          </div>

          {/* Gallery ảnh chi nhánh */}
          {state?.branchImages?.length > 0 && (
            <div
              className={`ticketpage__gallery ${
                state.branchImages.length === 1 ? "single-image" : "multi-image"
              }`}
            >
              <div className="gallery-main">
                <img src={state.branchImages[0]} alt="Main Branch" />
              </div>
              {state.branchImages.length > 1 && (
                <div className="gallery-side">
                  {state.branchImages.slice(1, 3).map((img, index) => (
                    <div key={index} className="gallery-item">
                      <img src={img} alt={`Side ${index + 1}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Chọn ngày */}
          {selectedDate && (
            <div className="date-selector">
              <button
                className={`date-btn ${isToday(selectedDate) ? "active" : ""}`}
                onClick={() => updateDateInURL(new Date())}
              >
                Hôm nay
              </button>
              <button
                className={`date-btn ${
                  isTomorrow(selectedDate) ? "active" : ""
                }`}
                onClick={() => {
                  const t = new Date();
                  t.setDate(t.getDate() + 1);
                  updateDateInURL(t);
                }}
              >
                Ngày mai
              </button>
              <button
                className={`date-btn ${
                  !isToday(selectedDate) && !isTomorrow(selectedDate)
                    ? "active"
                    : ""
                }`}
                onClick={() => updateDateInURL(initialDate)}
              >
                {formatDate(initialDate)}
              </button>
            </div>
          )}

          {/* Danh sách vé */}
          <div className="ticketpage__content">
            <div className="ticketpage__body">
              {currentTickets.length === 0 ? (
                <p className="no-tickets">Không có vé nào cho chi nhánh này</p>
              ) : (
                currentTickets.map((ticket) => (
                  <div key={ticket._id} className="ticket-card">
                    <div className="ticket-header">
                      <div className="ticket-title">
                        <h3>{ticket.ticketName}</h3>
                        <span
                          className={`ticket-badge ${
                            ticket.status === "hoạt động"
                              ? "badge-active"
                              : "badge-inactive"
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </div>
                    </div>

                    <div className="ticket-details">
                      <p className="ticket-description">
                        {ticket.description_ticket}
                      </p>
                    </div>

                    <div className="ticket-footer">
                      <div className="ticket-prices">
                        <div className="price-row">
                          <span className="price-label">Người lớn:</span>
                          <span className="price-amount">
                            {ticket.priceAdult?.toLocaleString("vi-VN")} VNĐ
                          </span>
                        </div>
                        <div className="price-row">
                          <span className="price-label">Trẻ em:</span>
                          <span className="price-amount">
                            {ticket.priceChild?.toLocaleString("vi-VN")} VNĐ
                          </span>
                        </div>
                      </div>

                      <div
                        className="ticket-actions"
                        style={{ display: "flex", gap: "20px" }}
                      >
                        <button
                          className="select-btn-details"
                          onClick={() => {
                            const currentParams = window.location.search;
                            navigate(`/search/${ticket._id}${currentParams}`, {
                              state,
                            });
                          }}
                        >
                          Chi tiết vé
                        </button>
                        <button
                          className="select-btn-buy"
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setTicketCounts({ adult: 0, child: 0 });
                            setTotalPrice(0);
                            setShowPopup(true);
                          }}
                        >
                          Chọn
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Popup chọn vé */}
      {showPopup && selectedTicket && (
        <>
          <div
            className="ticket-popup-overlay"
            onClick={() => setShowPopup(false)}
          ></div>
          <div className="ticket-popup">
            <div className="popup-header">
              <h3>
                [{state?.branchName}] - {selectedTicket.ticketName}
              </h3>
              <button
                className="popup-close"
                onClick={() => setShowPopup(false)}
              >
                ×
              </button>
            </div>

            <div className="popup-body">
              <div className="popup-body-header">
                <img
                  src="icons/users.svg"
                  alt="Ticket Icon"
                  className="popup-ticket-icon"
                />
                <h4>Số lượng mua</h4>
              </div>

              {/* Người lớn */}
              <div className="popup-item">
                <div className="popup-info">
                  <span className="popup-label">
                    <img
                      src="icons/adult.svg"
                      alt="Adult Icon"
                      className="popup-adult-icon"
                    />
                    <p>Người lớn</p>
                  </span>
                  <small>Cao từ 140cm</small>
                </div>
                <span className="popup-price">
                  {selectedTicket.priceAdult?.toLocaleString("vi-VN")} vnđ
                </span>
                <div className="popup-counter">
                  <button onClick={() => updateCount("adult", -1)}>-</button>
                  <span>{ticketCounts.adult}</span>
                  <button onClick={() => updateCount("adult", 1)}>+</button>
                </div>
              </div>

              {/* Trẻ em */}
              <div className="popup-item">
                <div className="popup-info">
                  <span className="popup-label">
                    <img
                      src="icons/baby.svg"
                      alt="Child Icon"
                      className="popup-adult-icon"
                    />
                    <p>Trẻ em</p>
                  </span>
                  <small>Cao từ 0 - 139cm</small>
                </div>
                <span className="popup-price">
                  {selectedTicket.priceChild?.toLocaleString("vi-VN")} vnđ
                </span>
                <div className="popup-counter">
                  <button onClick={() => updateCount("child", -1)}>-</button>
                  <span>{ticketCounts.child}</span>
                  <button onClick={() => updateCount("child", 1)}>+</button>
                </div>
              </div>
            </div>

            <div className="popup-footer">
              <span className="popup-total">
                {totalPrice.toLocaleString("vi-VN")} vnđ
              </span>
                <button
                className="popup-btn-buy"
                onClick={() => {
                  // Chỉ lấy những loại có quantity > 0
                  const ticketItems = [];
                  if (ticketCounts.adult > 0) {
                    ticketItems.push({
                      ticketTypeId: selectedTicket._id,
                      audienceType: "adult",
                      quantity: ticketCounts.adult,
                      priceAdult: selectedTicket.priceAdult,
                    });
                  }
                  if (ticketCounts.child > 0) {
                    ticketItems.push({
                      ticketTypeId: selectedTicket._id,
                      audienceType: "child",
                      quantity: ticketCounts.child,
                      priceChild: selectedTicket.priceChild,
                    });
                  }

                  if (ticketItems.length === 0) {
                    alert("Vui lòng chọn ít nhất 1 vé");
                    return;
                  }

                  setShowPopup(false);
                  navigate("/payment", {
                    state: {
                      userId: userInfo?._id,
                      usingDate: formatDate(selectedDate),
                      branchName: state.branchName,
                      ticketItems, // Đây là mảng chuẩn gửi lên BE
                      ticketName: selectedTicket.ticketName,
                      ticketImage: state.branchImages[0],
                      totalPrice, // vẫn giữ cho hiển thị FE
                    },
                  });
                }}
              >
                Đặt ngay
              </button>

            </div>
          </div>
        </>
      )}
    </div>
  );
}
