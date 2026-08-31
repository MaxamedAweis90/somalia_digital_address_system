import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Reusable pagination component
 * @param {Object} props
 * @param {number} props.page - Current page (1-indexed)
 * @param {number} props.totalPages - Total number of pages
 * @param {number} props.total - Total number of items
 * @param {number} props.pageSize - Items per page
 * @param {Function} props.onPageChange - Callback when page changes
 * @param {boolean} [props.disabled] - Disable pagination controls
 */
export default function Pagination({
    page = 1,
    totalPages = 1,
    total = 0,
    pageSize = 10,
    onPageChange,
    disabled = false,
}) {
    if (totalPages <= 1) {
        return null;
    }

    // Calculate which page numbers to show
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        const halfWindow = Math.floor(maxVisible / 2);

        let start = Math.max(1, page - halfWindow);
        let end = Math.min(totalPages, page + halfWindow);

        // Adjust if near the boundaries
        if (start === 1) {
            end = Math.min(totalPages, maxVisible);
        }
        if (end === totalPages) {
            start = Math.max(1, totalPages - maxVisible + 1);
        }

        // Add first page if not visible
        if (start > 1) {
            pages.push(1);
            if (start > 2) {
                pages.push("...");
            }
        }

        // Add page range
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        // Add last page if not visible
        if (end < totalPages) {
            if (end < totalPages - 1) {
                pages.push("...");
            }
            pages.push(totalPages);
        }

        return pages;
    };

    const pages = getPageNumbers();
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const handlePrevious = () => {
        if (hasPrevPage && !disabled && onPageChange) {
            onPageChange(page - 1);
        }
    };

    const handleNext = () => {
        if (hasNextPage && !disabled && onPageChange) {
            onPageChange(page + 1);
        }
    };

    const handlePageClick = (pageNum) => {
        if (pageNum !== "..." && !disabled && onPageChange && pageNum !== page) {
            onPageChange(pageNum);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Info Text */}
            <p className="text-[12px] text-ink-soft">
                Showing{" "}
                {total > 0 ? (page - 1) * pageSize + 1 : 0}–
                {Math.min(page * pageSize, total)} of {total}
            </p>

            {/* Pagination Controls */}
            <nav
                className="flex items-center justify-center gap-1"
                aria-label="Pagination"
            >
                {/* Previous Button */}
                <button
                    onClick={handlePrevious}
                    disabled={!hasPrevPage || disabled}
                    aria-label="Previous page"
                    className="flex items-center gap-1 rounded-lg border border-line bg-white px-3 py-2 text-[12px] font-medium text-ink transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Previous</span>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                    {pages.map((p, idx) => {
                        if (p === "...") {
                            return (
                                <span key={`ellipsis-${idx}`} className="px-2 text-ink-soft">
                                    …
                                </span>
                            );
                        }

                        const isActive = p === page;
                        return (
                            <button
                                key={p}
                                onClick={() => handlePageClick(p)}
                                disabled={disabled}
                                aria-current={isActive ? "page" : undefined}
                                className={`
                  h-9 w-9 rounded-lg text-[12px] font-medium transition-colors
                  ${isActive
                                        ? "bg-blue-deep text-white"
                                        : "border border-line bg-white text-ink hover:bg-gray-50 disabled:cursor-not-allowed"
                                    }
                `}
                            >
                                {p}
                            </button>
                        );
                    })}
                </div>

                {/* Next Button */}
                <button
                    onClick={handleNext}
                    disabled={!hasNextPage || disabled}
                    aria-label="Next page"
                    className="flex items-center gap-1 rounded-lg border border-line bg-white px-3 py-2 text-[12px] font-medium text-ink transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                </button>
            </nav>
        </div>
    );
}
