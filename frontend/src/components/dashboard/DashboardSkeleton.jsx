export default function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded bg-gray-200" />
          <div className="h-4 w-72 rounded bg-gray-200" />
        </div>

        <div className="flex gap-3">
          <div className="h-9 w-28 rounded bg-gray-200" />
          <div className="h-9 w-24 rounded bg-gray-200" />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="rounded-lg border border-gray-200 bg-white p-5"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="h-4 w-28 rounded bg-gray-200" />
                <div className="h-8 w-16 rounded bg-gray-200" />
              </div>

              <div className="h-10 w-10 rounded-lg bg-gray-200" />
            </div>

            <div className="mt-4 h-3 w-32 rounded bg-gray-200" />
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Addresses */}
        <div className="rounded-lg border border-gray-200 bg-white lg:col-span-2">
          <div className="border-b border-gray-200 px-5 py-4 space-y-2">
            <div className="h-4 w-36 rounded bg-gray-200" />
            <div className="h-3 w-56 rounded bg-gray-200" />
          </div>

          <div className="space-y-4 p-5">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="flex items-center gap-4"
              >
                <div className="h-4 w-28 rounded bg-gray-200" />
                <div className="h-4 w-20 rounded bg-gray-200" />
                <div className="h-4 w-24 rounded bg-gray-200" />
                <div className="h-4 w-16 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-5 py-4 space-y-2">
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="h-3 w-48 rounded bg-gray-200" />
          </div>

          <div className="space-y-5 p-5">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="flex gap-3"
              >
                <div className="h-8 w-8 shrink-0 rounded-full bg-gray-200" />

                <div className="flex-1 space-y-2">
                  <div className="h-3 w-32 rounded bg-gray-200" />
                  <div className="h-3 w-full rounded bg-gray-200" />
                  <div className="h-2.5 w-16 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}