import React from "react";
import "../../css/sidebar.css";
import iconAdmin from "../../../icon/icon_admin.png";
import iconLocation from "../../../icon/icon_location.png";

function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2 style={{ textAlign: "center" }}>FUNWORLD</h2>
                <div className="profile">
                    <img src={iconAdmin} className="avatar" />
                    <div>
                        <p className="name">TÊN ADMIN</p>
                    </div>
                    <div>
                        <p className="role">Cấp độ quản lý:...</p>
                    </div>
                </div>
            </div>

            <ul className="nav-menu">
                <li className="nav-item">
                    <img src={iconLocation} alt="Địa lý" className="menu-icon" />Quản lý hệ thống địa lý & khu vui chơi
                </li>

                <li className="nav-item">
                    <img src={iconLocation} alt="Địa lý" className="menu-icon" />Quản lý vé
                </li>
                <li className="nav-item">
                    <img src={iconLocation} alt="Địa lý" className="menu-icon" />Quản lý đơn đặt vé
                </li>
                <li className="nav-item">
                    <img src={iconLocation} alt="Địa lý" className="menu-icon" />Quản lý thanh toán
                </li>
                <li className="nav-item">
                    <img src={iconLocation} alt="Địa lý" className="menu-icon" />Quản lý vé điện tử
                </li>
                <li className="nav-item">
                    <img src={iconLocation} alt="Địa lý" className="menu-icon" />Quản lý khuyến mãi
                </li>
                <li className="nav-item">
                    <img src={iconLocation} alt="Địa lý" className="menu-icon" />Quản lý người dùng
                </li>
                <li className="nav-item">
                    <img src={iconLocation} alt="Địa lý" className="menu-icon" />Quản lý admin
                </li>
                <li className="nav-item">
                    <img src={iconLocation} alt="Địa lý" className="menu-icon" />Thống kê và báo cáo
                </li>

            </ul>
        </aside>
    );
}

export default Sidebar;
