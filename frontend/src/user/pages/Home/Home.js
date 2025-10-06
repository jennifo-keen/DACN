import React, { useEffect, useRef, useState } from "react";
import "./Home.css";

const slides = [
  {
    img: "/hero/slide1.jpg",
    title: "AQUAFIELD OCEAN CITY - TỔ HỢP SPA XÔNG HƠI CAO CẤP BẬC NHẤT VIỆT NAM",
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

const destinations = [
  { img: "/dest/hcm.jpg", name: "Hồ Chí Minh", sub: "Tâm điểm giải trí và lễ hội mới của thành phố" },
  { img: "/dest/na.jpg",  name: "Nghệ An",     sub: "Quần thể du lịch - giải trí lớn nhất Bắc Trung Bộ" },
  { img: "/dest/ht.jpg",  name: "Hà Tĩnh",     sub: "Thiên đường giải mát lạnh tại Bắc Trung Bộ" },
  { img: "/dest/pq.jpg",  name: "Phú Quốc",    sub: "Thiên đường biển xanh và công viên chủ đề" },
  { img: "/dest/nt.jpg",  name: "Nha Trang",   sub: "Đa trải nghiệm giải trí - nghỉ dưỡng" },
  { img: "/dest/ha.jpg",  name: "Hội An",      sub: "Sắc màu phố cổ & show đêm đặc sắc" },
];

export default function Home() {
  /* ================= HERO SLIDER ================= */
  const [idx, setIdx] = useState(0);
  const timer = useRef(null);

  const startAuto = () => {
    clearInterval(timer.current);
    timer.current = setInterval(() => {
      setIdx((i) => (i + 1) % slides.length);
    }, 5000);
  };

  useEffect(() => {
    startAuto();
    return () => clearInterval(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const go = (n) => {
    setIdx((i) => (i + n + slides.length) % slides.length);
    startAuto(); // bấm mũi tên xong vẫn tự chạy tiếp
  };

  const s = slides[idx];

  /* =========== DESTINATIONS CAROUSEL (trượt theo item) =========== */
  const [per, setPer] = useState(3);     // số item hiển thị
  const [iPage, setIPage] = useState(0); // vị trí dịch
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

  return (
    <div className="home">
      
      <section className="hero" style={{ backgroundImage: `url(${s.img})` }}>
        <div className="hero__overlay" />

        <div className="hero__content">
          <h1 className="hero__title">{s.title}</h1>
          <p className="hero__sub">{s.sub}</p>
          <p className="hero__desc">{s.desc}</p>
          <a href={s.link} className="btn btn--ghost">{s.cta}</a>
        </div>

        <button className="hero__arrow left" onClick={() => go(-1)} aria-label="Prev">‹</button>
        <button className="hero__arrow right" onClick={() => go(1)} aria-label="Next">›</button>

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

        {/* SEARCH BAR */}
        <div className="searchCard">
          <div className="searchField">
            <span className="ic">📍</span>
            <select defaultValue="">
              <option value="" disabled>Chọn điểm đến</option>
              <option>Phú Quốc</option>
              <option>Nha Trang</option>
              <option>Hội An - Đà Nẵng</option>
              <option>Hà Nội</option>
            </select>
          </div>

          <div className="searchField">
            <span className="ic">📅</span>
            <input type="date" />
          </div>

          <button className="btn btn--search">Tìm kiếm</button>
        </div>
      </section>

      {/* ===== EXPERIENCE GRID ===== */}
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

      {/* ===== DESTINATIONS CAROUSEL ===== */}
      <section className="dest">
        <h2 className="dest__title">KHÁM PHÁ CÁC ĐIỂM ĐẾN CỦA VINWONDERS!</h2>

        <div className="dest__wrap">
          <button
            className="dest__arrow left"
            onClick={prevPage}
            aria-label="Prev"
            disabled={iPage === 0}
          >‹</button>

          {/* MASK để canh giữa + ẩn tràn */}
          <div className="dest__mask">
            <div
              className="dest__viewport"
              style={{
                "--per": `${per}`, // CSS var phải là chuỗi
                transform: `translateX(calc(${iPage} * -100% / var(--per)))`,
              }}
            >
              {destinations.map((d, i) => (
                <div className="dest__item" key={i}>
                  <div className="dest__pic">
                    <img src={d.img} alt={d.name} />
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
          >›</button>
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
