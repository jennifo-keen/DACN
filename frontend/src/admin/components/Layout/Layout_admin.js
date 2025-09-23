import { Outlet } from "react-router-dom";
import Header from "./Header_admin";
import Footer from "./Footer_admin";

export default function Layout_admin() {
  return (
    <div>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
