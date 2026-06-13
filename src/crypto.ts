/** Crypto perp market movers via Bybit's public v5 API (no key). */
const BYBIT = "https://api.bybit.com/v5/market/tickers?category=linear";

export type CryptoTicker = {
  symbol: string; base: string;
  priceUsd: number | null;
  chg24: number | null;      // 24h price change (%)
  vol24Usd: number | null;   // 24h turnover (USD)
  oiUsd: number | null;      // open interest (USD)
  funding: number | null;    // funding rate (%)
};

function num(v: unknown): number | null {
  const n = typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? n : null;
}

export type GetCryptoOptions = {
  /** "vol" (default) | "chg" | "funding" */
  sort?: "vol" | "chg" | "funding";
  /** only USDT perps (default true) */
  usdtOnly?: boolean;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

export async function getCryptoMovers(opts: GetCryptoOptions = {}): Promise<CryptoTicker[]> {
  const f = opts.fetchImpl ?? fetch;
  const res = await f(BYBIT, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(opts.timeoutMs ?? 9000) });
  if (!res.ok) throw new Error(`Bybit HTTP ${res.status}`);
  const json = await res.json();
  const list: any[] = json?.result?.list ?? [];
  let rows: CryptoTicker[] = list.map((t) => {
    const symbol: string = t.symbol ?? "";
    const base = symbol.replace(/USDT$|USDC$|PERP$/i, "");
    const chgRaw = num(t.price24hPcnt);
    const fundRaw = num(t.fundingRate);
    return {
      symbol, base,
      priceUsd: num(t.lastPrice),
      chg24: chgRaw === null ? null : chgRaw * 100,
      vol24Usd: num(t.turnover24h),
      oiUsd: num(t.openInterestValue),
      funding: fundRaw === null ? null : fundRaw * 100,
    };
  });
  if (opts.usdtOnly !== false) rows = rows.filter((r) => r.symbol.endsWith("USDT"));
  const sort = opts.sort ?? "vol";
  const key = (r: CryptoTicker) => sort === "chg" ? (r.chg24 ?? -Infinity)
    : sort === "funding" ? Math.abs(r.funding ?? 0)
    : (r.vol24Usd ?? -Infinity);
  return rows.sort((a, b) => key(b) - key(a));
}
