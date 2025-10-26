import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./currentPage.css";

export default function CurrentPage({ current }) {
  return (
    <div className="currentpage">
      <Link to="/" className="currentpage__link">Trang chủ</Link>
      <span className="currentpage__sep">›</span>
      <span className="currentpage__current">{current}</span>
    </div>
  );
}
