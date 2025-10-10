import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const API_BASE = "http://localhost:4000";

export default function LoginPage() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("login"); // login | register
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [agree, setAgree] = useState(false);

  // login form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // register form
  const [fullname, setFullname] = useState("");
  const [confirm, setConfirm] = useState("");
  const [phone, setPhone] = useState(""); // ✅ thêm SĐT

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) console.log("User:", JSON.parse(u));
  }, []);

  // ================= LOGIN =================
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
        if (data?.error === "Invalid credentials")
          setMsg("Email hoặc mật khẩu không chính xác");
        else setMsg(data?.error || "Đăng nhập thất bại");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data));
      setMsg("Đăng nhập thành công!");
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      setMsg("Lỗi mạng: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  // ================= REGISTER =================
  async function handleRegister(e) {
    e.preventDefault();
    if (!agree) {
      setMsg("Vui lòng đồng ý điều khoản trước khi tiếp tục.");
      return;
    }
    if (password !== confirm) {
      setMsg("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (!phone.match(/^0\d{9}$/)) {
      setMsg("Số điện thoại không hợp lệ (phải có 10 chữ số, bắt đầu bằng 0).");
      return;
    }

    setLoading(true);
    setMsg("");

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullname, email, password, phone }), 
      });
      const data = await res.json();

      if (!res.ok) {
        setMsg(data?.error || "Đăng ký thất bại");
        return;
      }

      setMsg("Đăng ký thành công! Chuyển đến trang đăng nhập...");
      setTimeout(() => setTab("login"), 1000);
    } catch (err) {
      setMsg("Lỗi mạng: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  // ================= RENDER =================
  return (
    <div className="login-wrap">
      {/* Cột trái */}
      <div
        className="login-hero"
        style={{ backgroundImage: `url('/assets/bglogin.png')` }}
        aria-hidden="true"
      />

      {/* Cột phải */}
      <div className="login-side">
        <div className="auth-card">
          <div className="brand">
            <img src="/logo.svg" alt="FUNWORLD" />
          </div>

          {/* Tabs */}
          <div className="tabs">
            <button
              className={`tab ${tab === "login" ? "active" : ""}`}
              onClick={() => {
                setMsg("");
                setTab("login");
              }}
            >
              Đăng nhập
            </button>
            <button
              className={`tab ${tab === "register" ? "active" : ""}`}
              onClick={() => {
                setMsg("");
                setTab("register");
              }}
            >
              Đăng ký
            </button>
          </div>

          {tab === "login" && (
            <form className="form" onSubmit={handleLogin} noValidate>
              <label className="label">Email/Số điện thoại *</label>
              <input
                className="input"
                type="email"
                value={email}
                placeholder="VD: yourname@email.com"
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label className="label">Mật khẩu *</label>
              <div className="input with-addon">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu"
                  required
                />
                <button
                  type="button"
                  className="addon"
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
                  Tôi đồng ý với{" "}
                  <a href="/terms" target="_blank" rel="noreferrer">
                    Điều khoản
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
          )}

          {tab === "register" && (
            <form className="form" onSubmit={handleRegister} noValidate>
              <label className="label">Họ và tên *</label>
              <input
                type="text"
                className="input"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                placeholder="Nguyễn Văn A"
                required
              />

              <label className="label">Email *</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
              />

              <label className="label">Số điện thoại *</label>
              <input
                type="tel"
                className="input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0912345678"
                required
              />

              <label className="label">Mật khẩu *</label>
              <div className="input with-addon">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  required
                />
                <button
                  type="button"
                  className="addon"
                  onClick={() => setShowPwd((s) => !s)}
                >
                  {showPwd ? "Ẩn" : "Hiện"}
                </button>
              </div>

              <label className="label">Xác nhận mật khẩu *</label>
              <input
                type="password"
                className="input"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                required
              />

              <label className="check">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                />
                <span>
                  Tôi đồng ý với{" "}
                  <a href="/terms" target="_blank" rel="noreferrer">
                    Điều khoản sử dụng
                  </a>{" "}
                  và{" "}
                  <a href="/privacy" target="_blank" rel="noreferrer">
                    Chính sách bảo mật
                  </a>
                </span>
              </label>

              <button className="btnlogin primary" type="submit" disabled={loading}>
                {loading ? "Đang đăng ký..." : "Đăng ký"}
              </button>

              {msg && <p className="msg">{msg}</p>}

              <p className="muted">
                Đã có tài khoản?{" "}
                <button
                  type="button"
                  className="link"
                  onClick={() => setTab("login")}
                >
                  Đăng nhập ngay
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
