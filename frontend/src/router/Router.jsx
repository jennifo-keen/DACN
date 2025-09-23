import { Routes, Route } from "react-router-dom";
import { UserRoutes } from "./UserRoutes";
import { AdminRoutes } from "./AdminRoutes";
import NotFound from "../user/pages/NotFound";

export default function RouterCustom() {
  return (
    <Routes>
      {UserRoutes()}
      {AdminRoutes()}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
