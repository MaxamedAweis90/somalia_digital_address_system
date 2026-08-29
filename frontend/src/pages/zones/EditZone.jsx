import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

export default function EditZone() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "Zone A",
    district: "Hodan",
    code: "ZN-001",
    status: "Active",
    description: "Zone located within Hodan district.",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Updated Zone:", {
      id,
      ...formData,
    });

    alert("Zone updated successfully!");

    navigate("/admin/zones");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* Header */}
      <div className="mb-6">

        <Link
          to="/admin/zones"
          className="text-sm font-medium text-[#0056B3] hover:underline"
        >
          ← Back to Zones
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-[#172B4D]">
          Edit Zone
        </h1>

        <p className="mt-1 text-gray-500">
          Update zone information.
        </p>

      </div>

      {/* Form */}
      <div className="max-w-3xl rounded-xl bg-white p-6 shadow-sm">

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Zone Name */}
          <div>

            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Zone Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#0056B3] focus:ring-1 focus:ring-[#0056B3]"
            />

          </div>

          {/* District */}
          <div>

            <label className="mb-2 block text-sm font-semibold text-gray-700">
              District
            </label>

            <select
              name="district"
              value={formData.district}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#0056B3] focus:ring-1 focus:ring-[#0056B3]"
            >

              <option value="Hodan">
                Hodan
              </option>

              <option value="Wadajir">
                Wadajir
              </option>

              <option value="Karaan">
                Karaan
              </option>

              <option value="Waberi">
                Waberi
              </option>

              <option value="Yaqshid">
                Yaqshid
              </option>

            </select>

          </div>

          {/* Zone Code */}
          <div>

            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Zone Code
            </label>

            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm uppercase outline-none focus:border-[#0056B3] focus:ring-1 focus:ring-[#0056B3]"
            />

          </div>

          {/* Status */}
          <div>

            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Status
            </label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#0056B3] focus:ring-1 focus:ring-[#0056B3]"
            >

              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>

            </select>

          </div>

          {/* Description */}
          <div>

            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#0056B3] focus:ring-1 focus:ring-[#0056B3]"
            />

          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 border-t pt-5">

            <Link
              to="/admin/zones"
              className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="rounded-lg bg-[#0056B3] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#00458F]"
            >
              Update Zone
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}