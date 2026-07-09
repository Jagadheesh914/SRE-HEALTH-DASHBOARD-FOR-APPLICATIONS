import { promises as fs } from "fs";
import path from "path";
import type { Tier, StoredApp } from "@/lib/types";

// ---------------------------------------------------------------------------
// Server-side loader for the stored inventory (data/applications.csv).
// Shared by /api/applications and /api/health so both read one source.
// ---------------------------------------------------------------------------

const CRIT_TO_TIER: Record<string, Tier> = {
  "1 - Gold": "Gold",
  "2 - Silver": "Silver",
  "3 - Bronze": "Bronze",
};

/** Minimal RFC-4180 CSV parser (handles quoted fields, embedded commas/quotes/newlines). */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") {
      field += c;
    }
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

export async function loadApplications(): Promise<StoredApp[]> {
  const file = path.join(process.cwd(), "data", "applications.csv");
  const text = await fs.readFile(file, "utf8");
  const rows = parseCsv(text).filter((r) => r.some((c) => c.trim() !== ""));
  if (rows.length === 0) return [];
  const header = rows[0].map((h) => h.trim());
  const iName = header.indexOf("Name");
  const iCrit = header.indexOf("Business criticality");
  const iTower = header.indexOf("Tower");
  return rows
    .slice(1)
    .map((r) => {
      const crit = (r[iCrit] ?? "").trim();
      return {
        name: (r[iName] ?? "").trim(),
        businessCriticality: crit,
        tier: CRIT_TO_TIER[crit] ?? "",
        tower: (r[iTower] ?? "").trim(),
      } as StoredApp;
    })
    .filter((a) => a.name);
}
