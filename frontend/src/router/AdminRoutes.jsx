import { Route } from "react-router-dom";
import LayoutAdmin from "../admin/components/Layout/Layout_admin";
import HomeAdmin from "../admin/pages/Home_admin";
import AboutAdmin from "../admin/pages/About_admin";

export function AdminRoutes() {
  return (
    <Route path="/admin" element={<LayoutAdmin />}>
      <Route index element={<HomeAdmin />} />      {/* /admin */}
      <Route path="about" element={<AboutAdmin />} /> {/* /admin/about */}
    </Route>
  );
}
