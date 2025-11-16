import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ticket.css";
import Loading from "../../components/loading";

const AddTicketType = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState([]);
  const [zones, setZones] = useState([]);
  const [formData, setFormData] = useState({
    branchId: "",
    ticketName: "",
    description_ticket: "",
    priceAdult: "",
    priceChild: "",
    includedZones: [],
    image_tktypes: [],
    status: "hoạt động",
  });
  const [imageUrls, setImageUrls] = useState([""]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (formData.branchId) {
      fetchZones(formData.branchId);
    } else {
      setZones([]);
      setFormData((prev) => ({ ...prev, includedZones: [] }));
    }
  }, [formData.branchId]);

  const fetchBranches = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/branches");
      const data = await response.json();
      if (data.success) {
        setBranches(data.data);
      }
    } catch (err) {
      console.error("Không thể tải danh sách chi nhánh:", err);
      alert("Không thể tải danh sách chi nhánh");
    }
  };

  const fetchZones = async (branchId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/zones/${branchId}`);
      const data = await response.json();
      if (data.success) {
        setZones(data.data);
      }
    } catch (err) {
      console.error("Không thể tải danh sách khu vực:", err);
      alert("Không thể tải danh sách khu vực");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleZoneChange = (zoneId) => {
    setFormData((prev) => {
      const includedZones = prev.includedZones.includes(zoneId)
        ? prev.includedZones.filter((id) => id !== zoneId)
        : [...prev.includedZones, zoneId];
      return { ...prev, includedZones };
    });
  };

  const handleImageUrlChange = (index, value) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
    setFormData((prev) => ({
      ...prev,
      image_tktypes: newUrls.filter((url) => url.trim() !== ""),
    }));
  };

  const addImageUrlInput = () => {
    setImageUrls([...imageUrls, ""]);
  };

  const removeImageUrlInput = (index) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);
    setFormData((prev) => ({
      ...prev,
      image_tktypes: newUrls.filter((url) => url.trim() !== ""),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.branchId) newErrors.branchId = "Vui lòng chọn chi nhánh";
    if (!formData.ticketName.trim()) newErrors.ticketName = "Vui lòng nhập tên loại vé";
    if (!formData.description_ticket.trim()) newErrors.description_ticket = "Vui lòng nhập mô tả";
    if (!formData.priceAdult || formData.priceAdult <= 0) {
      newErrors.priceAdult = "Giá người lớn phải lớn hơn 0";
    }
    if (!formData.priceChild || formData.priceChild < 0) {
      newErrors.priceChild = "Giá trẻ em không được âm";
    }
    if (formData.includedZones.length === 0) {
      newErrors.includedZones = "Vui lòng chọn ít nhất một khu vực";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Vui lòng kiểm tra lại thông tin!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/ticket-types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          priceAdult: Number(formData.priceAdult),
          priceChild: Number(formData.priceChild),
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Thêm loại vé thành công!");
        navigate("/ticket-types");
      } else {
        alert(data.message || "Có lỗi xảy ra!");
      }
    } catch (err) {
      console.error(err);
      alert("Không thể kết nối đến server!");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />
  }

  return (
    <div className="ticket-form-container">
      <div className="form-header">
        <h1>Thêm Loại Vé Mới</h1>
        <button onClick={() => navigate("/ticket-types")} className="btn btn-back">
          ← Quay lại
        </button>
      </div>

      <form onSubmit={handleSubmit} className="ticket-form">
        <div className="form-group">
          <label htmlFor="branchId">
            Chi Nhánh <span className="required">*</span>
          </label>
          <select
            id="branchId"
            name="branchId"
            value={formData.branchId}
            onChange={handleInputChange}
            className={errors.branchId ? "error" : ""}
          >
            <option value="">-- Chọn chi nhánh --</option>
            {branches.map((branch) => (
              <option key={branch._id} value={branch._id}>
                {branch.branchName} - {branch.provincesName}
              </option>
            ))}
          </select>
          {errors.branchId && <span className="error-text">{errors.branchId}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="ticketName">
            Tên Loại Vé <span className="required">*</span>
          </label>
          <input
            type="text"
            id="ticketName"
            name="ticketName"
            value={formData.ticketName}
            onChange={handleInputChange}
            placeholder="Ví dụ: Vé Trọn Gói, Vé Thường..."
            className={errors.ticketName ? "error" : ""}
          />
          {errors.ticketName && <span className="error-text">{errors.ticketName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description_ticket">
            Mô Tả <span className="required">*</span>
          </label>
          <textarea
            id="description_ticket"
            name="description_ticket"
            value={formData.description_ticket}
            onChange={handleInputChange}
            placeholder="Nhập mô tả chi tiết về loại vé..."
            rows="4"
            className={errors.description_ticket ? "error" : ""}
          />
          {errors.description_ticket && (
            <span className="error-text">{errors.description_ticket}</span>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="priceAdult">
              Giá Người Lớn (VNĐ) <span className="required">*</span>
            </label>
            <input
              type="number"
              id="priceAdult"
              name="priceAdult"
              value={formData.priceAdult}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              className={errors.priceAdult ? "error" : ""}
            />
            {errors.priceAdult && <span className="error-text">{errors.priceAdult}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="priceChild">
              Giá Trẻ Em (VNĐ) <span className="required">*</span>
            </label>
            <input
              type="number"
              id="priceChild"
              name="priceChild"
              value={formData.priceChild}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              className={errors.priceChild ? "error" : ""}
            />
            {errors.priceChild && <span className="error-text">{errors.priceChild}</span>}
          </div>
        </div>

        <div className="form-group">
          <label>
            Khu Vực Bao Gồm <span className="required">*</span>
          </label>
          {!formData.branchId ? (
            <p className="info-text">Vui lòng chọn chi nhánh trước</p>
          ) : zones.length === 0 ? (
            <p className="info-text">Chi nhánh này chưa có khu vực nào</p>
          ) : (
            <div className="checkbox-group">
              {zones.map((zone) => (
                <label key={zone._id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.includedZones.includes(zone._id)}
                    onChange={() => handleZoneChange(zone._id)}
                  />
                  <span>{zone.zoneName}</span>
                  <small>{zone.description}</small>
                </label>
              ))}
            </div>
          )}
          {errors.includedZones && (
            <span className="error-text">{errors.includedZones}</span>
          )}
        </div>

        <div className="form-group">
          <label>Hình Ảnh (URL)</label>
          {imageUrls.map((url, index) => (
            <div key={index} className="image-url-input">
              <input
                type="url"
                value={url}
                onChange={(e) => handleImageUrlChange(index, e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              {imageUrls.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImageUrlInput(index)}
                  className="btn btn-remove"
                >
                  Xóa
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addImageUrlInput} className="btn btn-add-image">
            + Thêm URL Hình Ảnh
          </button>
        </div>

        <div className="form-group">
          <label htmlFor="status">Trạng Thái</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
          >
            <option value="hoạt động">Hoạt động</option>
            <option value="ngừng hoạt động">Ngừng hoạt động</option>
          </select>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate("/ticket-types")}
            className="btn btn-cancel"
          >
            Hủy
          </button>
          <button type="submit" className="btn btn-submit" disabled={loading}>
            {loading ? "Đang xử lý..." : "Thêm Loại Vé"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTicketType;