"use client";

import { Panel } from "@/components/ui/Panel";

const ZONES = [
  { from: 0, to: 0.5, color: "#16a34a" },
  { from: 0.5, to: 0.7, color: "#d97706" },
  { from: 0.7, to: 1, color: "#e0384a" },
];

// Polar helper for a 180°→0° (left-to-right) semicircle gauge.
function pt(cx: number, cy: number, r: number, frac: number) {
  const a = Math.PI * (1 - frac);
  return [cx + r * Math.cos(a), cy - r * Math.sin(a)];
}

function arc(cx: number, cy: number, r: number, ir: number, f0: number, f1: number) {
  const [x0, y0] = pt(cx, cy, r, f0);
  const [x1, y1] = pt(cx, cy, r, f1);
  const [xi1, yi1] = pt(cx, cy, ir, f1);
  const [xi0, yi0] = pt(cx, cy, ir, f0);
  return `M${x0},${y0} A${r},${r} 0 0 1 ${x1},${y1} L${xi1},${yi1} A${ir},${ir} 0 0 0 ${xi0},${yi0} Z`;
}

export function ApdexGauge({ value }: { value: number }) {
  const W = 200;
  const H = 118;
  const cx = W / 2;
  const cy = 104;
  const r = 82;
  const ir = 56;
  const tag = value >= 0.94 ? "Excellent" : value >= 0.85 ? "Good" : value >= 0.7 ? "Fair" : "Poor";
  const [nx, ny] = pt(cx, cy, r - 6, value);

  return (
    <Panel title="Apdex Score (All Applications)">
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="w-full max-w-[200px]">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
            {ZONES.map((z, i) => (
              <path key={i} d={arc(cx, cy, r, ir, z.from, z.to)} fill={z.color} />
            ))}
            <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#0a1a3d" strokeWidth={2.5} strokeLinecap="round" />
            <circle cx={cx} cy={cy} r={4} fill="#0a1a3d" />
            <text x={pt(cx, cy, r + 12, 0)[0]} y={cy + 4} fontSize="10" fill="#8494b8" textAnchor="start">0</text>
            <text x={pt(cx, cy, r + 12, 1)[0]} y={cy + 4} fontSize="10" fill="#8494b8" textAnchor="end">1</text>
          </svg>
        </div>
        <div className="-mt-1.5 font-display text-[32px] font-bold text-ink">{value.toFixed(2)}</div>
        <div className="mt-0.5 text-xs font-bold text-sev-green">{tag}</div>
      </div>
    </Panel>
  );
}
