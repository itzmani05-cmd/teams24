import { useState } from "react";

const EMPTY = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  isDefault: false,
};

const AddressForm = ({ initial, onSubmit, onCancel, submitLabel = "Save Address" }) => {
  const [form, setForm] = useState({ ...EMPTY, ...initial, addressLine2: initial?.addressLine2 ?? "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSubmit({
        fullName: form.fullName,
        phone: form.phone,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2.trim() || null,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
        country: form.country,
        isDefault: form.isDefault,
      });
      if (!initial) setForm(EMPTY);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const field = (name, label, props = {}) => (
    <div className="field">
      <label htmlFor={`addr-${name}`}>{label}</label>
      <input id={`addr-${name}`} className="input" name={name} value={form[name]} onChange={handleChange} {...props} />
    </div>
  );

  return (
    <form className="pt-1" onSubmit={handleSubmit}>
      {error && <div className="alert-error">{error}</div>}
      <div className="grid gap-x-3 sm:grid-cols-2">
        {field("fullName", "Full name", { required: true, minLength: 2 })}
        {field("phone", "Phone", { type: "tel", required: true, minLength: 5 })}
      </div>
      {field("addressLine1", "Address line 1", { required: true, minLength: 3 })}
      {field("addressLine2", "Address line 2 (optional)")}
      <div className="grid gap-x-3 sm:grid-cols-2">
        {field("city", "City", { required: true, minLength: 2 })}
        {field("state", "State", { required: true, minLength: 2 })}
      </div>
      <div className="grid gap-x-3 sm:grid-cols-2">
        {field("postalCode", "PIN code", { required: true, minLength: 3 })}
        {field("country", "Country", { required: true, minLength: 2 })}
      </div>
      <label className="mb-3 flex items-center gap-2 [&>input]:accent-primary">
        <input type="checkbox" name="isDefault" checked={form.isDefault} onChange={handleChange} />
        Make this my default address
      </label>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default AddressForm;
