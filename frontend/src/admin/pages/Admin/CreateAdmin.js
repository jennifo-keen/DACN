import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/loading";
import "./CreateAdmin.css";

export default function CreateAdmin() {
    const [form, setForm] = useState({
        fullName_admin: "",
        admin_login: "",
        email: "",
        phone: "",
        password: "",
        role: "staff"
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("http://localhost:4000/api/admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Thêm admin thất bại!");
            } else {
                alert("Thêm admin thành công!");
                navigate("/admin/admin"); 
            }
        } catch (err) {
            console.error(err);
            setError("Lỗi server!");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="create-admin-container">
            <h1>Thêm Admin Mới</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Tên đầy đủ"
                    value={form.fullName_admin}
                    onChange={(e) => handleChange("fullName_admin", e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Tên đăng nhập"
                    value={form.admin_login}
                    onChange={(e) => handleChange("admin_login", e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Số điện thoại"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Mật khẩu"
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    required
                />
                <select
                    value={form.role}
                    onChange={(e) => handleChange("role", e.target.value)}
                >
                    <option value="staff">Nhân viên</option>
                    <option value="admin">Quản trị viên</option>
                    <option value="superadmin">Quản trị cấp cao</option>
                </select>
                <button type="submit">Thêm Admin</button>
            </form>
        </div>
    );
}
