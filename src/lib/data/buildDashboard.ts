import type {
  DashboardData,
  StoredApp,
  AppHealthRow,
  HealthStatus,
  SloCompliance,
  AlertItem,
  Severity,
  TimeSeries,
  InfraMetric,
  SlowTransaction,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Build a DashboardData payload from the REAL stored applications so every
// page reflects the selected tier + tower.
//
// The CSV has no health telemetry, so per-app metrics are SYNTHESIZED
// deterministically (seeded by app name, biased by tier). This is a
// placeholder — swap `synthHealth` for a real health-check lookup when the
// live source is available; the aggregation below stays the same.
// ---------------------------------------------------------------------------

/** Deterministic 0..1 PRNG seeded by a string (mulberry32 over an FNV-ish hash). */
function rng(seedStr: string): () => number {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const TIER_BASE: Record<string, { av: number; err: number; lat: number }> = {
  Gold: { av: 99.95, err: 0.15, lat: 180 },
  Silver: { av: 99.85, err: 0.3, lat: 260 },
  Bronze: { av: 99.6, err: 0.6, lat: 360 },
  Tin: { av: 99.2, err: 1.0, lat: 460 },
  "": { av: 99.5, err: 0.7, lat: 400 },
};

interface Synth {
  name: string;
  av: number;
  slo: number;
  err: number;
  lat: number;
  status: HealthStatus;
  incidents: number;
  deployments: number;
}

function synthHealth(app: StoredApp): Synth {
  const b = TIER_BASE[app.tier] ?? TIER_BASE[""];
  const r = rng(app.name || app.businessCriticality || "app");
  const av = +(b.av - r() * 0.45).toFixed(2);
  const err = +(b.err + r() * 0.4).toFixed(2);
  const lat = Math.round(b.lat + r() * 130);
  const slo = +(av - r() * 1.2).toFixed(1);
  const status: HealthStatus =
    av >= 99.9 && err < 0.4 ? "Healthy" : av >= 99.5 ? "Warning" : "Critical";
  const incidents = Math.floor(r() * (app.tier === "Gold" ? 2 : app.tier === "Silver" ? 3 : 4));
  const deployments = Math.floor(r() * 4);
  return { name: app.name, av, slo, err, lat, status, incidents, deployments };
}

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const scaleSpark = (spark: number[], f: number) => spark.map((v) => Math.max(0, Math.round(v * f)));
const num = (s: string) => parseFloat(s.replace(/[^0-9.]/g, "")) || 0;

/** Build a 7-point time series centred on `center` with deterministic wiggle. */
function genSeries(baseSeries: TimeSeries, center: number, wiggle: number, seedStr: string): TimeSeries {
  const r = rng(seedStr);
  const lo = baseSeries.min ?? 0;
  const hi = baseSeries.max ?? center * 2;
  return {
    ...baseSeries,
    points: baseSeries.points.map((p) => ({
      t: p.t,
      value: +clamp(center + (r() - 0.5) * 2 * wiggle, lo, hi).toFixed(2),
    })),
  };
}

/**
 * @param apps      the selected applications (already tier/tower-filtered)
 * @param base      the mock dashboard, used for series/labels/shape scaffolding
 * @param fraction  selected.length / totalInventory — used to scale fleet counts
 * @param seedKey   selection key (e.g. "Gold|WAMS") to seed selection-stable noise
 */
export function buildDashboardFromApps(
  apps: StoredApp[],
  base: DashboardData,
  fraction: number,
  seedKey: string,
): DashboardData {
  const synth = apps.map(synthHealth);

  const avAvg = avg(synth.map((s) => s.av)) || 99.5;
  const sloAvg = avg(synth.map((s) => s.slo)) || 98;
  const errAvg = avg(synth.map((s) => s.err)) || 0.4;
  const latAvg = avg(synth.map((s) => s.lat)) || 300;
  const totalIncidents = synth.reduce((a, s) => a + s.incidents, 0);
  const totalDeploys = synth.reduce((a, s) => a + s.deployments, 0);

  // Worst performers drive the per-app widgets (kept short for readability).
  const worst = [...synth].sort((a, b) => a.av - b.av).slice(0, 8);

  const health: AppHealthRow[] = worst.map((s) => ({
    app: s.name,
    availability: `${s.av.toFixed(2)}%`,
    slo: `${s.slo.toFixed(1)}%`,
    errorRate: `${s.err.toFixed(2)}%`,
    p95Latency: `${s.lat} ms`,
    status: s.status,
  }));

  const slo: SloCompliance[] = worst.map((s) => ({ name: s.name, value: s.slo }));

  const kpis = base.kpis.map((k) => {
    switch (k.key) {
      case "apps":
        return { ...k, value: String(apps.length), delta: `${apps.length} selected`, spark: scaleSpark(k.spark, fraction) };
      case "avail":
        return { ...k, value: `${avAvg.toFixed(2)}%` };
      case "slo":
        return { ...k, value: `${sloAvg.toFixed(1)}%` };
      case "err":
        return { ...k, value: `${errAvg.toFixed(2)}%` };
      case "lat":
        return { ...k, value: `${Math.round(latAvg)} ms` };
      case "inc":
        return { ...k, value: String(totalIncidents), spark: scaleSpark(k.spark, fraction) };
      case "dep":
        return { ...k, value: String(totalDeploys), spark: scaleSpark(k.spark, fraction) };
      default:
        return k;
    }
  });

  // Trends centred on the selection's computed averages so Availability /
  // Performance / Error pages move with the selection.
  const availability = genSeries(base.availability, avAvg, 0.3, `av:${seedKey}`);
  const errorRate = genSeries(base.errorRate, errAvg, Math.max(0.15, errAvg * 0.5), `er:${seedKey}`);
  const latency = genSeries(base.latency, latAvg, latAvg * 0.15, `lt:${seedKey}`);

  // Incidents scaled by the tier's share of the fleet.
  const incidentsBySeverity = base.incidentsBySeverity.map((b) => ({ ...b, count: Math.round(b.count * fraction) }));
  const incidentsTotal = incidentsBySeverity.reduce((a, b) => a + b.count, 0);
  const denom = incidentsTotal || 1;
  incidentsBySeverity.forEach((b) => (b.pct = `${((b.count / denom) * 100).toFixed(1)}%`));
  const incidentsOverTime = base.incidentsOverTime.map((p) => ({
    t: p.t,
    P1: Math.round(p.P1 * fraction),
    P2: Math.round(p.P2 * fraction),
    P3: Math.round(p.P3 * fraction),
    P4: Math.round(p.P4 * fraction),
  }));

  const errorTypes = base.errorTypes.map((e) => ({
    ...e,
    count: Math.round(num(e.count) * fraction).toLocaleString("en-US"),
  }));

  // Infrastructure utilisation — deterministic per selection, biased by fleet size.
  const ir = rng(`infra:${seedKey}`);
  const infra: InfraMetric[] = base.infra.map((m) => {
    const isNet = /mbps/i.test(m.value);
    if (isNet) {
      const v = Math.round(clamp(180 + fraction * 220 + (ir() - 0.5) * 80, 60, 900));
      return { ...m, value: `${v} Mbps`, spark: m.spark.map(() => Math.round(v * (0.85 + ir() * 0.3))) };
    }
    const v = Math.round(clamp(38 + fraction * 34 + (ir() - 0.5) * 18, 15, 96));
    return { ...m, value: `${v}%`, spark: m.spark.map(() => Math.round(clamp(v * (0.9 + ir() * 0.2), 5, 99))) };
  });

  // Change failure rate derived from the selection's error profile.
  const cfrVal = +clamp(errAvg * 8, 0.5, base.changeFailureRate.series.max ?? 10).toFixed(1);
  const changeFailureRate = {
    value: `${cfrVal}%`,
    delta: base.changeFailureRate.delta,
    series: genSeries(base.changeFailureRate.series, cfrVal, Math.max(0.8, cfrVal * 0.35), `cfr:${seedKey}`),
  };

  // Slow transactions scaled by how the selection's latency compares to nominal.
  const latRatio = clamp(latAvg / 312, 0.4, 2.5);
  const slowTransactions: SlowTransaction[] = base.slowTransactions.map((t) => ({
    ...t,
    p95: `${(num(t.p95) * latRatio).toFixed(2)} s`,
  }));

  // Alerts synthesized from the least-healthy selected apps.
  const alerts: AlertItem[] = worst
    .filter((s) => s.status !== "Healthy")
    .slice(0, 5)
    .map((s, i) => ({
      id: `al${i}`,
      severity: (s.status === "Critical" ? "P1" : "P2") as Severity,
      text:
        s.status === "Critical"
          ? `${s.name}: availability ${s.av.toFixed(2)}% (below target)`
          : `${s.name}: P95 latency ${s.lat} ms / error rate ${s.err.toFixed(2)}%`,
      time: `${(i + 1) * 7}m ago`,
    }));

  const apdex = +clamp((avAvg - 98) / 2 - errAvg * 0.05, 0.6, 0.99).toFixed(2);

  return {
    ...base,
    kpis,
    slo,
    health,
    availability,
    errorRate,
    latency,
    incidentsBySeverity,
    incidentsTotal,
    incidentsOverTime,
    errorTypes,
    infra,
    apdex,
    slowTransactions,
    changeFailureRate,
    alerts: alerts.length ? alerts : base.alerts.slice(0, 1),
  };
}
