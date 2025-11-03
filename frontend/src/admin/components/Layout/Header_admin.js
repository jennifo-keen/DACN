import React from "react";
import "../../css/header_admin.css"; // Đảm bảo bạn có file CSS riêng
import iconSearch from "../../../icon/icon_search.png"

function Header() {
  return (
    <header className="top-header">
      <div className="search-wrapper">
        <img src={iconSearch} alt="Search" className="search-icon" />
        <input type="text" placeholder="Tìm kiếm..." className="search-bar" />
      </div>

      <div className="header-icons">
        <button>🔔</button>
        <button>⚙️</button>
      </div>
    </header>
  );
}
export default Header;
