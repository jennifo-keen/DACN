import { Routes, Route } from "react-router-dom";

import Layout from "./user/components/Layout/Layout";
import LayoutAdmin from "./admin/components/Layout/Layout_admin"; // import tên PascalCase
import Home from "./user/pages/Home";
import About from "./user/pages/About";
import NotFound from "./user/pages/NotFound";

import HomeAdmin from "./admin/pages/Home_admin";
import AboutAdmin from "./admin/pages/About_admin";

export default function RouterCustom() {
  return (
    <Routes>
      {/* USER */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
      </Route>

      {/* ADMIN */}
      <Route path="/admin" element={<LayoutAdmin />}>
        <Route index element={<HomeAdmin />} />      {/* /admin */}
        <Route path="about" element={<AboutAdmin />} /> {/* /admin/about */}
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

