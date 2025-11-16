import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/loading";
import "./ticket.css";

const TicketTypeList = () => {
  const navigate = useNavigate();
  const [ticketTypes, setTicketTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  const fetchTicketTypes = async (search = "") => {
    try {
      setLoading(true);
      const url = search 
        ? `http://localhost:4000/api/ticket-types?search=${encodeURIComponent(search)}`
        : `http://localhost:4000/api/ticket-types`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setTicketTypes(data.data);
        setError(null);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Không thể tải dữ liệu. Vui lòng thử lại!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketTypes();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTicketTypes(searchTerm);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa ticket type này?")) {
      try {
        const response = await fetch(`http://localhost:4000/api/ticket-types/${id}`, {
          method: "DELETE",
        });
        const data = await response.json();
        
        if (data.success) {
          alert("Xóa thành công!");
          fetchTicketTypes(searchTerm);
        } else {
          alert(data.message);
        }
      } catch (err) {
        alert("Có lỗi xảy ra khi xóa!");
        console.error(err);
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="ticket-container">
      <div className="ticket-header">
        <h1>Quản Lý Loại Vé</h1>
        
        <div className="search-add-section">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Tìm theo tên chi nhánh, khu vực, loại vé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn-timkiem">
              Tìm kiếm
            </button>
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  fetchTicketTypes("");
                }}
                className="btn btn-clear"
              >
                Xóa tìm kiếm
              </button>
            )}
          </form>
          
          <button
            onClick={() => navigate("/ticket-types/add")}
            className="btn btn-add"
          >
            + Thêm Loại Vé Mới
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {ticketTypes.length === 0 ? (
        <div className="no-data">
          {searchTerm 
            ? "Không tìm thấy kết quả phù hợp" 
            : "Chưa có loại vé nào"}
        </div>
      ) : (
        <div className="ticket-table-wrapper">
          <table className="ticket-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên Loại Vé</th>
                <th>Chi Nhánh</th>
                <th>Khu Vực Bao Gồm</th>
                <th>Giá Người Lớn</th>
                <th>Giá Trẻ Em</th>
                <th>Mô Tả</th>
                <th>Trạng Thái</th>
                <th>Hình Ảnh</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {ticketTypes.map((ticket, index) => (
                <tr key={ticket._id}>
                  <td>{index + 1}</td>
                  <td className="ticket-name">{ticket.ticketName}</td>
                  <td>
                    <div className="branch-info">
                      <strong>{ticket.branchId?.branchName || "N/A"}</strong>
                      <span className="province-name">
                        {ticket.branchId?.provincesName}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="zones-list">
                      {ticket.includedZones?.length > 0 ? (
                        ticket.includedZones.map((zone) => (
                          <span key={zone._id} className="zone-tag">
                            {zone.zoneName}
                          </span>
                        ))
                      ) : (
                        <span className="no-zone">Chưa có khu vực</span>
                      )}
                    </div>
                  </td>
                  <td className="price">{formatCurrency(ticket.priceAdult)}</td>
                  <td className="price">{formatCurrency(ticket.priceChild)}</td>
                  <td className="description">{ticket.description_ticket}</td>
                  <td>
                    <span className={`status status-${ticket.status === "hoạt động" ? "active" : "inactive"}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td>
                    {ticket.image_tktypes?.length > 0 ? (
                      <div className="image-preview">
                        <img
                          src={ticket.image_tktypes[0]}
                          alt={ticket.ticketName}
                        />
                        {ticket.image_tktypes.length > 1 && (
                          <span className="image-count">
                            +{ticket.image_tktypes.length - 1}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="no-image">Không có ảnh</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => navigate(`/ticket-types/edit/${ticket._id}`)}
                        className="btn btn-edit"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(ticket._id)}
                        className="btn btn-delete"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TicketTypeList;