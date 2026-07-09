export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-3 animate-fade-in">
      <h2 className="font-display text-[17px] font-bold text-ink">{title}</h2>
      <p className="text-[12px] text-ink-muted">{subtitle}</p>
    </div>
  );
}
