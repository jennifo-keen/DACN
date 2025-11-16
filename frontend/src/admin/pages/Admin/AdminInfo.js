import React, { useState, useEffect } from "react";
import "./AdminInfo.css";
import Loading from "../../components/loading";
import { useParams } from "react-router-dom";

export default function AdminInfo() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [admin, setAdmin] = useState(null);

    useEffect(() => {
        const fetchAdmin = async () => {
            try {
                const token = localStorage.getItem("authToken"); 
                const response = await fetch(`http://localhost:4000/api/admin/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();
                if (data.success) {
                    setAdmin(data.data); 
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAdmin();
    }, [id]);

    const handleChangeInfo = async () => {
        
    }

    if (loading) return <Loading />;

    if (!admin) return <div className="admin-info-container">Không có dữ liệu admin</div>;

    return (
        <div className="admin-info-container">
            <h2>Thông tin cá nhân quản trị viên</h2>
            <div className="info-row">
                <span className="label">Tên đăng nhập:</span>
                <span>{admin.admin_login}</span>
            </div>
            <div className="info-row">
                <span className="label">Họ và tên:</span>
                <span>{admin.fullName_admin}</span>
            </div>
            <div className="info-row">
                <span className="label">Email:</span>
                <span>{admin.email}</span>
            </div>
            <div className="info-row">
                <span className="label">Số điện thoại:</span>
                <span>{admin.phone}</span>
            </div>
            <div className="info-row">
                <span className="label">Vai trò:</span>
                <span className={`badge role-badge ${admin.role}`}>
                    {admin.role}
                </span>
            </div>
            {admin.status && (
                <div className="info-row">
                    <span className="label">Trạng thái:</span>
                    <span className={`badge status-badge ${admin.status}`}>
                        {admin.status}
                    </span>
                </div>
            )}
            <div className="info-row">
                <span className="label">Ngày tạo:</span>
                <span>{new Date(admin.createdAt).toLocaleString()}</span>
            </div>
            <div className="info-row">
                <button onClick={handleChangeInfo}>
                    Chỉnh sửa
                </button>
            </div>
        </div>
    );
}
