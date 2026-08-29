import { useState } from "react";
import Header from "./Header";

export default function AddressLookup() {
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: wire up to the real lookup endpoint
    console.log("Searching address:", query);
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
            Search the national digital address registry by code, region, or
            coordinates.
          </p>
        </div>

        <form onSubmit={handleSearch} className="mt-10 flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. BAN-04-1123 or district name"
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-[#0056B3] hover:bg-[#00458F] active:bg-[#003B7A] text-white text-sm font-semibold shadow-xs hover:shadow transition cursor-pointer"
          >
            Search
          </button>
        </form>

        <div className="mt-10 rounded-lg border border-dashed border-gray-300 p-10 text-center text-sm text-gray-400">
          Results will appear here.
        </div>
      </main>
    </div>
  );
}