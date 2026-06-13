#!/usr/bin/env node
/**
 * formion-markets — every market in your terminal, one command, no API key.
 *
 *   npx github:formionai/formion-markets                 # market pulse (all markets)
 *   npx github:formionai/formion-markets crypto          # top crypto perps
 *   npx github:formionai/formion-markets solana raydium  # Solana DEX flow
 *   npx github:formionai/formion-markets predictions     # Polymarket hot markets
 *
 * Built by Formion (https://formion.ai) — the AI trading terminal.
 */
import { getCryptoMovers, type CryptoTicker } from "./crypto.ts";
import { getSolanaFlow, SOLANA_DEXES, type SolanaDex, type SolanaPool } from "./solana.ts";
import { getPredictionMarkets, type PredictionMarket } from "./predictions.ts";
import { bold, dim, cyan, magenta, gray, green, usd, pct, signed, cents, pad, clip, splitBar, rule, nowUtc } from "./format.ts";

type Args = { cmd: string; arg?: string; limit: number; watch: number | null; json: boolean; sort?: string };

function parseArgs(argv: string[]): Args {
  const a: Args = { cmd: "pulse", limit: 12, watch: null, json: false };
  const rest: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t === "--help" || t === "-h") { help(); process.exit(0); }
    else if (t === "--json") a.json = true;
    else if (t === "--watch" || t === "-w") a.watch = Number(argv[++i] ?? 20) || 20;
    else if (t === "--limit" || t === "-n") a.limit = Number(argv[++i] ?? 12) || 12;
    else if (t === "--sort") a.sort = argv[++i];
    else if (t.startsWith("-")) { console.error(`unknown flag: ${t}`); process.exit(1); }
    else rest.push(t);
  }
  const cmds = ["pulse", "crypto", "solana", "predictions", "preds"];
  if (rest[0] && cmds.includes(rest[0])) { a.cmd = rest[0] === "preds" ? "predictions" : rest[0]; a.arg = rest[1]; }
  else if (rest[0]) { a.arg = rest[0]; } // e.g. bare dex for solana shorthand
  return a;
}

function help() {
  console.log(`
${bold("formion-markets")} — every market in your terminal ${dim("(no API key)")}

${bold("USAGE")}
  npx github:formionai/formion-markets [command] [options]

${bold("COMMANDS")}
  ${cyan("pulse")}        all markets at a glance ${dim("(default)")}
  ${cyan("crypto")}       top crypto perps — price, 24h%, volume, OI, funding ${dim("(Bybit)")}
  ${cyan("solana")} [dex] Solana DEX flow + buy/sell pressure ${dim("(GeckoTerminal)")}
               dex: all · ${SOLANA_DEXES.join(" · ")}
  ${cyan("predictions")}  Polymarket hot markets — YES odds, volume ${dim("(Polymarket)")}

${bold("OPTIONS")}
  -n, --limit <n>    rows per market (default 12; pulse uses 5)
  -w, --watch <sec>  refresh every <sec> seconds
      --sort <f>     crypto: vol|chg|funding · solana: vol24|chg24|buyPressure
      --json         raw JSON (pipe to jq)
  -h, --help         this help

${bold("EXAMPLES")}
  npx github:formionai/formion-markets
  npx github:formionai/formion-markets crypto --sort funding
  npx github:formionai/formion-markets solana raydium -n 20
  npx github:formionai/formion-markets predictions --json | jq '.[0]'

${dim("Built by Formion — the AI trading terminal · https://formion.ai")}
`);
}

function head(label: string, source: string, compact = false) {
  if (compact) return [
    "",
    "  " + cyan(bold("▸ " + label)) + dim("   " + source + " · key-free"),
    "  " + rule(96),
  ].join("\n");
  return [
    "",
    "  " + magenta(bold("◆ FORMION")) + dim("  ·  ") + cyan(label),
    "  " + dim(nowUtc() + "   " + source + " · key-free"),
    "  " + rule(96),
  ].join("\n");
}
const footer = "  " + dim("Every market on one screen → ") + cyan("https://app.formion.ai");

// ── crypto ───────────────────────────────────────────────────────────────────
function renderCrypto(rows: CryptoTicker[], limit: number, compact = false): string {
  const W = { sym: 14, price: 14, chg: 10, vol: 11, oi: 11 };
  const out = [head("Crypto perps · top movers", "Bybit", compact)];
  out.push("  " +
    pad(bold("SYMBOL"), W.sym) + pad(bold("PRICE"), W.price, true) + "  " +
    pad(bold("24H%"), W.chg, true) + "  " + pad(bold("24H VOL"), W.vol, true) + "  " +
    pad(bold("OPEN INT"), W.oi, true) + "   " + bold("FUNDING"));
  for (const r of rows.slice(0, limit)) {
    out.push("  " +
      pad(cyan(clip(r.base, W.sym - 1)), W.sym) +
      pad(usd(r.priceUsd), W.price, true) + "  " +
      pad(pct(r.chg24), W.chg, true) + "  " +
      pad(bold(usd(r.vol24Usd)), W.vol, true) + "  " +
      pad(usd(r.oiUsd), W.oi, true) + "   " +
      signed(r.funding, 4, "%"));
  }
  out.push("  " + rule(96));
  if (!compact) out.push(footer, "");
  return out.join("\n");
}

// ── solana ───────────────────────────────────────────────────────────────────
function renderSolana(rows: SolanaPool[], limit: number, dex: string, compact = false): string {
  const W = { pool: 20, dex: 14, price: 13, vol: 11, liq: 10, chg: 10 };
  const label = dex === "all" ? "Solana DEX flow · trending" : `Solana DEX flow · ${dex}`;
  const out = [head(label, "GeckoTerminal", compact)];
  out.push("  " +
    pad(bold("POOL"), W.pool) + pad(bold("DEX"), W.dex) +
    pad(bold("PRICE"), W.price, true) + "  " + pad(bold("24H VOL"), W.vol, true) + "  " +
    pad(bold("LIQ"), W.liq, true) + "  " + pad(bold("24H%"), W.chg, true) + "   " + bold("BUY/SELL"));
  for (const p of rows.slice(0, limit)) {
    out.push("  " +
      pad(cyan(clip(p.pool || "?", W.pool - 1)), W.pool) +
      pad(dim(clip(p.dex, W.dex - 1)), W.dex) +
      pad(usd(p.priceUsd), W.price, true) + "  " +
      pad(bold(usd(p.vol24)), W.vol, true) + "  " +
      pad(usd(p.liq), W.liq, true) + "  " +
      pad(pct(p.chg24), W.chg, true) + "   " +
      splitBar(p.buyPressure) + " " + dim(`${p.buyPressure.toFixed(0)}%`));
  }
  out.push("  " + rule(96));
  if (!compact) out.push(footer, "");
  return out.join("\n");
}

// ── predictions ──────────────────────────────────────────────────────────────
function renderPredictions(rows: PredictionMarket[], limit: number, compact = false): string {
  const W = { q: 58, yes: 8, vol: 12 };
  const out = [head("Prediction markets · hot", "Polymarket", compact)];
  out.push("  " +
    pad(bold("MARKET"), W.q) + pad(bold("YES"), W.yes, true) + "  " +
    pad(bold("24H VOL"), W.vol, true) + "   " + bold("LIQUIDITY"));
  for (const m of rows.slice(0, limit)) {
    out.push("  " +
      pad(clip(m.question, W.q - 1), W.q) +
      pad(cents(m.yes), W.yes, true) + "  " +
      pad(bold(usd(m.vol24)), W.vol, true) + "   " +
      dim(usd(m.liquidity)));
  }
  out.push("  " + rule(96));
  if (!compact) out.push(footer, "");
  return out.join("\n");
}

// ── pulse (all markets) ──────────────────────────────────────────────────────
async function renderPulse(n: number): Promise<string> {
  const [c, s, p] = await Promise.allSettled([
    getCryptoMovers({ sort: "vol" }),
    getSolanaFlow("all"),
    getPredictionMarkets({ limit: Math.max(n, 5) }),
  ]);
  const parts: string[] = [
    "",
    "  " + magenta(bold("◆ FORMION")) + dim("  ·  ") + cyan(bold("MARKET PULSE")) + dim("  ·  every market, one terminal"),
    "  " + dim(nowUtc() + "   key-free: Bybit · GeckoTerminal · Polymarket"),
  ];
  parts.push(c.status === "fulfilled" ? renderCrypto(c.value, n, true) : "\n  " + gray("crypto unavailable: " + (c.reason?.message ?? c.reason)));
  parts.push(s.status === "fulfilled" ? renderSolana(s.value, n, "all", true) : "\n  " + gray("solana unavailable: " + (s.reason?.message ?? s.reason)));
  parts.push(p.status === "fulfilled" ? renderPredictions(p.value, n, true) : "\n  " + gray("predictions unavailable: " + (p.reason?.message ?? p.reason)));
  parts.push("", footer, "");
  return parts.join("\n");
}

// ── main ─────────────────────────────────────────────────────────────────────
async function runOnce(a: Args): Promise<void> {
  if (a.json) {
    let data: unknown;
    if (a.cmd === "crypto") data = (await getCryptoMovers({ sort: (a.sort as any) ?? "vol" })).slice(0, a.limit);
    else if (a.cmd === "solana") data = (await getSolanaFlow((a.arg as SolanaDex) ?? "all")).slice(0, a.limit);
    else if (a.cmd === "predictions") data = (await getPredictionMarkets({ limit: a.limit }));
    else data = {
      crypto: (await getCryptoMovers({ sort: "vol" })).slice(0, a.limit),
      solana: (await getSolanaFlow("all")).slice(0, a.limit),
      predictions: (await getPredictionMarkets({ limit: a.limit })),
    };
    console.log(JSON.stringify(data, null, 2));
    return;
  }
  if (a.watch !== null) process.stdout.write("\x1b[2J\x1b[H");
  let out: string;
  if (a.cmd === "crypto") out = renderCrypto(await getCryptoMovers({ sort: (a.sort as any) ?? "vol" }), a.limit);
  else if (a.cmd === "solana") out = renderSolana(await getSolanaFlow((a.arg as SolanaDex) ?? "all"), a.limit, (a.arg as string) ?? "all");
  else if (a.cmd === "predictions") out = renderPredictions(await getPredictionMarkets({ limit: a.limit }), a.limit);
  else out = await renderPulse(a.cmd === "pulse" ? Math.min(a.limit, 6) : a.limit);
  console.log(out);
  if (a.watch !== null) console.log("  " + dim(`↻ refreshing every ${a.watch}s — Ctrl-C to stop`));
}

async function main() {
  const a = parseArgs(process.argv.slice(2));
  // solana shorthand: `formion-markets raydium`
  if (a.cmd === "pulse" && a.arg && (SOLANA_DEXES as readonly string[]).includes(a.arg)) a.cmd = "solana";
  try {
    await runOnce(a);
    if (a.watch !== null) setInterval(() => runOnce(a).catch((e) => console.error(String(e?.message ?? e))), a.watch * 1000);
  } catch (e: any) {
    console.error(`\n  ✗ ${e?.message ?? e}\n  (public APIs rate-limit; try again shortly)\n`);
    process.exit(1);
  }
}
main();
