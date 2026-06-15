/**
 * Orin.LAB · TypeScript SDK
 * Solana data fetcher and signal client for Orin.LAB agents.
 */

export interface TokenPrice {
  mint: string;
  symbol: string;
  price: number;
  timestamp: number;
}

export interface WalletInfo {
  address: string;
  balanceLamports: number;
  balanceSol: number;
}

export interface SignalResult {
  token: string;
  action: "BUY" | "SELL" | "HOLD";
  confidence: number;
  price: number;
  timestamp: number;
}

const JUPITER_API = "https://price.jup.ag/v6/price";
const SOLANA_RPC  = process.env.SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com";

export async function getTokenPrice(mint: string, symbol = mint): Promise<TokenPrice> {
  const res = await fetch(`${JUPITER_API}?ids=${mint}`);
  if (!res.ok) throw new Error(`Price fetch failed: ${res.statusText}`);
  const data = (await res.json()) as { data: Record<string, { price: number }> };
  return {
    mint,
    symbol,
    price: data.data[mint]?.price ?? 0,
    timestamp: Date.now(),
  };
}

export async function getMultiplePrices(mints: string[]): Promise<Record<string, number>> {
  const ids = mints.join(",");
  const res = await fetch(`${JUPITER_API}?ids=${ids}`);
  if (!res.ok) throw new Error(`Price fetch failed: ${res.statusText}`);
  const data = (await res.json()) as { data: Record<string, { price: number }> };
  const result: Record<string, number> = {};
  for (const mint of mints) {
    result[mint] = data.data[mint]?.price ?? 0;
  }
  return result;
}

export async function getWalletBalance(address: string): Promise<WalletInfo> {
  const res = await fetch(SOLANA_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getBalance",
      params: [address],
    }),
  });
  const data = (await res.json()) as { result: { value: number } };
  const lamports = data.result?.value ?? 0;
  return {
    address,
    balanceLamports: lamports,
    balanceSol: lamports / 1e9,
  };
}

export function generateSignal(prices: number[], token: string): SignalResult {
  if (prices.length < 3) {
    return { token, action: "HOLD", confidence: 0, price: prices.at(-1) ?? 0, timestamp: Date.now() };
  }
  const latest  = prices.at(-1)!;
  const prev    = prices.at(-2)!;
  const oldest  = prices[0];
  const change  = (latest - prev) / prev;
  const overall = (latest - oldest) / oldest;

  let action: "BUY" | "SELL" | "HOLD" = "HOLD";
  let confidence = 50;

  if (change > 0.02 && overall > 0.05) {
    action = "BUY";
    confidence = Math.min(Math.round(Math.abs(overall) * 100 + 50), 95);
  } else if (change < -0.02 && overall < -0.05) {
    action = "SELL";
    confidence = Math.min(Math.round(Math.abs(overall) * 100 + 50), 95);
  }

  return { token, action, confidence, price: latest, timestamp: Date.now() };
}

export function formatPrice(value: number): string {
  if (value >= 1_000) return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (value >= 1)     return `$${value.toFixed(4)}`;
  return `$${value.toFixed(8)}`;
}
