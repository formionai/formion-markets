/**
 * formion-markets — key-free clients for live multi-market data.
 * Crypto perps (Bybit), Solana DEX flow (GeckoTerminal), prediction markets (Polymarket).
 * No API key required. Built by Formion (https://formion.ai).
 */
export { getCryptoMovers, type CryptoTicker, type GetCryptoOptions } from "./crypto.ts";
export { getSolanaFlow, SOLANA_DEXES, type SolanaDex, type SolanaPool } from "./solana.ts";
export { getPredictionMarkets, type PredictionMarket } from "./predictions.ts";
