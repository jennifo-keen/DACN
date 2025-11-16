import { Route } from "react-router-dom";

// User
import Layout from "../user/components/Layout/Layout";
import Home from "../user/pages/Home/Home";
import About from "../user/pages/About";
import Login from "../user/pages/Login/Login"
import Ticket from "../user/pages/Product/Ticket";
import TicketDetail from "../user/pages/ProductDetail/TicketDetail";
import Destination from "../user/pages/Destination/Destination"
import Profile from "../user/pages/Profile/Profile";
// Admin

export function UserRoutes() {
  return (
    <>
    <Route path="/" element={<Layout />}>
      <Route index element={<Home />} />
      <Route path="about" element={<About />} />
      <Route path="/search" element={<Ticket />} /> {/* tìm kiếm vé ở trang chủ */}
      <Route path="search/:ticketId" element={<TicketDetail />} /> 
      <Route path="/dest" element={<Destination />} />
      <Route path="/profile" element={<Profile />} />
    </Route>
    <Route path="login" element={<Login />} />
    </>
  );
}
