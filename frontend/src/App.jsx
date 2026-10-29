
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const emptyForm = {
  foodId: "",
  name: "",
  category: "",
  cuisine: "",
  ingredients: "",
  price: "",
  quantity: "",
  description: "",
  imageUrl: ""
};

const money = (value) =>
  Number(value).toLocaleString("vi-VN") + " đ";

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message || `Yêu cầu thất bại (${response.status})`
    );
  }

  return data;
}

function App() {
  const [foods, setFoods] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  async function loadFoods(search = "") {
    setLoading(true);
    try {
      const query = search
        ? `?search=${encodeURIComponent(search)}`
        : "";

      const data = await apiRequest(`/api/foods${query}`);
      setFoods(data);
      setActiveSearch(search);
    } catch (error) {
      setFoods([]);
      setNotice({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFoods();
  }, []);

  function updateField(field, value) {
    setForm((old) => ({ ...old, [field]: value }));
  }

  function openAdd() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setShowForm(true);
    setNotice(null);
  }

  function openEdit(food) {
    setEditingId(food._id);
    setForm({
      foodId: food.foodId,
      name: food.name,
      category: food.category,
      cuisine: food.cuisine,
      ingredients: (food.ingredients || []).join(", "),
      price: String(food.price),
      quantity: String(food.quantity),
      description: food.description || "",
      imageUrl: food.imageUrl || ""
    });
    setShowForm(true);
    setSelected(null);
    setNotice(null);
  }

  function handleSearch(event) {
    event.preventDefault();
    setNotice(null);
    loadFoods(keyword.trim());
  }

  async function handleSave(event) {
    event.preventDefault();

    const price = Number(form.price);
    const quantity = Number(form.quantity);

    if (
      !form.foodId.trim() ||
      !form.name.trim() ||
      !form.category.trim() ||
      !form.cuisine.trim() ||
      form.price === "" ||
      form.quantity === "" ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      setNotice({
        type: "error",
        text: "Vui lòng nhập đầy đủ thông tin và giá, số lượng hợp lệ."
      });
      return;
    }

    const payload = {
      foodId: form.foodId.trim(),
      name: form.name.trim(),
      category: form.category.trim(),
      cuisine: form.cuisine.trim(),
      ingredients: form.ingredients
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      price,
      quantity,
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim()
    };

    setSaving(true);

    try {
      const isEditing = Boolean(editingId);

      await apiRequest(
        isEditing
          ? `/api/foods/${editingId}`
          : "/api/foods",
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );

      setShowForm(false);
      setEditingId(null);
      setSelected(null);
      setKeyword("");
      await loadFoods("");

      setNotice({
        type: "success",
        text: isEditing
          ? "Cập nhật món ăn thành công!"
          : "Thêm món ăn thành công!"
      });
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(food) {
    if (!window.confirm(`Bạn có chắc muốn xóa "${food.name}"?`)) {
      return;
    }

    try {
      await apiRequest(`/api/foods/${food._id}`, {
        method: "DELETE"
      });

      setSelected(null);
      if (editingId === food._id) {
        setShowForm(false);
        setEditingId(null);
      }
      await loadFoods(activeSearch);

      setNotice({
        type: "success",
        text: "Xóa món ăn thành công!"
      });
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="container">
          <h1>🍜 Quản Lý Món Ăn</h1>
          <p>Hệ thống quản lý món ăn trên nền tảng đám mây</p>
        </div>
      </header>

      <main className="container">
        <section className="toolbar">
          <div>
            <h2>Danh sách món ăn</h2>
            <p>Quản lý thực đơn và số lượng món ăn</p>
          </div>
          <button className="btn primary" onClick={openAdd}>
            + Thêm món ăn
          </button>
        </section>

        <form className="searchbar" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Tìm tên món ăn, loại món, vùng miền..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button className="btn primary" type="submit">
            Tìm kiếm
          </button>
          <button
            className="btn secondary"
            type="button"
            onClick={() => {
              setKeyword("");
              setNotice(null);
              loadFoods("");
            }}
          >
            Làm mới
          </button>
        </form>

        {notice && (
          <div className={`notice ${notice.type}`} role="status">
            {notice.text}
            <button onClick={() => setNotice(null)}>×</button>
          </div>
        )}

        {showForm && (
          <section className="panel">
            <div className="panel-heading">
              <h2>
                {editingId ? "Chỉnh sửa món ăn" : "Thêm món ăn mới"}
              </h2>
              <button
                className="close"
                onClick={() => setShowForm(false)}
                type="button"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="form-grid">
                <label>
                  Mã món ăn *
                  <input
                    required
                    value={form.foodId}
                    onChange={(e) =>
                      updateField("foodId", e.target.value)
                    }
                    placeholder="MA004"
                  />
                </label>

                <label>
                  Tên món ăn *
                  <input
                    required
                    value={form.name}
                    onChange={(e) =>
                      updateField("name", e.target.value)
                    }
                    placeholder="Bánh mì"
                  />
                </label>

                <label>
                  Loại món ăn *
                  <input
                    required
                    value={form.category}
                    onChange={(e) =>
                      updateField("category", e.target.value)
                    }
                    placeholder="Món ăn nhanh"
                  />
                </label>

                <label>
                  Ẩm thực / Vùng miền *
                  <input
                    required
                    value={form.cuisine}
                    onChange={(e) =>
                      updateField("cuisine", e.target.value)
                    }
                    placeholder="Việt Nam"
                  />
                </label>

                <label>
                  Giá bán (VNĐ) *
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={form.price}
                    onChange={(e) =>
                      updateField("price", e.target.value)
                    }
                  />
                </label>

                <label>
                  Số lượng *
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={form.quantity}
                    onChange={(e) =>
                      updateField("quantity", e.target.value)
                    }
                  />
                </label>

                <label className="full">
                  Nguyên liệu (ngăn cách bằng dấu phẩy)
                  <input
                    value={form.ingredients}
                    onChange={(e) =>
                      updateField("ingredients", e.target.value)
                    }
                    placeholder="Bánh mì, Thịt, Rau"
                  />
                </label>

                <label className="full">
                  Mô tả
                  <textarea
                    rows="3"
                    value={form.description}
                    onChange={(e) =>
                      updateField("description", e.target.value)
                    }
                  />
                </label>

                <label className="full">
                  Đường dẫn hình ảnh (không bắt buộc)
                  <input
                    type="url"
                    value={form.imageUrl}
                    onChange={(e) =>
                      updateField("imageUrl", e.target.value)
                    }
                    placeholder="https://example.com/food.jpg"
                  />
                </label>
              </div>

              <div className="actions">
                <button
                  className="btn primary"
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? "Đang lưu..."
                    : editingId
                    ? "Lưu thay đổi"
                    : "Thêm món ăn"}
                </button>
                <button
                  className="btn secondary"
                  type="button"
                  onClick={() => setShowForm(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </section>
        )}

        {selected && (
          <section className="panel detail">
            <div className="panel-heading">
              <h2>Chi tiết món ăn</h2>
              <button
                className="close"
                onClick={() => setSelected(null)}
              >
                ×
              </button>
            </div>
            {selected.imageUrl && (
              <img
                className="detail-image"
                src={selected.imageUrl}
                alt={selected.name}
              />
            )}
            <h3>{selected.name}</h3>
            <p><b>Mã:</b> {selected.foodId}</p>
            <p><b>Loại:</b> {selected.category}</p>
            <p><b>Vùng miền:</b> {selected.cuisine}</p>
            <p><b>Giá:</b> {money(selected.price)}</p>
            <p><b>Số lượng:</b> {selected.quantity}</p>
            <p>
              <b>Nguyên liệu:</b>{" "}
              {(selected.ingredients || []).join(", ") || "Chưa có"}
            </p>
            <p>
              <b>Mô tả:</b> {selected.description || "Chưa có"}
            </p>
          </section>
        )}

        <section className="panel table-panel">
          <div className="panel-heading">
            <h2>Thực đơn</h2>
            <span className="count">{foods.length} món ăn</span>
          </div>

          {loading ? (
            <p className="empty">Đang tải dữ liệu...</p>
          ) : foods.length === 0 ? (
            <p className="empty">
              Không tìm thấy món ăn nào.
            </p>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Tên món ăn</th>
                    <th>Loại</th>
                    <th>Vùng miền</th>
                    <th>Giá</th>
                    <th>Số lượng</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {foods.map((food) => (
                    <tr key={food._id}>
                      <td>{food.foodId}</td>
                      <td><strong>{food.name}</strong></td>
                      <td>{food.category}</td>
                      <td>{food.cuisine}</td>
                      <td className="price">
                        {money(food.price)}
                      </td>
                      <td>{food.quantity}</td>
                      <td>
                        <div className="row-actions">
                          <button
                            className="btn view"
                            onClick={() => {
                              setSelected(food);
                              setShowForm(false);
                            }}
                          >
                            Xem
                          </button>
                          <button
                            className="btn edit"
                            onClick={() => openEdit(food)}
                          >
                            Sửa
                          </button>
                          <button
                            className="btn danger"
                            onClick={() => handleDelete(food)}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer>
          MSSV: 236974 — Lâm Thái Nguyên
        </footer>
      </main>
    </div>
  );
}

export default App;
