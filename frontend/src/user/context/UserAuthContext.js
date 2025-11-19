import { createContext, useContext, useEffect, useState } from "react";

const UserAuthContext = createContext();

export function UserAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Lấy lại thông tin từ localStorage khi F5
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("authUser");
    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch {
        localStorage.removeItem("authUser");
        localStorage.removeItem("authToken");
      }
    }
    setLoading(false);
  }, []);

  // ✅ Hàm login
  const login = (userData, tokenData) => {
    localStorage.setItem("authUser", JSON.stringify(userData));
    localStorage.setItem("authToken", tokenData);
    setUser(userData);
    setToken(tokenData);
  };

  // ✅ Hàm logout
  const logout = () => {
    localStorage.removeItem("authUser");
    localStorage.removeItem("authToken");
    setUser(null);
    setToken(null);
  };

  return (
    <UserAuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  return useContext(UserAuthContext);
}
