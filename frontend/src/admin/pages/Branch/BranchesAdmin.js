import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./BranchesAdmin.css";

const API_BASE = "http://localhost:4000"; // hoặc "" nếu bạn có proxy

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
        `${API_BASE}/api/admin/branches/${branchId}/images?url=${encodeURIComponent(url)}`,
        { method: "DELETE" }
      ),
  }), []);

  const fetchBranches = useCallback(async () => {
    try {
      const res = await api.listBranches();
      const data = await res.json();
      setBranches(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("fetchBranches error:", e);
    }
  }, [api]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

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

  const onChooseFiles = (branchId, e) => {
    const files = Array.from(e.target.files || []);
    const previews = files.map((f) => URL.createObjectURL(f));
    setFilesMap((prev) => ({ ...prev, [branchId]: files }));
    setPreviewMap((prev) => ({ ...prev, [branchId]: previews }));
  };

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

  // Render không dùng JSX
  return React.createElement(
    "div",
    { className: "branches-admin-wrap" },
    [
      React.createElement("h1", { key: "title" }, "Quản trị chi nhánh"),

      // Form tạo chi nhánh
      React.createElement(
        "section",
        { key: "create", className: "branches-create" },
        [
          React.createElement("h2", { key: "subtitle" }, "Thêm chi nhánh mới"),
          React.createElement("div", { key: "form", className: "branches-create-form" }, [
            React.createElement("input", {
              key: "name",
              className: "branches-input",
              placeholder: "Tên chi nhánh (bắt buộc)",
              value: newName,
              onChange: (e) => setNewName(e.target.value),
            }),
            React.createElement("textarea", {
              key: "desc",
              className: "branches-textarea",
              placeholder: "Mô tả ngắn",
              value: newDesc,
              onChange: (e) => setNewDesc(e.target.value),
            }),
            React.createElement(
              "button",
              {
                key: "createBtn",
                className: "branches-btn-primary",
                onClick: createBranch,
                disabled: loading,
              },
              loading ? "Đang tạo..." : "Tạo chi nhánh"
            ),
          ]),
        ]
      ),

      // Danh sách chi nhánh
      React.createElement(
        "section",
        { key: "list", className: "branches-list" },
        [
          React.createElement(
            "h2",
            { key: "listTitle" },
            `Danh sách chi nhánh (${branches.length})`
          ),
          React.createElement(
            "div",
            { key: "grid", className: "branches-grid" },
            branches.map((b) =>
              React.createElement(
                "div",
                { key: b._id, className: "branches-card" },
                [
                  React.createElement("div", { key: "head", className: "branches-card-head" }, [
                    React.createElement(
                      "h3",
                      { key: "bname", className: "branches-card-title" },
                      b.branchName
                    ),
                    React.createElement(
                      "p",
                      { key: "bdesc", className: "branches-card-desc" },
                      b.description_branch || "—"
                    ),
                  ]),

                  // ảnh đã lưu
                  React.createElement(
                    "div",
                    { key: "imgs", className: "branches-images-grid" },
                    (b.image_branch || []).map((url, i) =>
                      React.createElement(
                        "div",
                        { key: i, className: "branches-image-item" },
                        [
                          React.createElement("img", { key: "img", src: url, alt: "" }),
                          React.createElement(
                            "div",
                            { key: "actions", className: "branches-image-actions" },
                            [
                              React.createElement(
                                "a",
                                {
                                  key: "view",
                                  href: url,
                                  target: "_blank",
                                  rel: "noreferrer",
                                },
                                "Xem"
                              ),
                              React.createElement(
                                "button",
                                { key: "del", onClick: () => removeImage(b._id, url) },
                                "Xoá"
                              ),
                            ]
                          ),
                        ]
                      )
                    )
                  ),

                  // uploader
                  React.createElement(
                    "div",
                    { key: "uploader", className: "branches-uploader" },
                    [
                      React.createElement("input", {
                        key: "file",
                        type: "file",
                        multiple: true,
                        accept: "image/*",
                        onChange: (e) => onChooseFiles(b._id, e),
                      }),
                      (previewMap[b._id] || []).length > 0 &&
                        React.createElement(
                          "div",
                          { key: "preview", className: "branches-preview-grid" },
                          previewMap[b._id].map((src, idx) =>
                            React.createElement("img", { key: idx, src, alt: "" })
                          )
                        ),
                      React.createElement(
                        "button",
                        {
                          key: "upload",
                          className: "branches-btn-secondary",
                          onClick: () => doUploadImages(b._id),
                          disabled: !((filesMap[b._id] || []).length),
                        },
                        "Upload ảnh"
                      ),
                    ]
                  ),
                ]
              )
            )
          ),
        ]
      ),
    ]
  );
}
