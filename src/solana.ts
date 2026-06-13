/** Solana DEX flow via GeckoTerminal's public API (no key). */
const GT = "https://api.geckoterminal.com/api/v2";

export const SOLANA_DEXES = [
  "raydium", "orca", "meteora", "pumpswap", "raydium-clmm", "meteora-damm-v2",
] as const;
export type SolanaDex = (typeof SOLANA_DEXES)[number] | "all";

export type SolanaPool = {
  pool: string; poolAddress: string; dex: string; base: string; quote: string;
  priceUsd: number | null; vol24: number | null; liq: number | null;
  chg24: number | null; buys24: number; sells24: number;
  buyPressure: number; fdv: number | null; geckoUrl: string;
};

function num(v: unknown): number | null {
  const n = typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? n : null;
}

function mapPool(p: any): SolanaPool {
  const a = p?.attributes ?? {};
  const name: string = a.name ?? "";
  const [base, quote] = name.split("/").map((s: string) => s.trim());
  const tx = a.transactions?.h24 ?? {};
  const buys = Number(tx.buys ?? 0), sells = Number(tx.sells ?? 0);
  const flow = buys + sells;
  return {
    pool: name, poolAddress: a.address ?? "",
    dex: p?.relationships?.dex?.data?.id ?? "",
    base: base || name, quote: quote || "",
    priceUsd: num(a.base_token_price_usd),
    vol24: num(a.volume_usd?.h24), liq: num(a.reserve_in_usd),
    chg24: num(a.price_change_percentage?.h24),
    buys24: buys, sells24: sells,
    buyPressure: flow > 0 ? (buys / flow) * 100 : 50,
    fdv: num(a.fdv_usd),
    geckoUrl: a.address ? `https://www.geckoterminal.com/solana/pools/${a.address}` : "",
  };
}

export async function getSolanaFlow(dex: SolanaDex = "all", opts: { timeoutMs?: number; fetchImpl?: typeof fetch } = {}): Promise<SolanaPool[]> {
  const f = opts.fetchImpl ?? fetch;
  const url = dex === "all"
    ? `${GT}/networks/solana/trending_pools?page=1`
    : `${GT}/networks/solana/dexes/${dex}/pools?page=1&sort=h24_volume_usd_desc`;
  const res = await f(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(opts.timeoutMs ?? 9000) });
  if (!res.ok) throw new Error(`GeckoTerminal HTTP ${res.status}`);
  const json = await res.json();
  return (json?.data ?? []).map(mapPool).filter((p: SolanaPool) => p.poolAddress);
}
