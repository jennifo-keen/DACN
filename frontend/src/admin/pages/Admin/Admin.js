import React, { useEffect, useState } from "react";
import "./Admin.css";
import { useNavigate } from "react-router-dom";

export default function Admin() {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    
    const navigate = useNavigate();

    useEffect(() => {
        getAllAdmin();
    }, []);

    const getAllAdmin = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch("http://localhost:4000/api/admin", {
                method: 'GET',
                headers: {
                    'Content-type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                setAdmins(data.data);
            } else {
                setError(data.message || "Không thể lấy dữ liệu");
            }
        } catch (e) {
            setError("Lỗi kết nối server!");
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = (admin) => {
        setSelectedAdmin(admin);
        setShowModal(true);
    };

    const handleDelete = async (adminId, adminLogin) => {
        if (!window.confirm(`Bạn có chắc muốn xóa admin "${adminLogin}"?`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:4000/api/admin/${adminId}`, {
                method: 'DELETE',
                headers: {
                    'Content-type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                alert("Xóa thành công!");
                getAllAdmin(); // Refresh danh sách
            } else {
                alert(data.message || "Xóa thất bại!");
            }
        } catch (e) {
            alert("Lỗi kết nối server!");
            console.error(e);
        }
    };

    const handleAddNew = () => {
        navigate("/admin/add"); 
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>Quản Lý Admin</h1>
                <button className="btn-add" onClick={handleAddNew}>
                    Thêm Admin Mới
                </button>
            </div>

            {loading ? (
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Đang tải dữ liệu...</p>
                </div>
            ) : (
                <>
                    <div className="table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Tên đăng nhập</th>
                                    <th>Vai trò</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {admins.length > 0 ? (
                                    admins.map((admin, index) => (
                                        <tr key={admin._id || index}>
                                            <td>{index + 1}</td>
                                            <td className="username">{admin.admin_login || admin.username}</td>
                                            <td>
                                                <span className={`role-badge ${admin.role}`}>
                                                    {admin.role === 'admin' ? 'Admin' : 'User'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${admin.status || 'active'}`}>
                                                    {admin.status === 'active' ? 'Hoạt động' : 'Khóa'}
                                                </span>
                                            </td>
                                            <td className="actions">
                                                <button 
                                                    className="btn-detail"
                                                    onClick={() => handleViewDetail(admin)}
                                                >
                                                    Xem chi tiết
                                                </button>
                                                <button 
                                                    className="btn-delete"
                                                    onClick={() => handleDelete(admin._id, admin.admin_login || admin.username)}
                                                >
                                                    Xóa
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="no-data">
                                            Không có dữ liệu
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="table-footer">
                        <p>Tổng số admin: <strong>{admins.length}</strong></p>
                    </div>
                </>
            )}

            {showModal && selectedAdmin && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Chi Tiết Admin</h2>
                            <button className="btn-close" onClick={() => setShowModal(false)}>
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-row">
                                <label>ID:</label>
                                <span>{selectedAdmin._id}</span>
                            </div>
                            <div className="detail-row">
                                <label>Tên đăng nhập:</label>
                                <span>{selectedAdmin.admin_login || selectedAdmin.username}</span>
                            </div>
                            <div className="detail-row">
                                <label>Vai trò:</label>
                                <span className={`role-badge ${selectedAdmin.role}`}>
                                    {selectedAdmin.role}
                                </span>
                            </div>
                            <div className="detail-row">
                                <label>Email:</label>
                                <span>{selectedAdmin.email || 'Chưa có'}</span>
                            </div>
                            <div className="detail-row">
                                <label>Trạng thái:</label>
                                <span className={`status-badge ${selectedAdmin.status || 'active'}`}>
                                    {selectedAdmin.status === 'active' ? 'Hoạt động' : 'Khóa'}
                                </span>
                            </div>
                            <div className="detail-row">
                                <label>Ngày tạo:</label>
                                <span>
                                    {selectedAdmin.createdAt 
                                        ? new Date(selectedAdmin.createdAt).toLocaleString('vi-VN')
                                        : 'Không rõ'
                                    }
                                </span>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-edit">Chỉnh sửa</button>
                            <button className="btn-cancel" onClick={() => setShowModal(false)}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}