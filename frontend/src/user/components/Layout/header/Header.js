import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import { Link } from "react-router-dom";

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [destDropdownOpen, setDestDropdownOpen] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [responsive, setResponsive] = useState(false)

  const navigate = useNavigate();

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

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
  }, [drawerOpen]);

  function handleLogout() {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  }

  useEffect(() => {
    const getProvinces = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/provinces", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (Array.isArray(data)) {
          setProvinces(data);
        } else {
          console.error("Dữ liệu trả về không đúng định dạng mảng:", data);
        }
      } catch (e) {
        console.error("Lỗi khi gọi API:", e);
      }
    };

    getProvinces();
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
  }, [drawerOpen]);

  return (
    <>
      <header className="hd-bar">
        <div className="hd-container">
          <div className="hd-left">
            <Link  href="/" className="hd-logo">
              <img src="/logo.png" alt="Logo" />
            </Link>

            <nav className="hd-nav">
              <Link  href="#about">Về Chúng Tôi</Link>

              {/* Dropdown điểm đến */}
              <div
                className="hd-dest-container"
                onMouseEnter={() => setDestDropdownOpen(true)}
                onMouseLeave={() => setDestDropdownOpen(false)}
              >
                <Link to="/dest" className="hd-nav-link has-dropdown">
                  Điểm Đến
                </Link>
                <div className="hd-destDrop"></div>
                {destDropdownOpen && (
                  <div className="hd-dest-dropdown">
                    {provinces.map((province, i) => (
                      <div key={i} className="hd-dest-column">
                        <h4>{province.provinceName}</h4>
                        {province.branches?.map((branch, j) => (
                          <Link
                            key={j}
                            to={`/dest?id=${branch.branchId}&&branchName=${branch.branchName}`}
                            className="hd-dest-item"
                          >
                            {branch.branchName}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Link href="#super">Siêu Phẩm </Link>
              <Link href="#offer">Ưu Đãi </Link>
              <Link href="#wpedia">Wonderpedia </Link>
              <Link href="#club">VinClub </Link>
            </nav>
          </div>

          <div className="hd-right">
            <Link  className="btn-book" href="#book">
              Đặt vé
            </Link>

            <div className="hd-lang">
              <img src="https://flagcdn.com/w20/vn.png" alt="VI" />
              <span>VI</span>
            </div>

            {!user ? (
              <Link  className="btn-outline" href="/login">
                Đăng nhập
              </Link>
            ) : (
              <div className="hd-auth">
                <button className="hd-cart" aria-label="Giỏ hàng">
                  <span className="hd-cartIcon">🛒</span>
                  <span className="hd-badge">99+</span>
                </button>

                <div className="hd-user">
                  <span className="hd-userIcon">👤</span>
                  <span className="hd-userName" title={user.name}>
                    {user.name?.length > 16
                      ? user.name.slice(0, 16) + "…"
                      : user.name}
                  </span>
                  <div className="hd-userMenu">
                    <Link  href="/profile">Tài khoản của tôi</Link>
                    <Link  href="/orders">Đơn hàng</Link>
                    <button onClick={handleLogout}>Đăng xuất</button>
                  </div>
                </div>
              </div>
            )}

            <button
              className="hd-burger"
              aria-label="Mở menu"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen(true)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {/* Drawer menu */}
      {drawerOpen && (
        <div className="hd-backdrop" onClick={() => setDrawerOpen(false)} />
      )}

      <aside
        className={`hd-drawer ${drawerOpen ? "is-open" : ""}`}
        aria-hidden={!drawerOpen}
      >
        <div className="hd-drawerHead">
          <div className="hd-lang">
            <img src="https://flagcdn.com/w20/vn.png" alt="VI" />
            <span>VI</span>
          </div>
          <button className="hd-close" onClick={() => setDrawerOpen(false)}>
            ✕
          </button>
        </div>

        <nav className="hd-drawerNav">
          <Link href="#about" onClick={() => setDrawerOpen(false)}>
            Về Chúng Tôi
          </Link>
          <Link href="/dest" onClick={() => setDrawerOpen(false)}>
            Điểm Đến
          </Link>
          <Link href="#super" onClick={() => setDrawerOpen(false)}>
            Siêu Phẩm
          </Link>
          <Link href="#offer" onClick={() => setDrawerOpen(false)}>
            Ưu Đãi
          </Link>
          <Link href="#wpedia" onClick={() => setDrawerOpen(false)}>
            Wonderpedia
          </Link>
          <Link href="#club" onClick={() => setDrawerOpen(false)}>
            VinClub
          </Link>
        </nav>

        <div className="hd-drawerActions">
          {!user ? (
            <>
              <Link 
                className="btn-book"
                href="/login"
                onClick={() => setDrawerOpen(false)}
              >
                Đăng nhập
              </Link>
              <Link 
                className="btn-ghost"
                href="/signup"
                onClick={() => setDrawerOpen(false)}
              >
                Đăng ký
              </Link>
            </>
          ) : (
            <>
              <Link 
                className="btn-ghost"
                href="/profile"
                onClick={() => setDrawerOpen(false)}
              >
                Tài khoản
              </Link>
              <button className="btn-outline" onClick={handleLogout}>
                Đăng xuất
              </button>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
