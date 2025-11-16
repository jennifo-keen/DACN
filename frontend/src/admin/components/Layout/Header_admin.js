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
        children: [
          { name: "Danh sách quản trị viên", link: "/admin/admin" },
          { name: "Thêm quản trị viên", link: "/admin/admin/add" },
        ],
      },
      {
        parent: "Quản lý chi nhánh",
        children: [
          { name: "Danh sách chi nhánh", link: "/admin/users/list" },
          { name: "Tạo chi nhánh mới", link: "/admin/branches" },
          { name: "Báo cáo", link: "/admin/users/report" },
        ],
      },
      {
        parent: "Quản lý người dùng",
        children: [
          { name: "Danh sách người dùng", link: "/admin/users/list" },
          { name: "Người dùng mới", link: "/admin/users/add" },
          { name: "Báo cáo", link: "/admin/users/report" },
        ],
      },
      {
        parent: "Quản lý vé",
        children: [
          { name: "Danh sách vé", link: "/admin/tickets/list" },
          { name: "Thêm", link: "/admin/tickets/add" },
          
        ],
      },
      {
        parent: "Quản lý thanh toán",
        children: [
          { name: "Cấu hình chung", link: "/admin/payments/config" },
          { name: "Bảo mật", link: "/admin/payments/security" },
          { name: "Sao lưu dữ liệu", link: "/admin/payments/backup" },
        ],
      },
      {
        parent: "Quản lý vé điện tử",
        children: [
          { name: "Cấu hình chung", link: "/admin/eticket/config" },
          { name: "Bảo mật", link: "/admin/eticket/security" },
          { name: "Sao lưu dữ liệu", link: "/admin/eticket/backup" },
        ],
      },
      {
        parent: "Quản lý khuyến mãi",
        children: [
          { name: "Cấu hình chung", link: "/admin/promo/config" },
          { name: "Bảo mật", link: "/admin/promo/security" },
          { name: "Sao lưu dữ liệu", link: "/admin/promo/backup" },
        ],
      },
      {
        parent: "Báo cáo doanh thu",
        children: [
          { name: "Báo cáo", link: "/admin/report" },
        ],
      },
    ],

    admin: [
      {
        parent: "Quản lý người dùng",
        children: [
          { name: "Danh sách người dùng", link: "/admin/users/list" },
          { name: "Người dùng mới", link: "/admin/users/add" },
        ],
      },
      {
        parent: "Báo cáo & thống kê",
        children: [
          { name: "Doanh thu", link: "/admin/report/revenue" },
          { name: "Người dùng hoạt động", link: "/admin/report/active-users" },
        ],
      },
    ],

    staff: [
      {
        parent: "Người dùng",
        children: [
          { name: "Danh sách người dùng", link: "/admin/users/list" },
        ],
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
                  <Link to={child.link}>{child.name}</Link>
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
