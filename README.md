<div align="center">

<img src="https://raw.githubusercontent.com/formionai/formion-markets/main/assets/banner.png" alt="formion-markets" width="100%" />

# formion-markets

**Every market in your terminal — no API key.**

[![Try it](https://img.shields.io/badge/npx-run_it_now-CB3837?logo=npm&logoColor=white)](#-try-it-now-no-install-no-key)
[![No API key](https://img.shields.io/badge/API_key-not_required-22c55e)](#)
[![Node](https://img.shields.io/badge/node-%E2%89%A518-339933?logo=node.js&logoColor=white)](#)
[![Zero deps](https://img.shields.io/badge/runtime_deps-0-blue)](#)
[![License](https://img.shields.io/badge/license-MIT-555)](LICENSE)
[![Formion](https://img.shields.io/badge/by-Formion-7c3aed)](https://formion.ai)

</div>

One command, no key, and you get **crypto perps, Solana DEX flow, and prediction markets** side by side in your terminal — the cross-market view most tools silo. Wraps three public APIs (Bybit, GeckoTerminal, Polymarket), zero runtime dependencies.

## ⚡ Try it now (no install, no key)

```bash
npx github:formionai/formion-markets
```

```
  ◆ FORMION  ·  MARKET PULSE  ·  every market, one terminal
  2026-06-13 08:58:22 UTC   key-free: Bybit · GeckoTerminal · Polymarket

  ▸ Crypto perps · top movers   Bybit · key-free
  ──────────────────────────────────────────────────────────────────────
  SYMBOL                 PRICE        24H%      24H VOL     OPEN INT   FUNDING
  BTC                   $63.8K       +0.5%       $3.49B       $3.37B   +0.0051%
  ETH                    $1.7K       +0.1%       $1.59B       $1.38B   +0.0098%
  SOL                   $67.34       +0.6%     $582.77M     $496.27M   -0.0017%
  HYPE                  $58.98       +0.8%     $359.62M     $199.85M   -0.0041%

  ▸ Solana DEX flow · trending   GeckoTerminal · key-free
  ──────────────────────────────────────────────────────────────────────
  POOL                DEX                PRICE     24H VOL       LIQ      24H%   BUY/SELL
  TRUMP / USDC        meteora            $2.18    $10.02M    $37.61M    +15.5%   █████░░░░░ 48%
  SPCX / SOL          pumpswap        $0.00103     $3.31M    $124.2K    -80.3%   ██████░░░░ 56%

  ▸ Prediction markets · hot   Polymarket · key-free
  ──────────────────────────────────────────────────────────────────────
  MARKET                                                 YES     24H VOL   LIQUIDITY
  Will USA win the 2026 FIFA World Cup?                   2¢      $8.05M   $4.21M
  Will Czechia win the 2026 FIFA World Cup?              0¢      $4.59M   $12.54M

  Every market on one screen → https://app.formion.ai
```

## Commands

```bash
npx github:formionai/formion-markets                 # market pulse — all markets
npx github:formionai/formion-markets crypto          # top crypto perps (price, 24h%, vol, OI, funding)
npx github:formionai/formion-markets crypto --sort funding   # funding-rate extremes
npx github:formionai/formion-markets solana raydium  # Solana DEX flow for one DEX
npx github:formionai/formion-markets predictions     # Polymarket hot markets
npx github:formionai/formion-markets --watch 20      # live, refresh every 20s
npx github:formionai/formion-markets crypto --json | jq '.[0]'
```

| command | source | shows |
|---|---|---|
| `pulse` *(default)* | all three | a slice of every market on one screen |
| `crypto` | Bybit (public) | top USDT perps — price, 24h %, 24h volume, open interest, funding |
| `solana [dex]` | GeckoTerminal | trending / per-DEX pools — volume, liquidity, 24h %, buy/sell pressure |
| `predictions` | Polymarket | hottest markets — YES odds, 24h volume, liquidity |

Flags: `-n/--limit`, `-w/--watch <sec>`, `--sort`, `--json`, `-h/--help`.

## 📦 Use it as a library

```bash
npm i github:formionai/formion-markets
```

```ts
import { getCryptoMovers, getSolanaFlow, getPredictionMarkets } from "formion-markets";

const movers = await getCryptoMovers({ sort: "funding" }); // Bybit perps
const pools  = await getSolanaFlow("raydium");             // Solana DEX flow
const preds  = await getPredictionMarkets({ limit: 10 });  // Polymarket
```

Runs anywhere with global `fetch` + `AbortSignal.timeout` — Node 18+, Bun, Deno. Pass `{ fetchImpl }` otherwise. Zero runtime dependencies.

## 🧠 Build ideas

- A morning "market pulse" cron that posts the table to Slack/Telegram
- Alert when crypto funding flips extreme **and** a correlated prediction market moves
- Pipe `--json` into your own dashboard or screener
- Compare on-chain (Solana DEX) flow vs CEX perp volume for the same token

## Rate limits

All three APIs are public and rate-limit politely (GeckoTerminal ~30 req/min). Cache server-side for anything public-facing — don't call from every browser client.

## Why this exists

Real traders watch more than one market — but the tools are siloed: a CEX tab, a DEX tab, a prediction-markets tab, none aware of the others. `formion-markets` is a tiny taste of **[Formion](https://formion.ai)** — the AI trading terminal that puts **every market on one screen** (CEX, DEX, perps, prediction markets, options/GEX, equities, FX) with an AI co-pilot and live, cost-verified engines. PRs welcome.

> **Want the full picture?** Formion turns this raw cross-market data into AI signals, alerts, backtests and one-click automation → **[app.formion.ai](https://app.formion.ai)**

## License

MIT © 2026 [Formion](https://formion.ai)
