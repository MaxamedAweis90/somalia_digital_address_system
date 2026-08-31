import { useNavigate } from "react-router-dom";

export default function Breadcrumb({ items = [] }) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2 text-[11px] font-medium text-ink-soft mb-6">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const canNavigate = Boolean(item.to || item.onClick) && !isLast;

        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 && <span className="text-gray-400">›</span>}
            {canNavigate ? (
              <span
                onClick={() => {
                  if (item.onClick) {
                    item.onClick();
                    return;
                  }
                  if (item.to) navigate(item.to);
                }}
                className="hover:text-blue cursor-pointer"
              >
                {item.label}
              </span>
            ) : (
              <span className={isLast ? "text-ink font-semibold" : ""}>{item.label}</span>
            )}
          </span>
        );
      })}
    </div>
  );
}
