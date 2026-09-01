export default function PageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="font-display text-[22px] sm:text-[25px] font-semibold tracking-tight text-ink">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-[13px] text-ink-soft">{description}</p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap gap-3 self-start sm:self-auto">{actions}</div>
      )}
    </div>
  );
}
