import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import RouterCustom from "./router/Router";
import "./index.css";
import { AuthProvider } from "./admin/context/Auth";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <AuthProvider>
      <RouterCustom />
    </AuthProvider>
  </BrowserRouter>
);
