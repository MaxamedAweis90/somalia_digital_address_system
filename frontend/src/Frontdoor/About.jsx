import Header from "./Header";

export default function About() {
  return (
    <div className="min-h-screen w-full bg-white font-sans antialiased text-[#16233A]">
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-16 sm:py-20">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-display tracking-tight">
            About SDAS
          </h1>
          <p className="text-sm sm:text-base text-gray-500">
            Somalia Digital Address System — Centralized Administrative &
            Property Spatial Registry.
          </p>
        </div>

        <div className="mt-10 space-y-6 text-sm sm:text-base text-gray-700 leading-relaxed">
          <p>
            SDAS is the national platform for assigning, verifying, and
            managing digital addresses across Somalia's administrative
            regions and districts. It supports government agencies,
            developers, and the public with a single, authoritative address
            registry.
          </p>
          <p>
            The system is built to be extended district by district, with
            official access reserved for verified government personnel and
            authorized partners.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border border-gray-200 p-5">
            <p className="text-2xl font-bold text-[#0056B3]">11</p>
            <p className="text-xs text-gray-500 mt-1">Districts Covered</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-5">
            <p className="text-2xl font-bold text-[#0056B3]">24/7</p>
            <p className="text-xs text-gray-500 mt-1">Registry Uptime</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-5">
            <p className="text-2xl font-bold text-[#0056B3]">API</p>
            <p className="text-xs text-gray-500 mt-1">Developer Access</p>
          </div>
        </div>
      </main>
    </div>
  );
}