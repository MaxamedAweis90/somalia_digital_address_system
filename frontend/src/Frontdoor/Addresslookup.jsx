import { useState } from "react";
import Header from "./Header";
import { lookupAddressByCode } from "@/api/addressApi";
import { isValidDacFormat } from "@/utils/dac";

export default function AddressLookup() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const code = query.trim().toUpperCase();

    if (!code) {
      setError("Enter a Digital Address Code to search.");
      setResult(null);
      return;
    }

    if (!isValidDacFormat(code)) {
      setError("Invalid DAC format. Use DISTRICT-NEIGHBORHOOD-ZONE-0001 (e.g. HOD-TLX-Z01-0001).");
      setResult(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await lookupAddressByCode(code);
      setResult(res.data.data);
    } catch (err) {
      setResult(null);
      setError(err.response?.data?.message || "Address not found in the registry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white font-sans antialiased text-[#16233A]">
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-16 sm:py-20">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-display tracking-tight">
            Address Lookup
          </h1>
          <p className="text-sm sm:text-base text-gray-500">
            Search the national digital address registry by official DAC code
            (e.g. HOD-TLX-Z01-0001).
          </p>
        </div>

        <form onSubmit={handleSearch} className="mt-10 flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value.toUpperCase())}
            placeholder="e.g. HOD-TLX-Z01-0001"
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition font-mono"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-[#0056B3] hover:bg-[#00458F] active:bg-[#003B7A] text-white text-sm font-semibold shadow-xs hover:shadow transition cursor-pointer disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {error && (
          <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Digital Address Code
            </p>
            <p className="mt-1 text-2xl font-bold font-mono text-gray-900">
              {result.addressCode}
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">District</p>
                <p className="font-medium text-gray-900">{result.district?.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Neighborhood</p>
                <p className="font-medium text-gray-900">{result.neighborhood?.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Zone</p>
                <p className="font-medium text-gray-900">{result.zone?.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Street</p>
                <p className="font-medium text-gray-900">{result.streetName}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-gray-500">Description</p>
                <p className="font-medium text-gray-900">{result.description || "—"}</p>
              </div>
            </div>

            <div className="mt-4">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  result.status === "ACTIVE"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {result.status === "ACTIVE" ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        )}

        {!error && !result && !loading && (
          <div className="mt-10 rounded-lg border border-dashed border-gray-300 p-10 text-center text-sm text-gray-400">
            Enter an official DAC code to view registry details.
          </div>
        )}
      </main>
    </div>
  );
}
