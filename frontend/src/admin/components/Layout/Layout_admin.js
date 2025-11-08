import { Outlet, Navigate } from "react-router-dom";
import Header from "./Header_admin";
import { useAuth } from "../../context/Auth";
import Loading from "../loading";

export default function Layout_admin() {
  const { isLoggedIn, loading } = useAuth();

  if (loading) return <Loading />;
  if (!isLoggedIn) return <Navigate to="/admin/login" replace />;

  return (
    <div>
      <Header />
      <main style={{ padding: "20px" }}>
        <Outlet />
      </main>
    </div>
  );
}
