import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Header.css";

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [destDropdownOpen, setDestDropdownOpen] = useState(false);
  const [provinces, setProvinces] = useState([]);

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
        const response = await fetch("http://localhost:4000/api/provincesBranches", {
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
          setProvinces([]); 
        }
      } catch (e) {
        console.error("Lỗi khi gọi API:", e);
        setProvinces([]); 
      }
    };

    getProvinces();
  }, []);

  return (
    <>
      <header className="hd-bar">
        <div className="hd-container">
          <div className="hd-left">
            <Link to="/" className="hd-logo">
              <img src="/logo.png" alt="Logo" />
            </Link>

            <nav className="hd-nav">
              <Link to="#about">Về Chúng Tôi</Link>

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
                            to={`/dest?id=${branch.branchId}&branchName=${encodeURIComponent(branch.branchName)}`}
                            onClick={() => {
                              setDestDropdownOpen(false);
                              setDrawerOpen(false);
                            }}
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

              <Link to="#super">Siêu Phẩm</Link>
              <Link to="#offer">Ưu Đãi</Link>
              <Link to="#wpedia">Wonderpedia</Link>
              <Link to="#club">VinClub</Link>
            </nav>
          </div>

          <div className="hd-right">
            <Link className="btn-book" to="#book">
              Đặt vé
            </Link>

            <div className="hd-lang">
              <img src="https://flagcdn.com/w20/vn.png" alt="VI" />
              <span>VI</span>
            </div>

            {!user ? (
              <Link className="btn-outline" to="/login">
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
                    <Link to="/profile">Tài khoản của tôi</Link>
                    <Link to="/orders">Đơn hàng</Link>
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
          <Link to="#about" onClick={() => setDrawerOpen(false)}>
            Về Chúng Tôi
          </Link>
          <Link to="/dest" onClick={() => setDrawerOpen(false)}>
            Điểm Đến
          </Link>
          <Link to="#super" onClick={() => setDrawerOpen(false)}>
            Siêu Phẩm
          </Link>
          <Link to="#offer" onClick={() => setDrawerOpen(false)}>
            Ưu Đãi
          </Link>
          <Link to="#wpedia" onClick={() => setDrawerOpen(false)}>
            Wonderpedia
          </Link>
          <Link to="#club" onClick={() => setDrawerOpen(false)}>
            VinClub
          </Link>
        </nav>

        <div className="hd-drawerActions">
          {!user ? (
            <>
              <Link
                className="btn-book"
                to="/login"
                onClick={() => setDrawerOpen(false)}
              >
                Đăng nhập
              </Link>
              <Link
                className="btn-ghost"
                to="/signup"
                onClick={() => setDrawerOpen(false)}
              >
                Đăng ký
              </Link>
            </>
          ) : (
            <>
              <Link
                className="btn-ghost"
                to="/profile"
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