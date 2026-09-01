import { useNavigate } from "react-router-dom";

export default function Breadcrumb({ items = [] }) {
  const navigate = useNavigate();

  return (
    <div className="mb-6 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium text-ink-soft">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const canNavigate = Boolean(item.to || item.onClick) && !isLast;

        return (
          <span key={`${item.label}-${index}`} className="flex min-w-0 max-w-full items-center gap-2">
            {index > 0 && <span className="shrink-0 text-gray-400">›</span>}
            {canNavigate ? (
              <span
                onClick={() => {
                  if (item.onClick) {
                    item.onClick();
                    return;
                  }
                  if (item.to) navigate(item.to);
                }}
                className="truncate hover:text-blue cursor-pointer"
              >
                {item.label}
              </span>
            ) : (
              <span className={`truncate ${isLast ? "text-ink font-semibold" : ""}`}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
