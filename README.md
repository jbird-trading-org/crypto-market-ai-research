# Crypto Market AI Research

TypeScript-based crypto market research toolkit with AI signal generation and Redis-backed caching.

## Features

- **Technical Analysis** — RSI, MACD, Bollinger Bands, EMA, ATR (pure TypeScript)
- **Redis Cache** — `ioredis-os` with in-memory fallback when Redis is unavailable
- **Rate Limiter** — sliding-window API throttling
- **Solana SDK** — price and wallet data fetcher

## Quickstart

```bash
git clone https://github.com/jbird-trading-org/crypto-market-ai-research.git
cd crypto-market-ai-research
npm install
cp .env.example .env
npm run build
npm test
npm run test:pipeline
```

## Redis

Set `REDIS_URL` or `REDIS_HOST` in `.env`. When Redis is down or unset, the cache falls back to in-memory storage.

```bash
npm run redis:health
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript |
| `npm test` | Run vitest suite |
| `npm run test:pipeline` | End-to-end smoke test |
| `npm run redis:health` | Check Redis connectivity |

## License

MIT
