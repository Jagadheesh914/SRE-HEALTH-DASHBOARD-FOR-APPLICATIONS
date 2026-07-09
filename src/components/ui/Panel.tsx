import type { ReactNode } from "react";

export function Panel({
  title,
  right,
  children,
  className = "",
  bodyClassName = "",
}: {
  title?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={`panel flex min-w-0 flex-col overflow-hidden p-4 ${className}`}>
      {title && (
        <div className="mb-3 flex flex-shrink-0 items-center justify-between gap-2">
          <h2 className="panel-title">{title}</h2>
          {right}
        </div>
      )}
      <div className={`flex min-h-0 flex-1 flex-col ${bodyClassName}`}>{children}</div>
    </section>
  );
}
