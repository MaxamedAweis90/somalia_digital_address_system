import sdasLogo from "./assets/logo/sdas_logo.png";

function App() {
  const systemModules = [
    {
      number: "01",
      title: "District",
      description: "Manage administrative districts",
    },
    {
      number: "02",
      title: "Neighborhood",
      description: "Organize neighborhoods",
    },
    {
      number: "03",
      title: "Zone",
      description: "Manage zones and boundaries",
    },
    {
      number: "04",
      title: "Address",
      description: "Register and locate addresses",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-5xl text-center">

          {/* Logo */}
          <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-2xl bg-white shadow-xl sm:h-36 sm:w-36">
            <img
              src={sdasLogo}
              alt="Somalia Digital Address System logo"
              className="h-28 w-28 object-contain sm:h-32 sm:w-32"
            />
          </div>

          {/* System Name */}
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400 sm:text-sm">
            Somalia Digital Address System
          </p>

          {/* Welcome Heading */}
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Welcome to SDAS
          </h1>

          {/* Description */}
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base lg:text-lg">
            A digital address management system designed to organize,
            manage, and locate addresses across Somalia.
          </p>

          {/* System Modules */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {systemModules.map((module) => (
              <div
                key={module.number}
                className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 text-left transition hover:border-slate-700 hover:bg-slate-900"
              >
                <span className="text-xs font-medium text-slate-500">
                  {module.number}
                </span>

                <h2 className="mt-3 text-base font-semibold text-white">
                  {module.title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {module.description}
                </p>
              </div>
            ))}
          </div>

          {/* System Status */}
          <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            SDAS Frontend is ready
          </div>

          {/* Footer */}
          <p className="mt-8 text-xs text-slate-600">
            Somalia Digital Address System
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;