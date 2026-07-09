export function LoadingGrid() {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 xl:grid-cols-7">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="panel h-[120px] animate-pulse-soft" />
      ))}
    </div>
  );
}
