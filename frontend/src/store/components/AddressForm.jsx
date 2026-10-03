import { useState } from "react";

const EMPTY = {
  label: "Home",
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

const AddressForm = ({ onSubmit, onCancel }) => {
  const [form, setForm] = useState(EMPTY);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm(EMPTY);
  };

  return (
    <form className="pt-1" onSubmit={handleSubmit}>
      <div className="grid gap-x-3 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="addr-name">Full name</label>
          <input
            id="addr-name"
            className="input"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="addr-phone">Phone</label>
          <input
            id="addr-phone"
            className="input"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="field">
        <label htmlFor="addr-line1">Address line 1</label>
        <input
          id="addr-line1"
          className="input"
          name="addressLine1"
          value={form.addressLine1}
          onChange={handleChange}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="addr-line2">Address line 2 (optional)</label>
        <input
          id="addr-line2"
          className="input"
          name="addressLine2"
          value={form.addressLine2}
          onChange={handleChange}
        />
      </div>
      <div className="grid gap-x-3 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="addr-city">City</label>
          <input id="addr-city" className="input" name="city" value={form.city} onChange={handleChange} required />
        </div>
        <div className="field">
          <label htmlFor="addr-state">State</label>
          <input id="addr-state" className="input" name="state" value={form.state} onChange={handleChange} required />
        </div>
      </div>
      <div className="grid gap-x-3 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="addr-pin">PIN code</label>
          <input
            id="addr-pin"
            className="input"
            name="postalCode"
            value={form.postalCode}
            onChange={handleChange}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="addr-label">Label</label>
          <select id="addr-label" className="input" name="label" value={form.label} onChange={handleChange}>
            <option>Home</option>
            <option>Work</option>
            <option>Other</option>
          </select>
        </div>
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
        <button type="submit" className="btn btn-primary">
          Save Address
        </button>
      </div>
    </form>
  );
};

export default AddressForm;
