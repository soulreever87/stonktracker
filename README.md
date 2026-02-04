# StonkTracker

StonkTracker is a Next.js stock tracker that pulls live quote snapshots from the Yahoo Finance quote API. It groups tickers by the AI supply chain categories you requested, and lets you add or remove tickers manually.

## Features
- Preloaded categories for the AI supply chain (raw materials through software models).
- Yahoo Finance quote snapshots (price, change, market time).
- Manual add/remove tickers per category stored in browser localStorage.

## Development
```bash
npm install
npm run dev
```

## Deployment
Deploy with Vercel by importing the repository and using the default Next.js build settings.

> **Note**: Yahoo Finance is an unofficial API. If you hit rate limits or CORS restrictions, you may need to proxy requests through a backend.
