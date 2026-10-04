import { useState } from "react";
import { api } from "../api/client";
import useFetch from "../hooks/useFetch";
import Modal from "../components/Modal";
import ActionMenu from "../components/ActionMenu";
import Pagination from "../components/Pagination";
import StatusBadge from "../components/StatusBadge";
import { ImageField } from "../components/ImageUpload";

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
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 [&>h1]:text-xl [&>h1]:font-bold sm:[&>h1]:text-[22px]">
        <h1>Categories</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          + Add category
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 [&>*]:w-full [&>*]:min-w-0 sm:[&>*]:w-auto sm:[&>*]:min-w-[180px]">
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

      {error && <div className="alert-error">{error}</div>}

      <div className="overflow-x-auto rounded-lg bg-surface shadow-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Products</th>
              <th>Status</th>
              <th className="w-[1%] text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((category) => (
              <tr key={category.id}>
                <td>{category.name}</td>
                <td className="text-muted">{category.slug}</td>
                <td>{category._count.products}</td>
                <td>
                  <StatusBadge status={category.isActive ? "active" : "inactive"} />
                </td>
                <td className="w-[1%] text-center">
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
        {loading && <div className="p-10 text-center text-muted">Loading...</div>}
        {!loading && data?.items.length === 0 && <div className="p-6 text-center text-muted">No categories found</div>}
      </div>

      <Pagination pagination={data?.pagination} onChange={setPage} />

      {editing && (
        <Modal title={editing === "new" ? "Add category" : "Edit category"} onClose={() => setEditing(null)}>
          <form onSubmit={handleSubmit}>
            {formError && <div className="alert-error">{formError}</div>}
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
              <textarea
                className="input min-h-20 resize-y"
                name="description"
                value={form.description}
                onChange={handleChange}
              />
            </div>
            <ImageField
              label="Image"
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleChange}
              folder="categories"
            />
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

export default Categories;
