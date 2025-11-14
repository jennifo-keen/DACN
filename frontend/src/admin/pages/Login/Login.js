import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/Auth";
import "./Login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(username, password);
    if (result.success) navigate("/admin");
    else setError(result.error || "Đăng nhập thất bại");

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Hệ thống khu vui chơi FunWorld</h1>
        <h2>Đăng nhập</h2>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="login-form-group">
            <div className="input-wrapper">
              <img src="https://cdn-icons-png.flaticon.com/512/1077/1077114.png" alt="icon" />
              <input 
                type="text"
                placeholder="Tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="login-form-group">
            <div className="input-wrapper">
                <img src="https://cdn-icons-png.flaticon.com/512/3064/3064197.png" alt="icon" />
                <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <img
                    src={showPassword 
                        ? "https://cdn-icons-png.flaticon.com/512/159/159605.png" 
                        : "https://cdn-icons-png.flaticon.com/512/159/159604.png"}
                    alt={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    style={{ cursor: "pointer", marginLeft: "8px", width: "20px" }}
                    onClick={() => setShowPassword(!showPassword)}
                />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="login-button"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}
