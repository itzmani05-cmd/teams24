import { useState } from "react";
import { api } from "../api/client";
import useFetch from "../hooks/useFetch";
import Modal from "../components/Modal";
import ActionMenu from "../components/ActionMenu";
import Pagination from "../components/Pagination";
import StatusBadge from "../components/StatusBadge";

const emptyForm = { name: "", slug: "", description: "", imageUrl: "", isActive: true };

const toPayload = (form) => ({
  name: form.name,
  slug: form.slug || undefined,
  description: form.description || null,
  imageUrl: form.imageUrl || null,
  isActive: form.isActive,
});

const Categories = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, error, loading, reload } = useFetch("/admin/categories", { page, search });

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setForm(emptyForm);
    setFormError("");
    setEditing("new");
  };

  const openEdit = (category) => {
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      imageUrl: category.imageUrl || "",
      isActive: category.isActive,
    });
    setFormError("");
    setEditing(category);
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
      if (editing === "new") await api.post("/admin/categories", toPayload(form));
      else await api.patch(`/admin/categories/${editing.id}`, toPayload(form));
      setEditing(null);
      reload();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category) => {
    if (!confirm(`Delete category "${category.name}"?`)) return;
    try {
      await api.delete(`/admin/categories/${category.id}`);
      reload();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>Categories</h1>
        <button className="btn" onClick={openCreate}>
          + Add category
        </button>
      </div>

      <div className="toolbar">
        <input
          className="input"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {error && <div className="error">{error}</div>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Products</th>
              <th>Status</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((category) => (
              <tr key={category.id}>
                <td>{category.name}</td>
                <td className="muted">{category.slug}</td>
                <td>{category._count.products}</td>
                <td>
                  <StatusBadge status={category.isActive ? "active" : "inactive"} />
                </td>
                <td className="col-actions">
                  <ActionMenu
                    items={[
                      { label: "Edit", onClick: () => openEdit(category) },
                      { label: "Delete", onClick: () => handleDelete(category), danger: true },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="loading">Loading...</div>}
        {!loading && data?.items.length === 0 && <div className="empty">No categories found</div>}
      </div>

      <Pagination pagination={data?.pagination} onChange={setPage} />

      {editing && (
        <Modal title={editing === "new" ? "Add category" : "Edit category"} onClose={() => setEditing(null)}>
          <form onSubmit={handleSubmit}>
            {formError && <div className="error">{formError}</div>}
            <div className="field">
              <label>Name</label>
              <input className="input" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="field">
              <label>Slug</label>
              <input
                className="input"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="Leave empty to generate from name"
              />
            </div>
            <div className="field">
              <label>Description</label>
              <textarea className="textarea" name="description" value={form.description} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Image URL</label>
              <input className="input" name="imageUrl" type="url" value={form.imageUrl} onChange={handleChange} />
            </div>
            <label className="checkbox">
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
              Active
            </label>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button type="submit" className="btn" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};

export default Categories;
