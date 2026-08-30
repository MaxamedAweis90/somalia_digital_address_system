export default function PlaceholderPage({ title, description }) {
  return (
    <div className="min-h-screen bg-bg font-sans px-4 sm:px-6 lg:px-5 pt-5 pb-10">
      <div className="mb-6">
        <h1 className="font-display text-[25px] font-semibold tracking-tight text-ink">
          {title}
        </h1>
        <p className="mt-1 text-[13px] text-ink-soft">
          {description}
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-card-sm">
        <p className="text-sm font-semibold text-ink">Module Under Active Integration</p>
        <p className="mt-1.5 text-xs text-ink-soft max-w-md mx-auto">
          This feature is scheduled in the implementation plan and will be populated with live database services shortly.
        </p>
      </div>
    </div>
  );
}
