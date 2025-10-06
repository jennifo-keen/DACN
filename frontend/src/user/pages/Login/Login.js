import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const API_BASE = "http://localhost:4000"; // backend của bạn

export default function LoginPage() {
  const navigate = useNavigate(); // 🧭 hook điều hướng

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("login");
  const [agree, setAgree] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    try {
      const u = localStorage.getItem("user");
      if (u) setUser(JSON.parse(u));
    } catch {}
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    if (!agree) {
      setMsg("Vui lòng đồng ý điều khoản trước khi tiếp tục.");
      return;
    }
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch(`${API_BASE}/auth/login-plain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        // Thay vì để nguyên API message, bạn có thể custom lại:
        if (data?.error === "Invalid credentials") {
          setMsg("Email hoặc mật khẩu không chính xác");
        } else {
          setMsg(data?.error || "Đăng nhập thất bại");
        }
        setUser(null);
        return;
      }

      // ✅ Lưu thông tin user (không lưu password)
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
      setMsg("Đăng nhập thành công!");

      // ✅ Điều hướng sang trang chủ sau 0.5s
      setTimeout(() => navigate("/"), 500);
    } catch (err) {
      setMsg("Lỗi mạng: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  // giao diện giống mockup: trái ảnh – phải form
  return (
    <div className="login-wrap">
      {/* Cột trái: ảnh lớn */}
      <div
        className="login-hero"
        style={{ backgroundImage: `url('/assets/bglogin.png')` }} // nhớ thêm dấu '/'
        aria-hidden="true"
      />

      {/* Cột phải: form */}
      <div className="login-side">
        <div className="auth-card">
          <div className="brand">
            <img
              src="/logo.svg"
              alt="FUNWORLD"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          </div>

          <div className="tabs">
            <button
              className={`tab ${tab === "login" ? "active" : ""}`}
              type="button"
              onClick={() => setTab("login")}
            >
              Đăng nhập
            </button>
            <button
              className={`tab ${tab === "register" ? "active" : ""}`}
              type="button"
              onClick={() => setTab("register")}
            >
              Đăng ký
            </button>
          </div>

          {tab === "login" ? (
            <form className="form" onSubmit={handleLogin} noValidate>
              <label className="label" htmlFor="email">
                Email/Số điện thoại <span className="req">*</span>
              </label>
              <input
                id="email"
                className="input"
                type="email"
                placeholder="VD: yourname@email.com / +8490xxxxxxx"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label className="label" htmlFor="password">
                Mật khẩu <span className="req">*</span>
              </label>
              <div className="input with-addon">
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Mật khẩu"
                />
                <button
                  type="button"
                  className="addon"
                  aria-label={showPwd ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  onClick={() => setShowPwd((s) => !s)}
                >
                  {showPwd ? "Ẩn" : "Hiện"}
                </button>
              </div>

              <label className="check">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                />
                <span>
                  Tôi đồng ý cam kết với{" "}
                  <a href="/terms" target="_blank" rel="noreferrer">
                    Điều kiện Điều khoản
                  </a>{" "}
                  và{" "}
                  <a href="/privacy" target="_blank" rel="noreferrer">
                    Chính sách bảo mật
                  </a>
                </span>
              </label>

              <button className="btnlogin primary" type="submit" disabled={loading}>
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>

              {msg && <p className="msg">{msg}</p>}

              <p className="muted">
                Chưa có tài khoản?{" "}
                <button
                  type="button"
                  className="link"
                  onClick={() => setTab("register")}
                >
                  Đăng ký
                </button>
              </p>
            </form>
          ) : (
            <div className="form">
              <p className="muted">
                (Tab Đăng ký là mock UI. Khi cần mình nối API /auth/register.)
              </p>
              <button
                className="btnlogin outline"
                type="button"
                onClick={() => setTab("login")}
              >
                Quay lại Đăng nhập
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
