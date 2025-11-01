import "./Destination.css";
import React, { useEffect, useState, useRef } from "react";
import Loading from "../../components/Layout/loading";
import CurrentPage from "../../components/Layout/CurrentPage/currentPage";
import { useLocation, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { vi } from "date-fns/locale";

export default function Destination() {
  const [dest, setDest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [branchName, setBranchName] = useState("");
  const [idBranch, setIdBranch] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [featuredBranches, setFeaturedBranches] = useState([]); 
  const calendarRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const name = params.get("branchName");
    const id = params.get("id");
    setBranchName(name || "");
    setIdBranch(id || "");
  }, [location.search]);

  useEffect(() => {
    if (!idBranch) return;

    const getBranch = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:4000/api/branches/${idBranch}`);
        const data = await response.json();

        if (data.success) {
          setDest(data.data);
        } else {
          console.error("Lỗi dữ liệu:", data.message);
        }
      } catch (e) {
        console.error("Lỗi lấy dữ liệu chi nhánh:", e);
      } finally {
        setLoading(false);
      }
    };

    getBranch();
  }, [idBranch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        const destTime = document.querySelector(".dest-time");
        if (destTime && !destTime.contains(event.target)) {
          setShowCalendar(false);
        }
      }
    };

    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCalendar]);

  useEffect(() => {
    const getFeatured = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/branches");
        const data = await response.json();
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        const featured = shuffled.slice(0, 5);

        setFeaturedBranches(featured);
      } catch (e) {
        console.error("Lỗi lấy danh sách nổi bật:", e);
      }
    };

    getFeatured();
  }, [idBranch]);

  const handleSearch = (e) => {
    e?.preventDefault();

    if (!selectedDate) {
      alert("Vui lòng chọn ngày!");
      return;
    }

    const payload = {
      branchId: idBranch,
      branchName: dest?.branchName,
      provinceName: dest?.provinceName,
      date: selectedDate
        ? `${selectedDate.getDate().toString().padStart(2, "0")}-${(selectedDate.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${selectedDate.getFullYear()}`
        : "",
    };

    navigate(`../search?id=${payload.branchId}&usingDate=${payload.date}`, {
      state: payload,
    });
  };

  const handleBranchClick = (branch) => {
    navigate(`../dest/?id=${branch._id}&branchName=${branch.branchName}`);
    window.scrollTo(0, 0);
  };

  if (loading) return <Loading />;
  if (!dest) return null;

  return (
    <div className="dest-container">
      <div className="dest-current">
        <CurrentPage current={branchName} />
        <div>
          <h5>{dest?.branchName}</h5>
          <h3>{dest?.description_branch}</h3>
        </div>
      </div>

      <div className="dest-content">
        {Array.isArray(dest.image_branch) && dest.image_branch.length > 0 && (
          <img
            className="dest-img"
            src={dest.image_branch[0]}
            alt={dest.branchName}
          />
        )}
      </div>
      
      <div className="dest-order-wrapper">
        <div className="dest-order">
          <div className="dest-dest">
            <span>{dest?.branchName}</span>
          </div>

          <div
            className="dest-time"
            onClick={(e) => {
              e.stopPropagation();
              setShowCalendar(!showCalendar);
            }}
          >
            <span className={`select ${selectedDate ? "has-date" : ""}`}>
              {selectedDate
                ? selectedDate.toLocaleDateString("vi-VN")
                : "dd/mm/yyyy"}
            </span>
          </div>

          <button onClick={handleSearch}>Tìm kiếm</button>
        </div>

        {showCalendar && (
          <div
            ref={calendarRef}
            className="calendar-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <DatePicker
              selected={selectedDate}
              onChange={(date) => {
                setSelectedDate(date);
                setShowCalendar(false);
              }}
              inline
              dateFormat="dd/MM/yyyy"
              locale={vi}
              minDate={new Date()}
            />
          </div>
        )}
      </div>

      <div className="dest-explore">
        <h2 className="dest-explore-title">KHÁM PHÁ CÁC ĐIỂM ĐẾN KHÁC</h2>
        <div className="dest-explore-grid">
          {featuredBranches.length > 0 ? (
            featuredBranches.map((branch, index) => (
              <div 
                key={branch._id} 
                className="dest-explore-item"
                onClick={() => handleBranchClick(branch)}
              >
                <div className="dest-explore-image">
                  {branch.image_branch && branch.image_branch.length > 0 && (
                    <img 
                      src={branch.image_branch[0]} 
                      alt={branch.branchName}
                    />
                  )}
                </div>
                <h3 className="dest-explore-name">{branch.branchName}</h3>
              </div>
            ))
          ) : (
            <p className="dest-explore-empty">Không có chi nhánh nổi bật nào.</p>
          )}
        </div>
      </div>
    </div>
  );
}