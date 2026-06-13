/** Shared zero-dependency formatting + ANSI helpers. */

export const useColor = process.stdout.isTTY && process.env.NO_COLOR === undefined;
const wrap = (code: string) => (s: string | number) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : String(s));
export const dim = wrap("2"), bold = wrap("1"), green = wrap("32"), red = wrap("31"),
  cyan = wrap("36"), yellow = wrap("33"), magenta = wrap("35"), gray = wrap("90"), blue = wrap("34");

export function usd(n: number | null): string {
  if (n === null || !Number.isFinite(n)) return "—";
  const a = Math.abs(n);
  if (a >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (a >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (a >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  if (a >= 1) return `$${n.toFixed(2)}`;
  if (a > 0) return `$${n.toPrecision(3)}`;
  return "$0";
}

export function pct(n: number | null): string {
  if (n === null || !Number.isFinite(n)) return dim("—");
  const sign = n >= 0 ? "+" : "";
  const a = Math.abs(n);
  const s = a >= 10000 ? `${sign}${Math.round(n / 1000)}k%`
    : a >= 1000 ? `${sign}${Math.round(n)}%`
    : `${sign}${n.toFixed(1)}%`;
  return n > 0 ? green(s) : n < 0 ? red(s) : dim(s);
}

/** signed funding/number with explicit color, fixed decimals */
export function signed(n: number | null, decimals = 4, suffix = "%"): string {
  if (n === null || !Number.isFinite(n)) return dim("—");
  const s = `${n >= 0 ? "+" : ""}${n.toFixed(decimals)}${suffix}`;
  return n > 0 ? green(s) : n < 0 ? red(s) : dim(s);
}

/** probability 0..1 → "62¢" style with heat color */
export function cents(p: number | null): string {
  if (p === null || !Number.isFinite(p)) return dim("—");
  const c = Math.round(p * 100);
  const s = `${c}¢`;
  return c >= 60 ? green(s) : c <= 40 ? red(s) : yellow(s);
}

/** strip ANSI for width math */
const visLen = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, "").length;

export function pad(s: string, w: number, right = false): string {
  const gap = Math.max(0, w - visLen(s));
  return right ? " ".repeat(gap) + s : s + " ".repeat(gap);
}

export function clip(s: string, w: number): string {
  return s.length <= w ? s : s.slice(0, Math.max(0, w - 1)) + "…";
}

/** 10-cell split bar, green left vs red right (readable without color) */
export function splitBar(pct0to100: number, cells = 10): string {
  const left = Math.max(0, Math.min(cells, Math.round((pct0to100 / 100) * cells)));
  return green("█".repeat(left)) + red("░".repeat(cells - left));
}

export function rule(width = 92): string { return gray("─".repeat(width)); }

export const nowUtc = () => new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC";
