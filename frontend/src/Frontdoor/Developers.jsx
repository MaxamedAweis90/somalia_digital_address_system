import Header from "./Header";

const ENDPOINTS = [
  { method: "GET", path: "/v1/address/{code}", desc: "Retrieve a single address record by its SDAS code." },
  { method: "GET", path: "/v1/search", desc: "Search addresses by district, region, or coordinates." },
  { method: "POST", path: "/v1/address", desc: "Register a new address (requires officer credentials)." },
];

export default function Developers() {
  return (
    <div className="min-h-screen w-full bg-white font-sans antialiased text-[#16233A]">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-16 sm:py-20">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-display tracking-tight">
            Developer API
          </h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-2xl">
            Integrate with the Somalia Digital Address System registry.
            Request an API key to get started.
          </p>
        </div>

        <div className="mt-10 flex gap-3">
          <button
            type="button"
            className="px-5 py-2.5 rounded-lg bg-[#0056B3] hover:bg-[#00458F] active:bg-[#003B7A] text-white text-sm font-semibold shadow-xs hover:shadow transition cursor-pointer"
          >
            Request API Key
          </button>
          <button
            type="button"
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
          >
            View Full Docs
          </button>
        </div>

        <div className="mt-12 space-y-4">
          <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Endpoints
          </h2>
          <div className="rounded-lg border border-gray-200 divide-y divide-gray-200">
            {ENDPOINTS.map((ep) => (
              <div key={ep.path} className="flex items-start gap-4 p-4">
                <span className="shrink-0 text-xs font-bold text-[#0056B3] bg-blue-50 rounded px-2 py-1 mt-0.5">
                  {ep.method}
                </span>
                <div>
                  <p className="text-sm font-mono text-gray-900">{ep.path}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{ep.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}