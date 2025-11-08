import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/Auth";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
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
    <div style={{ 
      display: "flex", justifyContent: "center", alignItems: "center", 
      minHeight: "100vh", backgroundColor: "#f5f5f5"
    }}>
      <div style={{ 
        backgroundColor: "white", padding: "40px", borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)", width: "100%", maxWidth: "400px"
      }}>
        <h1 style={{ textAlign: "center", marginBottom: "10px" }}>
          Hệ thống khu vui chơi FunWorld
        </h1>
        <h5 style={{ textAlign: "center", color: "#666", marginBottom: "30px" }}>
          Đăng nhập
        </h5>
        
        {error && (
          <div style={{ 
            color: "red", marginBottom: "15px", padding: "10px",
            backgroundColor: "#ffe6e6", borderRadius: "4px"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid #ddd", borderRadius: "4px", padding: "10px" }}>
              <img src="/user-icon.png" alt="icon" style={{ width: "20px", marginRight: "10px" }} />
              <input 
                type="text"
                placeholder="Tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{ border: "none", outline: "none", flex: 1 }}
              />
            </div>
          </div>
          
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid #ddd", borderRadius: "4px", padding: "10px" }}>
              <img src="/lock-icon.png" alt="icon" style={{ width: "20px", marginRight: "10px" }} />
              <input 
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ border: "none", outline: "none", flex: 1 }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: "100%", padding: "12px", backgroundColor: "#007bff", 
              color: "white", border: "none", borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer", fontSize: "16px"
            }}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}
