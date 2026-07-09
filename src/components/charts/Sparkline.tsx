"use client";

import { useId } from "react";

/**
 * Dependency-free sparkline. Renders a filled area + line via a viewBox SVG
 * that scales to its container (preserveAspectRatio="none").
 */
export function Sparkline({
  data,
  color,
  dots = false,
  strokeWidth = 1.7,
  height = 34,
}: {
  data: number[];
  color: string;
  dots?: boolean;
  strokeWidth?: number;
  height?: number;
}) {
  const gid = useId();
  const W = 100;
  const H = 40;
  const pad = 3;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = pad + (H - pad * 2) - ((v - min) / range) * (H - pad * 2);
    return [x, y] as const;
  });
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(" ");
  const area = `${line} L${W},${H} L0,${H} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height }}
      role="img"
      aria-hidden
    >
      <defs>
        <linearGradient id={`sg-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${gid})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {dots &&
        pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={1} fill={color} vectorEffect="non-scaling-stroke" />
        ))}
    </svg>
  );
}
