import React from "react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="ft">
      <div className="ft__inner">

        {/* LEFT – logo + liên hệ */}
        <div className="ft__col ft__brand">
          <img src="/logo.png" alt="Logo" className="ft__logo" />
          <ul className="ft__contact">
            <li>
              <span className="ic ic-pin" />
              Đảo Hòn Tre, phường Vĩnh Nguyên, TP Nha Trang
            </li>
            <li>
              <span className="ic ic-mail" />
              we-care@vinwonders.com
            </li>
            <li>
              <span className="ic ic-phone" />
              Hotline: 1900 6677
            </li>
          </ul>

          {/* badge & social */}
          <div className="ft__badges">
            <div className="badge">ĐÃ THÔNG BÁO<br />BỘ CÔNG THƯƠNG</div>
          </div>
          <div className="ft__social">
            <a href="#" aria-label="Facebook" className="soc fb">f</a>
            <a href="#" aria-label="YouTube" className="soc yt">▶</a>
            <a href="#" aria-label="Instagram" className="soc ig">◎</a>
          </div>
        </div>

        {/* MIDDLE – links */}
        <div className="ft__col">
          <h4>Giới thiệu</h4>
          <span className="ft__underline" />
          <ul className="ft__links">
            <li><a href="#">Về chúng tôi</a></li>
            <li><a href="#">Thành tựu</a></li>
            <li><a href="#">Liên hệ</a></li>
            <li><a href="#">Câu hỏi thường gặp (FAQ)</a></li>
            <li><a href="#">Bản đồ trang</a></li>
            <li><a href="#">Tuyển dụng</a></li>
          </ul>

          <h4 className="mt32">Điều khoản &amp; quy định</h4>
          <span className="ft__underline" />
        </div>

        <div className="ft__col">
          <h4>Tin tức &amp; trải nghiệm</h4>
          <span className="ft__underline" />
          <ul className="ft__links">
            <li><a href="#">Tin tức VinWonders</a></li>
            <li><a href="#">Khám phá Phú Quốc</a></li>
            <li><a href="#">Khám phá Nha Trang</a></li>
            <li><a href="#">Khám phá Hội An - Đà Nẵng</a></li>
            <li><a href="#">Khám phá Hà Nội</a></li>
          </ul>

          <h4 className="mt32">Thư viện ảnh</h4>
          <span className="ft__underline" />
        </div>

        {/* RIGHT – pháp lý */}
        <div className="ft__col ft__legal">
          <div className="ft__pair">
            <h5>Số ĐKKD</h5>
            <p>4200456848 ĐK lần đầu 26/7/2006. ĐK thay đổi lần thứ 50: 3/3/2020</p>
          </div>
          <div className="ft__pair">
            <h5>Nơi cấp</h5>
            <p>Sở kế hoạch và đầu tư tỉnh Khánh Hòa</p>
          </div>
          <div className="ft__pair">
            <h5>Lĩnh vực kinh doanh</h5>
            <p>Khách sạn, biệt thự hoặc căn hộ kinh doanh dịch vụ lưu trú ngắn ngày; khu du lịch sinh thái</p>
          </div>
          <div className="ft__pair">
            <h5>Chủ tài khoản</h5>
            <p>Công ty cổ phần Vinpearl</p>
          </div>
          <div className="ft__pair">
            <h5>Tài khoản ngân hàng số</h5>
            <p>119124412488166 (VND) Ngân hàng TMCP Kỹ Thương Việt Nam (Techcombank) – Hội sở</p>
          </div>
        </div>
      </div>

      {/* NEWSLETTER */}
      <div className="ft__newsletter">
        <h4>Đăng ký nhận thông tin</h4>
        <div className="ft__subscribe">
          <input type="email" placeholder="Nhập email của quý khách tại đây" />
          <button>Đăng ký ngay</button>
        </div>
      </div>

      <div className="ft__bottom" />
    </footer>
  );
}
