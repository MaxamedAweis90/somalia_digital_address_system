import Header from "../Header";

const DISTRICTS = [
  "Somali Galbeed",
  "NFD (Northern Frontier District)",
  "Djibouti",
  "Waqooyi Galbeed",
  "Waqooyi Bari",
  "Puntland",
  "Galmudug",
  "Hirshabelle",
  "Banaadir",
  "Koonfur Galbeed",
  "Jubbaland",
];

export default function CoveragePage() {
  return (
    <div className="min-h-screen w-full bg-white font-sans antialiased text-[#16233A]">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-16 sm:py-20">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-display tracking-tight">
            Coverage & Districts
          </h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-2xl">
            SDAS is being rolled out region by region. Below is current
            registry coverage by district.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DISTRICTS.map((d) => (
            <div
              key={d}
              className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
            >
              <span className="text-sm font-medium text-gray-800">{d}</span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full px-2.5 py-1">
                Active
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}