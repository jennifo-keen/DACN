import React, { useEffect, useMemo, useState } from "react";
import "./BranchesAdmin.css";

const API_BASE = "http://localhost:4000";

export default function BranchesAdmin() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [filesMap, setFilesMap] = useState({});
  const [previewMap, setPreviewMap] = useState({});

  const api = useMemo(() => ({
    listBranches: () => fetch(`${API_BASE}/api/branches`),
    createBranch: (payload) =>
      fetch(`${API_BASE}/api/branches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    uploadImages: (branchId, fd) =>
      fetch(`${API_BASE}/api/admin/branches/${branchId}/images`, {
        method: "POST",
        body: fd,
      }),
    deleteImage: (branchId, url) =>
      fetch(
        `${API_BASE}/api/admin/branches/${branchId}/images?url=${encodeURIComponent(
          url
        )}`,
        { method: "DELETE" }
      ),
  }), []);

  /** Lấy danh sách chi nhánh */
  const fetchBranches = async () => {
    try {
      const res = await api.listBranches();
      const data = await res.json();
      console.log("Branches response:", data);

      // 👉 Fix quan trọng: tự phát hiện kiểu trả về
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.data)
        ? data.data
        : [];

      setBranches(list);
    } catch (e) {
      console.error("fetchBranches error:", e);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  /** Tạo chi nhánh mới */
  const createBranch = async () => {
    const name = newName.trim();
    if (!name) return alert("Nhập tên chi nhánh");
    setLoading(true);
    try {
      const res = await api.createBranch({
        branchName: name,
        description_branch: newDesc.trim(),
      });
      if (!res.ok) throw new Error(await res.text());
      setNewName("");
      setNewDesc("");
      await fetchBranches();
    } catch (e) {
      console.error(e);
      alert("Tạo thất bại");
    } finally {
      setLoading(false);
    }
  };

  /** Chọn ảnh để upload */
  const onChooseFiles = (branchId, e) => {
    const files = Array.from(e.target.files || []);
    const previews = files.map((f) => URL.createObjectURL(f));
    setFilesMap((prev) => ({ ...prev, [branchId]: files }));
    setPreviewMap((prev) => ({ ...prev, [branchId]: previews }));
  };

  /** Upload ảnh lên Cloudinary */
  const doUploadImages = async (branchId) => {
    const files = filesMap[branchId] || [];
    if (!files.length) return alert("Chưa chọn ảnh");
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("images", f));
      const res = await api.uploadImages(branchId, fd);
      if (!res.ok) throw new Error(await res.text());
      (previewMap[branchId] || []).forEach((u) => URL.revokeObjectURL(u));
      setFilesMap((prev) => ({ ...prev, [branchId]: [] }));
      setPreviewMap((prev) => ({ ...prev, [branchId]: [] }));
      await fetchBranches();
      alert("Upload thành công!");
    } catch (e) {
      console.error(e);
      alert("Upload thất bại");
    }
  };

  /** Xóa ảnh khỏi chi nhánh */
  const removeImage = async (branchId, url) => {
    if (!window.confirm("Xoá ảnh này khỏi chi nhánh?")) return;
    try {
      const res = await api.deleteImage(branchId, url);
      if (!res.ok) throw new Error(await res.text());
      await fetchBranches();
    } catch (e) {
      console.error(e);
      alert("Xoá thất bại");
    }
  };

  return (
    <div className="branches-admin-wrap">
      <h1>Quản trị chi nhánh</h1>

      {/* Form tạo chi nhánh */}
      <section className="branches-create">
        <h2>Thêm chi nhánh mới</h2>
        <div className="branches-create-form">
          <input
            className="branches-input"
            placeholder="Tên chi nhánh (bắt buộc)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <textarea
            className="branches-textarea"
            placeholder="Mô tả ngắn"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
          />
          <button
            className="branches-btn-primary"
            onClick={createBranch}
            disabled={loading}
          >
            {loading ? "Đang tạo..." : "Tạo chi nhánh"}
          </button>
        </div>
      </section>

      {/* Danh sách chi nhánh */}
      <section className="branches-list">
        <h2>Danh sách chi nhánh ({branches.length})</h2>
        {branches.length === 0 ? (
          <p className="branches-empty">Chưa có chi nhánh nào</p>
        ) : (
          <div className="branches-grid">
            {branches.map((b) => (
              <div key={b._id} className="branches-card">
                <div className="branches-card-head">
                  <h3 className="branches-card-title">{b.branchName}</h3>
                  <p className="branches-card-desc">
                    {b.description_branch || "—"}
                  </p>
                </div>

                {/* Ảnh hiện có */}
                <div className="branches-images-grid">
                  {(b.image_branch || []).map((url, i) => (
                    <div key={i} className="branches-image-item">
                      <img src={url} alt="" />
                      <div className="branches-image-actions">
                        <a href={url} target="_blank" rel="noreferrer">
                          Xem
                        </a>
                        <button onClick={() => removeImage(b._id, url)}>
                          Xoá
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Upload ảnh mới */}
                <div className="branches-uploader">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => onChooseFiles(b._id, e)}
                  />
                  {(previewMap[b._id] || []).length > 0 && (
                    <div className="branches-preview-grid">
                      {previewMap[b._id].map((src, idx) => (
                        <img key={idx} src={src} alt="" />
                      ))}
                    </div>
                  )}
                  <button
                    className="branches-btn-secondary"
                    onClick={() => doUploadImages(b._id)}
                    disabled={!((filesMap[b._id] || []).length)}
                  >
                    Upload ảnh
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
