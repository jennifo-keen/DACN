import { Route} from "react-router-dom";
import LayoutAdmin from "../admin/components/Layout/Layout_admin";
import HomeAdmin from "../admin/pages/Home/Home_admin";
import AboutAdmin from "../admin/pages/About_admin";
import BranchesAdmin from "../admin/pages/Branch/BranchesAdmin";
import Login from "../admin/pages/Login/Login";
import Report from "../admin/pages/Report/Report"
import List from "../admin/pages/Ticket/ticket_list"
import Add from "../admin/pages/Ticket/ticket_add"
import CreateAdmin from "../admin/pages/Admin/CreateAdmin";
import Admin from "../admin/pages/Admin/Admin";
import AdminInfo from "../admin/pages/Admin/AdminInfo";

export function AdminRoutes() {
  return (
    <>
    <Route path="/admin/login" element={<Login />} /> 
      <Route path="/admin" element={<LayoutAdmin />}>
        <Route index element={<HomeAdmin />} />
        <Route path="admin" element={<Admin />} />
        <Route path="admin/add" element={<CreateAdmin />} />
        <Route path="info/:id" element={<AdminInfo />} />
        <Route path="about" element={<AboutAdmin />} />
        <Route path="branches" element={<BranchesAdmin />} />
        <Route path="report" element={<Report />} />
        <Route path="tickets/list" element={<List />} />
        <Route path="tickets/add" element={<Add />} />
      </Route>
    </>
  );
}
