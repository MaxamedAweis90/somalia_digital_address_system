import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  return (
    <div className="flex items-center justify-between border-t border-line px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="relative inline-flex items-center rounded-md border border-line bg-white px-4 py-2 text-xs font-medium text-ink hover:bg-bg disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center rounded-md border border-line bg-white px-4 py-2 text-xs font-medium text-ink hover:bg-bg disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-ink-soft">
            Page <span className="font-semibold text-ink">{currentPage}</span> of{" "}
            <span className="font-semibold text-ink">{totalPages}</span>
          </p>
        </div>

        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-xs" aria-label="Pagination">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-ink-soft ring-1 ring-inset ring-line hover:bg-bg focus:z-20 disabled:opacity-50 cursor-pointer"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-4 w-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => {
              if (
                pg === 1 ||
                pg === totalPages ||
                (pg >= currentPage - 1 && pg <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pg}
                    onClick={() => onPageChange(pg)}
                    className={`relative inline-flex items-center px-3 py-1.5 text-xs font-semibold focus:z-20 cursor-pointer ${
                      pg === currentPage
                        ? "z-10 bg-brand text-white"
                        : "text-ink ring-1 ring-inset ring-line hover:bg-bg"
                    }`}
                  >
                    {pg}
                  </button>
                );
              }
              if (pg === currentPage - 2 || pg === currentPage + 2) {
                return (
                  <span
                    key={pg}
                    className="relative inline-flex items-center px-2 py-1 text-xs text-ink-soft ring-1 ring-inset ring-line"
                  >
                    ...
                  </span>
                );
              }
              return null;
            })}

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-ink-soft ring-1 ring-inset ring-line hover:bg-bg focus:z-20 disabled:opacity-50 cursor-pointer"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
