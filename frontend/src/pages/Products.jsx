import { useState } from "react";
import { api } from "../api/client";
import useFetch from "../hooks/useFetch";
import Modal from "../components/Modal";
import ActionMenu from "../components/ActionMenu";
import Pagination from "../components/Pagination";
import StatusBadge from "../components/StatusBadge";
import { formatMoney } from "../utils/format";

const emptyForm = {
  name: "",
  slug: "",
  sku: "",
  categoryId: "",
  brand: "",
  price: "",
  discountPrice: "",
  stock: "0",
  thumbnailUrl: "",
  images: "",
  description: "",
  isActive: true,
};

const toPayload = (form, isNew) => {
  const payload = {
    name: form.name,
    slug: form.slug || undefined,
    sku: form.sku,
    categoryId: form.categoryId,
    brand: form.brand || null,
    price: Number(form.price),
    discountPrice: form.discountPrice === "" ? null : Number(form.discountPrice),
    stock: Number(form.stock),
    thumbnailUrl: form.thumbnailUrl || null,
    description: form.description || null,
    isActive: form.isActive,
  };
  if (isNew) {
    payload.images = form.images
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean);
  }
  return payload;
};

const Products = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [isActive, setIsActive] = useState("");

  const { data, error, loading, reload } = useFetch("/admin/products", { page, search, category, isActive });
  const { data: categories } = useFetch("/admin/categories", { limit: 100 });

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setForm(emptyForm);
    setFormError("");
    setEditing("new");
  };

  const openEdit = (product) => {
    setForm({
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      categoryId: product.categoryId,
      brand: product.brand || "",
      price: String(product.price),
      discountPrice: product.discountPrice ? String(product.discountPrice) : "",
      stock: String(product.stock),
      thumbnailUrl: product.thumbnailUrl || "",
      images: "",
      description: product.description || "",
      isActive: product.isActive,
    });
    setFormError("");
    setEditing(product);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      if (editing === "new") await api.post("/admin/products", toPayload(form, true));
      else await api.patch(`/admin/products/${editing.id}`, toPayload(form, false));
      setEditing(null);
      reload();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!confirm(`Delete product "${product.name}"?`)) return;
    try {
      const res = await api.delete(`/admin/products/${product.id}`);
      if (res.message) alert(res.message);
      reload();
    } catch (err) {
      alert(err.message);
    }
  };

  const resetPage = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 [&>h1]:text-xl [&>h1]:font-bold sm:[&>h1]:text-[22px]">
        <h1>Products</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          + Add product
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 [&>*]:w-full [&>*]:min-w-0 sm:[&>*]:w-auto sm:[&>*]:min-w-[180px]">
        <input className="input" placeholder="Search products..." value={search} onChange={resetPage(setSearch)} />
        <select className="input" value={category} onChange={resetPage(setCategory)}>
          <option value="">All categories</option>
          {categories?.items.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select className="input" value={isActive} onChange={resetPage(setIsActive)}>
          <option value="">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="overflow-x-auto rounded-lg bg-surface shadow-card">
        <table className="data-table">
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th className="w-[1%] text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((product) => (
              <tr key={product.id}>
                <td>
                  {product.thumbnailUrl ? (
                    <img className="size-10 rounded-md bg-canvas object-cover" src={product.thumbnailUrl} alt="" />
                  ) : (
                    <div className="size-10 rounded-md bg-canvas object-cover" />
                  )}
                </td>
                <td>
                  <div>{product.name}</div>
                  {product.brand && <div className="text-muted">{product.brand}</div>}
                </td>
                <td className="text-muted">{product.sku}</td>
                <td>{product.category?.name}</td>
                <td>
                  {product.discountPrice ? (
                    <>
                      <div>{formatMoney(product.discountPrice)}</div>
                      <div className="text-muted">
                        <s>{formatMoney(product.price)}</s>
                      </div>
                    </>
                  ) : (
                    formatMoney(product.price)
                  )}
                </td>
                <td>
                  <span
                    className={`badge ${product.stock === 0 ? "badge-danger" : product.stock <= 5 ? "badge-warning" : "badge-success"}`}
                  >
                    {product.stock}
                  </span>
                </td>
                <td>
                  <StatusBadge status={product.isActive ? "active" : "inactive"} />
                </td>
                <td className="w-[1%] text-center">
                  <ActionMenu
                    items={[
                      { label: "Edit", onClick: () => openEdit(product) },
                      { label: "Delete", onClick: () => handleDelete(product), danger: true },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="p-10 text-center text-muted">Loading...</div>}
        {!loading && data?.items.length === 0 && <div className="p-6 text-center text-muted">No products found</div>}
      </div>

      <Pagination pagination={data?.pagination} onChange={setPage} />

      {editing && (
        <Modal title={editing === "new" ? "Add product" : "Edit product"} onClose={() => setEditing(null)}>
          <form onSubmit={handleSubmit}>
            {formError && <div className="alert-error">{formError}</div>}
            <div className="field">
              <label>Name</label>
              <input className="input" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="grid gap-x-3 sm:grid-cols-2">
              <div className="field">
                <label>SKU</label>
                <input className="input" name="sku" value={form.sku} onChange={handleChange} required />
              </div>
              <div className="field">
                <label>Slug</label>
                <input
                  className="input"
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  placeholder="Auto from name"
                />
              </div>
            </div>
            <div className="grid gap-x-3 sm:grid-cols-2">
              <div className="field">
                <label>Category</label>
                <select className="input" name="categoryId" value={form.categoryId} onChange={handleChange} required>
                  <option value="">Select category</option>
                  {categories?.items.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Brand</label>
                <input className="input" name="brand" value={form.brand} onChange={handleChange} />
              </div>
            </div>
            <div className="grid gap-x-3 sm:grid-cols-2">
              <div className="field">
                <label>Price</label>
                <input
                  className="input"
                  name="price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="field">
                <label>Discount price</label>
                <input
                  className="input"
                  name="discountPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.discountPrice}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="grid gap-x-3 sm:grid-cols-2">
              <div className="field">
                <label>Stock</label>
                <input
                  className="input"
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="field">
                <label>Thumbnail URL</label>
                <input
                  className="input"
                  name="thumbnailUrl"
                  type="url"
                  value={form.thumbnailUrl}
                  onChange={handleChange}
                />
              </div>
            </div>
            {editing === "new" && (
              <div className="field">
                <label>Gallery image URLs (one per line)</label>
                <textarea
                  className="input min-h-20 resize-y"
                  name="images"
                  value={form.images}
                  onChange={handleChange}
                />
              </div>
            )}
            <div className="field">
              <label>Description</label>
              <textarea
                className="input min-h-20 resize-y"
                name="description"
                value={form.description}
                onChange={handleChange}
              />
            </div>
            <label className="mb-3 flex items-center gap-2">
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
              Active
            </label>
            <div className="mt-2 flex justify-end gap-2">
              <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};

export default Products;
