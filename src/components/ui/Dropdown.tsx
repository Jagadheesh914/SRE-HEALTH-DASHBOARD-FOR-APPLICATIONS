"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";

/** A small control-styled select dropdown used in the top bar. */
export function Dropdown({
  value,
  options,
  onChange,
  ariaLabel,
  leadingIcon,
  minWidth = 160,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  ariaLabel?: string;
  leadingIcon?: ReactNode;
  minWidth?: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className="ctrl h-full hover:border-brand-blue/60"
      >
        {leadingIcon}
        {value}
        <ChevronDown
          className={`h-3 w-3 text-ink-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <ul
          role="listbox"
          className="animate-fade-in absolute right-0 z-30 mt-1 max-h-[320px] overflow-auto rounded-lg border border-panel-border bg-panel py-1 shadow-panel"
          style={{ minWidth }}
        >
          {options.map((opt) => {
            const selected = opt === value;
            return (
              <li key={opt} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left font-sans text-xs transition-colors hover:bg-panel-hover ${
                    selected ? "font-semibold text-brand-blue" : "text-ink"
                  }`}
                >
                  <span className="truncate">{opt}</span>
                  {selected && <Check className="h-3.5 w-3.5 flex-shrink-0 text-brand-blue" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
