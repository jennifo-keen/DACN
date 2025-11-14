import React, { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { vi } from "date-fns/locale";
import { useNavigate, useLocation, useLoaderData } from "react-router-dom";
import Loading from "../../components/Layout/loading.js";

import "./Home.css";

const slides = [
  {
    img: "/hero/slide1.jpg",
    title: "AQUAFIELD OCEAN CITY",
    sub: "Mừng khai trương ưu đãi tới 30%!",
    desc: "Ốc đảo thư giãn chuẩn Hàn giữa lòng phố thị với không gian xông hơi tương - ẩm - lạnh, phòng đá muối Himalaya, phòng tuyết…",
    cta: "Khám phá ngay",
    link: "#explore",
  },
  {
    img: "/hero/slide2.png",
    title: "KHÁM PHÁ PHÚ QUỐC",
    sub: "Combo siêu tiết kiệm",
    desc: "Vé vào cổng + trò chơi + bữa trưa – tối ưu cho gia đình.",
    cta: "Xem ưu đãi",
    link: "#deal",
  },
  {
    img: "/hero/slide3.jpg",
    title: "TRẢI NGHIỆM HỘI AN – ĐÀ NẴNG",
    sub: "Show đêm đặc sắc",
    desc: "Hòa mình vào khoảnh khắc lung linh bên sông và khu phố cổ.",
    cta: "Đặt vé",
    link: "#book",
  },
];

export default function Home() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const timer = useRef(null);

  const [isResultsVisible, setIsResultsVisible] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const resultsRef = useRef(null);

  const [selectedDate, setSelectedDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#book") {
      const element = document.querySelector(".searchCard");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target) &&
        !event.target.closest(".searchField")
      ) {
        setIsResultsVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleResults = () => {
    setIsResultsVisible(!isResultsVisible);
    setShowCalendar(false);
  };

  // ===== FETCH DATA DESTINATIONS =====
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/provincesBranches");
        const data = await response.json();

        const formattedDestinations = data.map((province) => ({
          name: province.provinceName,
          branches: province.branches,
          image: province.image,
        }));


        setDestinations(formattedDestinations);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const startAuto = () => {
    clearInterval(timer.current);
    timer.current = setInterval(() => {
      setIdx((i) => (i + 1) % slides.length);
    }, 5000);
  };

  useEffect(() => {
    startAuto();
    return () => clearInterval(timer.current);
  }, []);

  const go = (n) => {
    setIdx((i) => (i + n + slides.length) % slides.length);
    startAuto();
  };

  const s = slides[idx];

  const [per, setPer] = useState(3);
  const [iPage, setIPage] = useState(0);
  const totalPages = Math.max(1, destinations.length - per + 1);

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      const p = w < 720 ? 1 : w < 1024 ? 2 : 3;
      setPer(p);
      setIPage(0);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const nextPage = () => setIPage((p) => Math.min(p + 1, totalPages - 1));
  const prevPage = () => setIPage((p) => Math.max(p - 1, 0));

  const handleSearch = (e) => {
    if (e) e.preventDefault();

    if (!selectedBranch) {
      alert("Vui lòng chọn chi nhánh!");
      return;
    }

    if (!selectedDate) {
      alert("Vui lòng chọn ngày!");
      return;
    }

    const payload = {
      branchId: selectedBranch.branchId,
      branchName: selectedBranch.branchName,
      provinceName: selectedBranch.provinceName,
      date: selectedDate
        ? `${selectedDate.getDate().toString().padStart(2, "0")}-${(selectedDate.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${selectedDate.getFullYear()}`
        : "",
    };
    navigate(`/search?id=${payload.branchId}&usingDate=${payload.date}`, { state: payload });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="home">
      <section className="hero" style={{ backgroundImage: `url(${s.img})` }}>
        <div className="hero__overlay" />

        <div className="hero__content">
          <h1 className="hero__title">{s.title}</h1>
          <p className="hero__sub">{s.sub}</p>
          <p className="hero__desc">{s.desc}</p>
          <a href={s.link} className="btn btn--ghost">
            {s.cta}
          </a>
        </div>

        <button className="hero__arrow left" onClick={() => go(-1)} aria-label="Prev">
          ‹
        </button>
        <button className="hero__arrow right" onClick={() => go(1)} aria-label="Next">
          ›
        </button>

        <div className="hero__dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === idx ? "is-active" : ""}`}
              onClick={() => setIdx(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* SEARCH BAR */}
      <div className="searchCard" id="book">
        <div className="searchField" onClick={toggleResults}>
            <img src="/icons/local.svg" alt="Location Icon" />
          <div className="des">
            <span className="select">
              {selectedBranch
                ? `${selectedBranch.provinceName} - ${selectedBranch.branchName}`
                : "Chọn chi nhánh"}
            </span>
            <span className="ic-down">▾</span>
          </div>
        </div>

        <div
          className="searchField date-input"
          onClick={() => {
            setShowCalendar(!showCalendar);
            setIsResultsVisible(false);
          }}
        >
            <img src="/icons/date.svg" alt="Location Icon" />
          <div className="des">
            <span className="select">
              {selectedDate ? selectedDate.toLocaleDateString("vi-VN") : "Chọn ngày"}
            </span>
          </div>
        </div>

        {showCalendar && (
          <div ref={calendarRef} className="calendar-popup">
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

        <button className="btn btn--search" onClick={handleSearch}>
          Tìm kiếm
        </button>
      </div>

      {/* RESULTS FRAME */}
      <div ref={resultsRef} className={`resultsFrame ${isResultsVisible ? "active" : ""}`}>
        {destinations.length > 0 ? (
          destinations.map((province, pIndex) => (
            <div key={pIndex} className="province-group">
              <span className="province__name">{province.name}</span>

              <div className="branch__list">
                {province.branches && province.branches.length > 0 ? (
                  province.branches.map((branch, bIndex) => (
                    <div
                      key={bIndex}
                      className="branch__item"
                      onClick={() => {
                        setSelectedBranch({
                          provinceName: province.name,
                          branchName: branch.branchName,
                          branchId: branch.branchId,
                        });
                        setIsResultsVisible(false);
                      }}
                    >
                      <span className="branchName">{branch.branchName}</span>
                    </div>
                  ))
                ) : (
                  <p className="no-branches">Không có chi nhánh</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="no-data">Không có dữ liệu.</p>
        )}
      </div>

      {/* EXPERIENCE GRID */}
      <section className="experience">
        <h2 className="experience__title">TRẢI NGHIỆM VINWONDERS</h2>
        <div className="experience__grid">
          <div className="expCard">
            <img src="/exp/exp1.jpg" alt="Khám phá diệu kỳ" />
            <div className="expCard__label">KHÁM PHÁ DIỆU KỲ</div>
          </div>
          <div className="expCard">
            <img src="/exp/exp2.jpg" alt="Trải nghiệm văn hóa" />
            <div className="expCard__label">TRẢI NGHIỆM VĂN HÓA</div>
          </div>
          <div className="expCard">
            <img src="/exp/exp3.jpg" alt="Giải trí diệu kỳ" />
            <div className="expCard__label">GIẢI TRÍ DIỆU KỲ</div>
          </div>
          <div className="expCard">
            <img src="/exp/exp4.jpg" alt="Lễ hội diệu kỳ" />
            <div className="expCard__label">LỄ HỘI DIỆU KỲ</div>
          </div>
        </div>
      </section>

      {/* DESTINATIONS CAROUSEL */}
      <section className="dest">
        <h2 className="dest__title">KHÁM PHÁ CÁC ĐIỂM ĐẾN CỦA FUNWORK!</h2>

        <div className="dest__wrap">
          <button
            className="dest__arrow left"
            onClick={prevPage}
            aria-label="Prev"
            disabled={iPage === 0}
          >
            ‹
          </button>

          <div className="dest__mask">
            <div
              className="dest__viewport"
              style={{
                "--per": `${per}`,
                transform: `translateX(calc(${iPage} * -100% / var(--per)))`,
              }}
            >
              {destinations.map((d, i) => (
                <div className="dest__item" key={i}>
                  <div className="dest__pic">
                    <img src={d.image} alt={d.name} />
                  </div>
                  <h3 className="dest__name">{d.name}</h3>
                  <p className="dest__sub">{d.sub}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            className="dest__arrow right"
            onClick={nextPage}
            aria-label="Next"
            disabled={iPage >= totalPages - 1}
          >
            ›
          </button>
        </div>

        <div className="dest__dots">
          {Array.from({ length: totalPages }).map((_, k) => (
            <button
              key={k}
              className={`dot ${k === iPage ? "is-active" : ""}`}
              onClick={() => setIPage(k)}
              aria-label={`Đi tới trang ${k + 1}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
