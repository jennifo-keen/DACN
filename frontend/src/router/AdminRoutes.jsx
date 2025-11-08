import { Route} from "react-router-dom";
import LayoutAdmin from "../admin/components/Layout/Layout_admin";
import HomeAdmin from "../admin/pages/Home/Home_admin";
import AboutAdmin from "../admin/pages/About_admin";
import BranchesAdmin from "../admin/pages/Branch/BranchesAdmin";
import Login from "../admin/pages/Login/Login";

export function AdminRoutes() {
  return (
    <>
    <Route path="/admin/login" element={<Login />} /> 
      <Route path="/admin" element={<LayoutAdmin />}>
        <Route index element={<HomeAdmin />} />
        <Route path="about" element={<AboutAdmin />} />
        <Route path="branches" element={<BranchesAdmin />} />
      </Route>
    </>
  );
}
