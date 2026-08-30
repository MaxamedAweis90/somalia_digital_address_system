export default function Breadcrumb({ items = [] }) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-medium text-ink-soft mb-6">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-2">
          {index > 0 && <span className="text-gray-400">›</span>}
          {item.onClick ? (
            <span onClick={item.onClick} className="hover:text-blue cursor-pointer">
              {item.label}
            </span>
          ) : (
            <span className="text-ink font-semibold">{item.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}
