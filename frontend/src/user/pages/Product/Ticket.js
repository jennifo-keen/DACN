import React, { useState, useEffect } from "react";
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
  
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 10;

  useEffect(() => {
    const hasReloaded = sessionStorage.getItem('ticketPageReloaded');
    
    if (!hasReloaded) {
      sessionStorage.setItem('ticketPageReloaded', 'true');
      window.location.reload();
    }
    
    return () => {
      sessionStorage.removeItem('ticketPageReloaded');
    };
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
        const response = await fetch(`http://localhost:4000/api/ticketType/${id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        if (data.success) {
          setTickets(data.tickets);
        } else {
          console.error("Không tìm thấy vé:", data.message);
        }
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
  const totalPages = Math.ceil(tickets.length / ticketsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const formatDate = (date) => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isTomorrow = (date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.toDateString() === tomorrow.toDateString();
  };

  const updateDateInURL = (newDate) => {
    const params = new URLSearchParams(window.location.search);
    const formattedDate = formatDateForURL(newDate);
    params.set('usingDate', formattedDate);
  
    navigate(`${window.location.pathname}?${params.toString()}`, { 
      replace: true,
      state: state 
    });
    
    setSelectedDate(newDate);
  };

  const formatDateForURL = (date) => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="ticketpage">
      {loading ? (
        <Loading />
      ) : (
        <>
          {/* Thông tin chi nhánh */}
          <div className="ticketpage__header">
            <CurrentPage current={state?.branchName || "Chi tiết vé"} />
            <h2>{state?.branchName}</h2>
          </div>

          {selectedDate && (
            <div className="date-selector">
              <button 
                className={`date-btn ${isToday(selectedDate) ? 'active' : ''}`}
                onClick={() => {
                  setSelectedDate(new Date())
                  updateDateInURL(new Date());
                }}
              >
                Hôm nay
              </button>
              <button 
                className={`date-btn ${isTomorrow(selectedDate) ? 'active' : ''}`}
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  setSelectedDate(tomorrow);
                  updateDateInURL(tomorrow);
                }}
              > 
                Ngày mai
              </button>
              <button
                className={`date-btn ${
                  !isToday(selectedDate) && !isTomorrow(selectedDate) ? "active" : ""
                }`}
                onClick={() => {
                  updateDateInURL(initialDate);
                }}
              >
                {formatDate(initialDate)} 
              </button>
            </div>
          )}

          <div className="ticketpage__content">
            <div className="ticketpage__body">
              {currentTickets.length === 0 ? (
                <p className="no-tickets">Không có vé nào cho chi nhánh này</p>
              ) : (
                <>
                  {currentTickets.map((ticket) => (
                    <div key={ticket._id} className="ticket-card">
                      <div className="ticket-header">
                        <div className="ticket-title">
                          <h3>{ticket.ticketName}</h3>
                          <span className={`ticket-badge ${ticket.status === 'hoạt động' ? 'badge-active' : 'badge-inactive'}`}>
                            {ticket.status}
                          </span>
                        </div>
                      </div>

                      <div className="ticket-details">
                        <p className="ticket-description">{ticket.description_ticket}</p>
                      </div>

                      <div className="ticket-footer">
                        <div className="ticket-prices">
                          <div className="price-row">
                            <span className="price-label">Người lớn:</span>
                            <span className="price-amount">{ticket.priceAdult?.toLocaleString('vi-VN')} VNĐ</span>
                          </div>
                          <div className="price-row">
                            <span className="price-label">Trẻ em:</span>
                            <span className="price-amount">{ticket.priceChild?.toLocaleString('vi-VN')} VNĐ</span>
                          </div>
                        </div>
                        <div className="ticket-actions">
                          <button className="select-btn-buy">Chọn</button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {totalPages > 1 && (
                    <div className="pagination">
                      <button 
                        className="pagination-btn"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        ← Trước
                      </button>
                      
                      <div className="pagination-numbers">
                        {[...Array(totalPages)].map((_, index) => {
                          const pageNumber = index + 1;
                          if (
                            pageNumber === 1 ||
                            pageNumber === totalPages ||
                            (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                          ) {
                            return (
                              <button
                                key={pageNumber}
                                className={`pagination-number ${currentPage === pageNumber ? 'active' : ''}`}
                                onClick={() => handlePageChange(pageNumber)}
                              >
                                {pageNumber}
                              </button>
                            );
                          } else if (
                            pageNumber === currentPage - 2 ||
                            pageNumber === currentPage + 2
                          ) {
                            return <span key={pageNumber} className="pagination-dots">...</span>;
                          }
                          return null;
                        })}
                      </div>

                      <button 
                        className="pagination-btn"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Sau →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="cart-sidebar">
              <div className="cart-card">
                <h3 className="cart-header">Chi tiết đơn</h3>
                <div className="cart-empty">
                  <div className="cart-empty-icon">🛒</div>
                  <p className="cart-empty-text">Sản phẩm bạn chọn sẽ được hiển thị tại đây</p>
                </div>
                <div className="cart-total">
                  <span>Tổng tiền</span>
                  <span className="total-amount">0 vnđ</span>
                </div>
                <button className="checkout-btn">Tiếp tục</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}