import type { Timestamp } from "@/backend";

/**
 * Convert a Motoko `Time.now()` nanosecond bigint into a JS Date.
 * Returns null when the value cannot be represented as a valid date.
 */
export function timestampToDate(timestamp: Timestamp): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Format a backend timestamp as a short French date, e.g. "6 oct. 2026". */
export function formatDate(timestamp: Timestamp): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/** Format a backend timestamp as a relative French label, e.g. "il y a 2 h". */
export function formatRelative(timestamp: Timestamp): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 30) return `il y a ${days} j`;
  return formatDate(timestamp);
}

/** Format a bigint mastery rate (0–100) as a percentage string. */
export function formatPercent(value: bigint): string {
  return `${Number(value)} %`;
}

/** Format a bigint point total with French thousands separators. */
export function formatPoints(value: bigint): string {
  return new Intl.NumberFormat("fr-FR").format(Number(value));
}

/** Format a duration in seconds as mm:ss. */
export function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/** Format a duration in minutes as a compact French label, e.g. "15 min". */
export function formatMinutes(minutes: bigint): string {
  return `${Number(minutes)} min`;
}

/** Clamp a number into the inclusive [min, max] range. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
