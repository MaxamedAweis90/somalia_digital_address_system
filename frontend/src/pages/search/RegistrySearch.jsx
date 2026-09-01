import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Search } from "lucide-react";
import { searchRegistry } from "@/api/searchApi";
import SearchResultRow from "@/components/search/SearchResultRow";
import Breadcrumb from "@/components/ui/Breadcrumb";
import PageHeader from "@/components/ui/PageHeader";

const SECTIONS = [
  { key: "regions", label: "Regions" },
  { key: "districts", label: "Districts" },
  { key: "zones", label: "Zones" },
  { key: "zoneBlocks", label: "Zone Blocks" },
  { key: "addresses", label: "Addresses" },
  { key: "staff", label: "Staff" },
];

export default function RegistrySearch() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [input, setInput] = useState(query);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setInput(query);
  }, [query]);

  useEffect(() => {
    if (!query.trim()) {
      setData(null);
      setError(null);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await searchRegistry({ q: query.trim(), limit: 20 });
        if (!cancelled) setData(res.data.data);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || "Search failed");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [query]);

  const totalMatches = useMemo(() => {
    if (!data?.totals) return 0;
    return Object.values(data.totals).reduce((sum, count) => sum + count, 0);
  }, [data]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) {
      setSearchParams({});
      return;
    }
    setSearchParams({ q: trimmed });
  };

  const goToResult = (path) => navigate(path);

  return (
    <div className="min-h-full bg-bg font-sans">
      <div className="px-4 sm:px-6 lg:px-5 pt-5 pb-10 space-y-6">
        <Breadcrumb
          items={[
            { label: "Dashboard", to: "/admin/dashboard" },
            { label: "Search" },
          ]}
        />

        <PageHeader
          title="Registry Search"
          description="Find regions, districts, zones, zone blocks, addresses, and staff."
        />

        <form onSubmit={handleSubmit} className="max-w-2xl">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Search by name, code, DAC, email..."
              className="h-[42px] w-full rounded-lg border border-line bg-white pl-9 pr-24 text-[13px] text-ink outline-none placeholder:text-ink-soft/70 focus:border-blue focus:ring-2 focus:ring-blue/10"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 h-[34px] -translate-y-1/2 rounded-md bg-blue-deep px-3 text-[11px] font-semibold text-white hover:bg-[#0F2B4D] cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>

        {!query.trim() && (
          <div className="rounded-xl border border-line bg-white p-8 text-center shadow-card-sm">
            <p className="text-[13px] font-medium text-ink">Start typing to search the registry</p>
            <p className="mt-1 text-[12px] text-ink-soft">
              Try a region name, district code, zone block, DAC, or staff email.
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {query.trim() && loading && (
          <div className="flex items-center gap-2 text-[12px] text-ink-soft">
            <Loader2 className="h-4 w-4 animate-spin text-blue" />
            Searching for “{query}”...
          </div>
        )}

        {query.trim() && !loading && data && (
          <div className="space-y-4">
            <p className="text-[12px] text-ink-soft">
              {totalMatches > 0
                ? `${totalMatches} result${totalMatches === 1 ? "" : "s"} for “${data.query}”`
                : `No results for “${data.query}”`}
            </p>

            {SECTIONS.map(({ key, label }) => {
              const items = data.results?.[key] || [];
              const total = data.totals?.[key] || 0;
              if (items.length === 0) return null;

              return (
                <div
                  key={key}
                  className="overflow-hidden rounded-xl border border-line bg-white shadow-card-sm"
                >
                  <div className="flex items-center justify-between border-b border-line px-5 py-3">
                    <h2 className="text-[14px] font-semibold text-ink">{label}</h2>
                    <span className="text-[11px] text-ink-soft">
                      {total} match{total === 1 ? "" : "es"}
                    </span>
                  </div>
                  <div className="divide-y divide-line px-2 py-1">
                    {items.map((item) => (
                      <SearchResultRow key={`${item.type}-${item.id}`} item={item} onNavigate={goToResult} />
                    ))}
                  </div>
                  {total > items.length && (
                    <div className="border-t border-line px-5 py-3 text-[11px] text-ink-soft">
                      Showing first {items.length} of {total}. Refine your search for more specific matches.
                    </div>
                  )}
                </div>
              );
            })}

            {totalMatches === 0 && (
              <div className="rounded-xl border border-line bg-white p-8 text-center shadow-card-sm">
                <p className="text-[13px] font-medium text-ink">Nothing matched your search</p>
                <p className="mt-1 text-[12px] text-ink-soft">
                  Check spelling or try a shorter term such as a region code or DAC prefix.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
