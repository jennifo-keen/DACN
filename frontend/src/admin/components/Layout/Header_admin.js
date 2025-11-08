import React, { useState } from "react";
import "./Header.css";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/Auth";

export default function Header() {
  const [openNav, setOpenNav] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const id = user._id;

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const menuByRole = {
    superadmin: [
      {
        parent: "Quản lý quản trị viên",
        children: ["Danh sách quản trị viên", "Thêm quản trị viên", "Phân quyền"],
      },
      {
        parent: "Quản lý người dùng",
        children: ["Danh sách người dùng", "Người dùng mới", "Báo cáo"],
      },
      {
        parent: "Quản lý vé",
        children: ["Cấu hình chung", "Bảo mật", "Sao lưu dữ liệu"],
      },
      {
        parent: "Quản lý thanh toán",
        children: ["Cấu hình chung", "Bảo mật", "Sao lưu dữ liệu"],
      },
      {
        parent: "Quản lý vé điện tử",
        children: ["Cấu hình chung", "Bảo mật", "Sao lưu dữ liệu"],
      },
      {
        parent: "Quản lý khuyến mãi",
        children: ["Cấu hình chung", "Bảo mật", "Sao lưu dữ liệu"],
      },
      {
        parent: "Thống kê và báo cáo",
        children: ["Cấu hình chung", "Bảo mật", "Sao lưu dữ liệu"],
      },
      {
        parent: "Quản lý khuyến mãi",
        children: ["Cấu hình chung", "Bảo mật", "Sao lưu dữ liệu"],
      },
    ],
    admin: [
      {
        parent: "Quản lý người dùng",
        children: ["Danh sách người dùng", "Người dùng mới"],
      },
      {
        parent: "Báo cáo & thống kê",
        children: ["Doanh thu", "Người dùng hoạt động"],
      },
    ],
    staff: [
      {
        parent: "Người dùng",
        children: ["Danh sách người dùng"],
      },
    ],
  };

  const currentMenu = user ? menuByRole[user.role] || [] : [];

  const toggleNav = (index) => {
    setOpenNav(openNav === index ? null : index);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h4>FunWorld</h4>
      </div>

      <nav className="navigation">
        {currentMenu.map((item, index) => (
          <div key={index} className="nav-parent">
            <div className="nav-parent-title" onClick={() => toggleNav(index)}>
              <span>{item.parent}</span>
              <span className={`arrow ${openNav === index ? "open" : ""}`}>▼</span>
            </div>

            <ul className={`nav-children ${openNav === index ? "open" : ""}`}>
              {item.children.map((child, childIndex) => (
                <li key={childIndex} className="nav-child-item">
                  <a href="#">{child}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="user-section">
        <Link className="user-info" to={`/admin/info/${id}`}>
          {user ? (
            <span className="user-name">
              Vai trò: {user.role} <br />
              Admin: {user.fullName_admin}
            </span>
          ) : (
            <span className="user-name">Đang tải...</span>
          )}
        </Link>

        <button
          onClick={handleLogout}
          style={{
            marginTop: "10px",
            backgroundColor: "#e74c3c",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "5px",
            cursor: "pointer",
            width: "200px",
          }}
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
