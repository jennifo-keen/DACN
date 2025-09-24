// frontend/src/user/pages/Home.js
import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:4000"; // backend của bạn

export default function Home() {
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("123123");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [user, setUser] = useState(null);

  // nếu đã từng đăng nhập, đọc lại user từ localStorage
  useEffect(() => {
    try {
      const u = localStorage.getItem("user");
      if (u) setUser(JSON.parse(u));
    } catch {}
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
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
        setMsg(data?.error || "Đăng nhập thất bại");
        setUser(null);
        return;
      }

      // lưu và hiển thị thông tin user (không có password)
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
      setMsg("Đăng nhập thành công!");
    } catch (err) {
      setMsg("Lỗi mạng: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("user");
    setUser(null);
    setMsg("Đã đăng xuất.");
  }

  // Nếu đã đăng nhập, hiển thị chào mừng + nút logout
  if (user) {
    return (
      <div style={{ padding: 12 }}>
        <h2>Xin chào, {user.name}</h2>
        <p>Email: {user.email}</p>
        <p>Role: {user.role}</p>
        <button onClick={handleLogout}>Đăng xuất</button>
        {msg && <pre>{msg}</pre>}
      </div>
    );
  }

  // Form login đơn giản
  return (
    <div style={{ padding: 12 }}>
      <h2>Đăng nhập</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email: </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Mật khẩu: </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>

      {msg && <pre>{msg}</pre>}
    </div>
  );
}
