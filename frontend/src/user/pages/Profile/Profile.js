import React, { useState, useEffect } from 'react';
import './Profile.css';

const API_BASE = "http://localhost:4000";

const Profile = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState('');

  // ✅ Lấy thông tin user từ localStorage khi component mount
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserId(user._id);
        
        // Tách họ và tên
        const nameParts = user.name?.trim().split(' ') || [];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        setFormData({
          firstName: firstName,
          lastName: lastName,
          email: user.email || '',
          phone: user.phone || '',
        });
      } catch (error) {
        console.error('Lỗi khi parse user data:', error);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setMessage(''); // Xóa message khi user nhập liệu
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userId) {
      setMessage('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
      return;
    }

    // Validate
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setMessage('Vui lòng nhập đầy đủ họ và tên');
      return;
    }

    if (!formData.phone.match(/^0\d{9}$/)) {
      setMessage('Số điện thoại không hợp lệ (phải có 10 chữ số, bắt đầu bằng 0)');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      
      const res = await fetch(`${API_BASE}/auth/update-profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email: formData.email,
          phone: formData.phone,
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data?.error || 'Cập nhật thất bại');
        return;
      }

      // ✅ Cập nhật localStorage với dữ liệu mới từ server
      localStorage.setItem('user', JSON.stringify(data));
      setMessage('✓ Cập nhật thông tin thành công!');
      
      // Tự động ẩn thông báo sau 3 giây
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error);
      setMessage('Lỗi mạng: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-circle">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
              <circle cx="30" cy="30" r="30" fill="#E0E0E0"/>
              <path d="M30 30C35.5228 30 40 25.5228 40 20C40 14.4772 35.5228 10 30 10C24.4772 10 20 14.4772 20 20C20 25.5228 24.4772 30 30 30Z" fill="#BDBDBD"/>
              <path d="M10 50C10 39.5066 18.5066 31 29 31H31C41.4934 31 50 39.5066 50 50V50H10V50Z" fill="#BDBDBD"/>
            </svg>
          </div>
          <h2 className="profile-name">
            {formData.firstName && formData.lastName 
              ? `${formData.firstName} ${formData.lastName}`.toUpperCase() 
              : 'NGƯỜI DÙNG'}
          </h2>
          <div className="profile-points">
            <span className="points-icon">🪙</span>
            <span className="points-value">0 Điểm</span>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <h3 className="section-title">Thông tin liên hệ</h3>
        
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>
                Họ <span className="required">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Phùng"
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>
                Tên đệm và tên <span className="required">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Minh Vũ"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="phungminhvu17102005@gmail.com"
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>
                Số điện thoại <span className="required">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0912345678"
                required
                disabled={loading}
              />
            </div>
          </div>

          {message && (
            <div className={`message ${message.includes('✓') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Lưu thông tin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;