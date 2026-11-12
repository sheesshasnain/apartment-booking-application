
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apartmentAPI, adminAPI } from "../services/api";

const emptyForm = {
  title: "",
  description: "",
  city: "",
  address: "",
  price_per_night: "",
  bedrooms: "",
  is_active: true,
};

export default function ManageApartments() {
  const [apartments, setApartments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadApartments() {
    try {
      const data = await apartmentAPI.getAll();
      setApartments(data);
    } catch (err) {
      setError(err.message || "Failed to load apartments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApartments();
  }, []);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function startEditing(apartment) {
    setEditingId(apartment.id);

    setForm({
      title: apartment.title,
      description: apartment.description || "",
      city: apartment.city,
      address: apartment.address,
      price_per_night: apartment.price_per_night,
      bedrooms: apartment.bedrooms,
      is_active: apartment.is_active,
    });

    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm({ ...emptyForm });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const price = Number(form.price_per_night);
    const bedrooms = Number(form.bedrooms);

    if (
      !form.title.trim() ||
      !form.city.trim() ||
      !form.address.trim() ||
      !Number.isFinite(price) ||
      price <= 0 ||
      !Number.isInteger(bedrooms) ||
      bedrooms < 0
    ) {
      setError("Please enter valid apartment details.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      city: form.city.trim(),
      address: form.address.trim(),
      price_per_night: price,
      bedrooms,
      is_active: form.is_active,
    };

    setSaving(true);

    try {
      if (editingId !== null) {
        await adminAPI.updateApartment(editingId, payload);
        setMessage("Apartment updated successfully.");
      } else {
        await adminAPI.createApartment(payload);
        setMessage("Apartment created successfully.");
      }

      resetForm();
      await loadApartments();
    } catch (err) {
      setError(err.message || "Failed to save apartment.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(apartment) {
    const confirmed = window.confirm(
      `Are you sure you want to remove "${apartment.title}"?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await adminAPI.deleteApartment(apartment.id);

      setMessage("Apartment removed successfully.");

      if (editingId === apartment.id) {
        resetForm();
      }

      await loadApartments();
    } catch (err) {
      setError(err.message || "Failed to remove apartment.");
    }
  }

  const inputClass =
    "w-full rounded-lg border border-stone-300 bg-white px-4 py-3 outline-none focus:border-stone-600";

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-5 py-10 text-stone-900">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/admin"
          className="text-sm text-stone-600 hover:underline"
        >
          ← Back to Admin Dashboard
        </Link>

        <h1 className="mt-8 font-serif text-4xl">
          Manage Apartments
        </h1>

        <p className="mt-2 text-stone-500">
          Create, update, and remove apartment listings.
        </p>

        <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="mb-6 text-2xl font-semibold">
            {editingId !== null
              ? "Edit Apartment"
              : "Add New Apartment"}
          </h2>

          {error && (
            <p role="alert" className="mb-5 text-red-700">
              {error}
            </p>
          )}

          {message && (
            <p role="status" className="mb-5 text-green-700">
              {message}
            </p>
          )}

          <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm">Apartment Title</span>
              <input
                className={inputClass}
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Luxury Downtown Apartment"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm">City</span>
              <input
                className={inputClass}
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Lahore"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm">Address</span>
              <input
                className={inputClass}
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="DHA Phase 5"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm">
                Price Per Night
              </span>
              <input
                className={inputClass}
                name="price_per_night"
                type="number"
                min="0.01"
                step="0.01"
                value={form.price_per_night}
                onChange={handleChange}
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm">
                Bedrooms
              </span>
              <input
                className={inputClass}
                name="bedrooms"
                type="number"
                min="0"
                step="1"
                value={form.bedrooms}
                onChange={handleChange}
                required
              />
            </label>

            <label className="flex items-center gap-3 self-end pb-3">
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
              />
              <span>Active Listing</span>
            </label>

            <label className="md:col-span-2">
              <span className="mb-2 block text-sm">
                Description
              </span>
              <textarea
                className={inputClass}
                name="description"
                rows="4"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the apartment..."
              />
            </label>

            <div className="flex flex-wrap gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[#303b33] px-6 py-3 text-white disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                  ? "Update Apartment"
                  : "Add Apartment"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-stone-300 px-6 py-3"
                >
                  Cancel Editing
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">
            Apartment Listings ({apartments.length})
          </h2>

          {loading ? (
            <p className="mt-6">Loading apartments...</p>
          ) : apartments.length === 0 ? (
            <p className="mt-6 text-stone-500">
              No active apartments found.
            </p>
          ) : (
            <div className="mt-6 overflow-x-auto rounded-2xl border border-stone-200 bg-white">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-stone-100">
                  <tr>
                    <th className="p-4">ID</th>
                    <th className="p-4">Apartment</th>
                    <th className="p-4">City</th>
                    <th className="p-4">Price/Night</th>
                    <th className="p-4">Bedrooms</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {apartments.map((apartment) => (
                    <tr
                      key={apartment.id}
                      className="border-t border-stone-100"
                    >
                      <td className="p-4">{apartment.id}</td>
                      <td className="p-4 font-medium">
                        {apartment.title}
                      </td>
                      <td className="p-4">{apartment.city}</td>
                      <td className="p-4">
                        PKR {Number(
                          apartment.price_per_night
                        ).toLocaleString()}
                      </td>
                      <td className="p-4">
                        {apartment.bedrooms}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-4">
                          <button
                            onClick={() => startEditing(apartment)}
                            className="text-blue-700 hover:underline"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(apartment)}
                            className="text-red-700 hover:underline"
                          >
                            Delete
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
      </div>
    </main>
  );
}
