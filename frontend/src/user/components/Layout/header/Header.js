// src/user/components/Header/Header.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // đọc user từ localStorage + lắng nghe thay đổi (từ tab khác)
  useEffect(() => {
    try {
      const u = localStorage.getItem("user");
      if (u) setUser(JSON.parse(u));
    } catch {}
    const onStorage = (e) => {
      if (e.key === "user") {
        setUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // khoá scroll khi mở drawer
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
  }, [drawerOpen]);

  function handleLogout() {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  }

  return (
    <>
      <header className="hd-bar">
        <div className="hd-container">
        <div className="hd-left">
          <a href="/" className="hd-logo">
            <img src="/logo.png" alt="Logo" />
          </a>

          <nav className="hd-nav">
            <a href="#about">Về Chúng Tôi</a>
            <a href="#dest">Điểm Đến</a>
            <a href="#super">Siêu Phẩm</a>
            <a href="#offer">Ưu Đãi</a>
            <a href="#wpedia">Wonderpedia</a>
            <a href="#club">VinClub</a>
          </nav>
        </div>

        <div className="hd-right">
          {/* Nút đặt vé luôn hiển thị */}
          <a className="btn-book" href="#book">Đặt vé</a>

          {/* Ngôn ngữ */}
          <div className="hd-lang">
            <img src="https://flagcdn.com/w20/vn.png" alt="VI" />
            <span>VI</span>
          </div>

          {/* --- PHẦN THAY ĐỔI THEO TRẠNG THÁI ĐĂNG NHẬP --- */}
          {!user ? (
            // Chưa đăng nhập
            <a className="btn-outline" href="/login">Đăng nhập</a>
          ) : (
            // Đã đăng nhập
            <div className="hd-auth">
              {/* giỏ hàng + badge demo */}
              <button className="hd-cart" aria-label="Giỏ hàng">
                <span className="hd-cartIcon">🛒</span>
                <span className="hd-badge">99+</span>
              </button>

              {/* user menu */}
              <div className="hd-user">
                <span className="hd-userIcon">👤</span>
                <span className="hd-userName" title={user.name}>
                  {user.name?.length > 16 ? user.name.slice(0, 16) + "…" : user.name}
                </span>
                <div className="hd-userMenu">
                  <a href="/profile">Tài khoản của tôi</a>
                  <a href="/orders">Đơn hàng</a>
                  <button onClick={handleLogout}>Đăng xuất</button>
                </div>
              </div>
            </div>
          )}

          {/* Hamburger (mobile) */}
          <button
            className="hd-burger"
            aria-label="Mở menu"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
          >
            <span /><span /><span />
          </button>
        </div>
        </div>
      </header>

      {drawerOpen && <div className="hd-backdrop" onClick={() => setDrawerOpen(false)} />}

      <aside className={`hd-drawer ${drawerOpen ? "is-open" : ""}`} aria-hidden={!drawerOpen}>
        <div className="hd-drawerHead">
          <div className="hd-lang">
            <img src="https://flagcdn.com/w20/vn.png" alt="VI" /><span>VI</span>
          </div>
          <button className="hd-close" onClick={() => setDrawerOpen(false)}>✕</button>
        </div>

        <nav className="hd-drawerNav">
          <a href="#about" onClick={() => setDrawerOpen(false)}>Về Chúng Tôi</a>
          <a href="#dest" onClick={() => setDrawerOpen(false)}>Điểm Đến</a>
          <a href="#super" onClick={() => setDrawerOpen(false)}>Siêu Phẩm</a>
          <a href="#offer" onClick={() => setDrawerOpen(false)}>Ưu Đãi</a>
          <a href="#wpedia" onClick={() => setDrawerOpen(false)}>Wonderpedia</a>
          <a href="#club" onClick={() => setDrawerOpen(false)}>VinClub</a>
        </nav>

        <div className="hd-drawerActions">
          {!user ? (
            <>
              <a className="btn-book" href="/login" onClick={() => setDrawerOpen(false)}>Đăng nhập</a>
              <a className="btn-ghost" href="/signup" onClick={() => setDrawerOpen(false)}>Đăng ký</a>
            </>
          ) : (
            <>
              <a className="btn-ghost" href="/profile" onClick={() => setDrawerOpen(false)}>Tài khoản</a>
              <button className="btn-outline" onClick={handleLogout}>Đăng xuất</button>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
