/** Prediction markets via Polymarket's public Gamma API (no key). */
const GAMMA = "https://gamma-api.polymarket.com/markets";

export type PredictionMarket = {
  question: string;
  yes: number | null;        // YES probability 0..1
  vol24: number | null;      // 24h volume (USD)
  liquidity: number | null;  // USD
  url: string;
};

function num(v: unknown): number | null {
  const n = typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? n : null;
}

function firstPrice(outcomePrices: unknown): number | null {
  try {
    const arr = typeof outcomePrices === "string" ? JSON.parse(outcomePrices) : outcomePrices;
    if (Array.isArray(arr) && arr.length) return num(arr[0]);
  } catch { /* ignore */ }
  return null;
}

export async function getPredictionMarkets(opts: { limit?: number; timeoutMs?: number; fetchImpl?: typeof fetch } = {}): Promise<PredictionMarket[]> {
  const f = opts.fetchImpl ?? fetch;
  const limit = opts.limit ?? 25;
  const url = `${GAMMA}?closed=false&active=true&limit=${limit}&order=volume24hr&ascending=false`;
  const res = await f(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(opts.timeoutMs ?? 9000) });
  if (!res.ok) throw new Error(`Polymarket HTTP ${res.status}`);
  const arr: any[] = await res.json();
  return (arr ?? []).map((m) => ({
    question: m.question ?? m.title ?? "?",
    yes: firstPrice(m.outcomePrices),
    vol24: num(m.volume24hr),
    liquidity: num(m.liquidity),
    url: m.slug ? `https://polymarket.com/event/${m.slug}` : "https://polymarket.com",
  }));
}
