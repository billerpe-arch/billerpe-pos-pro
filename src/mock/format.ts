export const inr = (value: number, opts: { decimals?: boolean } = {}) =>
  `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: opts.decimals ? 2 : 0,
    maximumFractionDigits: opts.decimals ? 2 : 0,
  })}`;

export const compactInr = (value: number) =>
  value >= 100000
    ? `₹${(value / 100000).toFixed(2)}L`
    : value >= 1000
      ? `₹${(value / 1000).toFixed(1)}K`
      : `₹${value}`;

export const todayLabel = "18/08/2026";

export function nowStamp() {
  const d = new Date();
  const hh = d.getHours() % 12 || 12;
  const mm = `${d.getMinutes()}`.padStart(2, "0");
  const ap = d.getHours() >= 12 ? "pm" : "am";
  return `${todayLabel} ${`${hh}`.padStart(2, "0")}:${mm} ${ap}`;
}

export function elapsedFrom(stamp: string) {
  const m = stamp.match(/(\d{2}):(\d{2})\s?(am|pm)/i);
  if (!m) return "—";
  let h = Number(m[1] ?? 0) % 12;
  if ((m[3] ?? "").toLowerCase() === "pm") h += 12;
  const then = h * 60 + Number(m[2] ?? 0);
  const base = 20 * 60 + 15; // demo "now" = 08:15 pm
  const diff = Math.max(0, base - then);
  return diff >= 60 ? `${Math.floor(diff / 60)}h ${diff % 60}m` : `${diff}m`;
}

export function elapsedMinutes(stamp: string) {
  const m = stamp.match(/(\d{2}):(\d{2})\s?(am|pm)/i);
  if (!m) return 0;
  let h = Number(m[1] ?? 0) % 12;
  if ((m[3] ?? "").toLowerCase() === "pm") h += 12;
  const base = 20 * 60 + 15;
  return Math.max(0, base - (h * 60 + Number(m[2] ?? 0)));
}

export function pct(part: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}
