import { Outlet } from "react-router-dom";
import Header from "./Header_admin";
import Footer from "./Footer_admin";
import Sidebar from "./Sidebar_admin";
import "../../css/admin.css"

export default function Layout_admin() {
  return (
    <div>
      <div className="admin-layout" style={{ display: "flex" }}>
        <Sidebar />
        <div className="right-panel">
          <Header />
          <main className="content-area">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}


