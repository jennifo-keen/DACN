import { Route } from "react-router-dom";
import Layout from "../user/components/Layout/Layout";
import Home from "../user/pages/Home";
import About from "../user/pages/About";

export function UserRoutes() {
  return (
    <Route path="/" element={<Layout />}>
      <Route index element={<Home />} />
      <Route path="about" element={<About />} />
    </Route>
  );
}
