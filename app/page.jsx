"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const YAHOO_QUOTE_URL = "https://query1.finance.yahoo.com/v7/finance/quote?symbols=";
const STORAGE_KEY = "stonktracker.categories";

const defaultCategories = [
  {
    name: "Raw Materials",
    description: "Rare earths, copper, silicon, uranium",
    tickers: [
      { symbol: "MP", label: "MP Materials" },
      { symbol: "FCX", label: "Freeport-McMoRan" },
      { symbol: "SQM", label: "SQM (Lithium & Industrial Minerals)" },
      { symbol: "CCJ", label: "Cameco" }
    ]
  },
  {
    name: "Semiconductor Equipment",
    description: "Lithography, deposition, etching",
    tickers: [
      { symbol: "ASML", label: "ASML" },
      { symbol: "AMAT", label: "Applied Materials" },
      { symbol: "LRCX", label: "Lam Research" }
    ]
  },
  {
    name: "Foundries",
    description: "Chip manufacturing",
    tickers: [
      { symbol: "TSM", label: "TSMC" },
      { symbol: "UMC", label: "UMC" },
      { symbol: "GFS", label: "GlobalFoundries" }
    ]
  },
  {
    name: "Memory & Storage",
    description: "DRAM, NAND, HBM",
    tickers: [
      { symbol: "MU", label: "Micron" },
      { symbol: "WDC", label: "Western Digital" },
      { symbol: "STX", label: "Seagate" },
      { symbol: "SKM", label: "SK hynix" }
    ]
  },
  {
    name: "Processors",
    description: "GPUs, TPUs, AI accelerators",
    tickers: [
      { symbol: "NVDA", label: "NVIDIA" },
      { symbol: "AMD", label: "AMD" },
      { symbol: "AVGO", label: "Broadcom" },
      { symbol: "QCOM", label: "Qualcomm" }
    ]
  },
  {
    name: "Networking",
    description: "Data center interconnects",
    tickers: [
      { symbol: "ANET", label: "Arista Networks" },
      { symbol: "CSCO", label: "Cisco" },
      { symbol: "MRVL", label: "Marvell" }
    ]
  },
  {
    name: "Energy Infrastructure",
    description: "Power generation and transmission",
    tickers: [
      { symbol: "NEE", label: "NextEra Energy" },
      { symbol: "DUK", label: "Duke Energy" },
      { symbol: "ETR", label: "Entergy" }
    ]
  },
  {
    name: "Data Centers",
    description: "Cloud compute facilities",
    tickers: [
      { symbol: "EQIX", label: "Equinix" },
      { symbol: "DLR", label: "Digital Realty" },
      { symbol: "AMZN", label: "Amazon (AWS)" },
      { symbol: "MSFT", label: "Microsoft (Azure)" }
    ]
  },
  {
    name: "Software and Models",
    description: "AI frameworks, foundation models, applications, agents",
    tickers: [
      { symbol: "GOOGL", label: "Alphabet" },
      { symbol: "META", label: "Meta" },
      { symbol: "MSFT", label: "Microsoft" },
      { symbol: "NOW", label: "ServiceNow" }
    ]
  }
];

const formatChange = (value, percent) => {
  if (value === null || value === undefined) return "--";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)} (${sign}${(percent * 100).toFixed(2)}%)`;
};

const formatTime = (timestamp) => {
  if (!timestamp) return "--";
  return new Date(timestamp * 1000).toLocaleString();
};

const fetchQuotes = async (symbols) => {
  if (!symbols.length) return [];
  const url = `${YAHOO_QUOTE_URL}${symbols.join(",")}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch quotes");
  }
  const data = await response.json();
  return data.quoteResponse?.result ?? [];
};

export default function Home() {
  const [categories, setCategories] = useState(defaultCategories);
  const [quotesBySymbol, setQuotesBySymbol] = useState({});
  const [status, setStatus] = useState("Ready");
  const [symbolInput, setSymbolInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCategories(parsed);
        }
      } catch (error) {
        console.error("Failed to parse saved categories", error);
      }
    }
    hasLoaded.current = true;
  }, []);

  useEffect(() => {
    if (!hasLoaded.current) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  }, [categories]);

  const helpText = useMemo(() => {
    return categories
      .map((category) => `${category.name}: ${category.tickers.map((t) => t.symbol).join(", ")}`)
      .join(" · ");
  }, [categories]);

  const updateCategoryQuotes = async (category) => {
    const symbols = category.tickers.map((ticker) => ticker.symbol);
    if (!symbols.length) return;

    setStatus(`Loading ${category.name}...`);

    try {
      const quotes = await fetchQuotes(symbols);
      const nextQuotes = quotes.reduce((acc, quote) => {
        acc[quote.symbol] = quote;
        return acc;
      }, {});

      setQuotesBySymbol((prev) => ({ ...prev, ...nextQuotes }));
      setStatus(`Updated ${category.name}`);
    } catch (error) {
      console.error(error);
      setStatus(`Failed to load ${category.name}`);
    }
  };

  const addTicker = (event) => {
    event.preventDefault();
    const rawSymbol = symbolInput.trim();

    if (!rawSymbol || !selectedCategory) {
      setStatus("Enter a ticker and select a category.");
      return;
    }

    const symbol = rawSymbol.toUpperCase();

    setCategories((prev) =>
      prev.map((category) => {
        if (category.name !== selectedCategory) return category;
        if (category.tickers.some((ticker) => ticker.symbol === symbol)) {
          setStatus(`${symbol} already exists in ${category.name}`);
          return category;
        }
        setStatus(`${symbol} added to ${category.name}`);
        return {
          ...category,
          tickers: [...category.tickers, { symbol, label: symbol }]
        };
      })
    );

    setSymbolInput("");
  };

  const removeTicker = (categoryName, symbol) => {
    setCategories((prev) =>
      prev.map((category) => {
        if (category.name !== categoryName) return category;
        return {
          ...category,
          tickers: category.tickers.filter((ticker) => ticker.symbol !== symbol)
        };
      })
    );
  };

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1>StonkTracker</h1>
          <p>Yahoo Finance powered stock snapshots by category.</p>
        </div>
        <div className="status" role="status">
          {status}
        </div>
      </header>

      <section className="card">
        <h2>Manage your watchlist</h2>
        <p>
          Add or remove tickers below to customize the data pulled from Yahoo Finance. Tickers are
          stored locally in your browser.
        </p>
        <form className="ticker-form" onSubmit={addTicker}>
          <input
            type="text"
            value={symbolInput}
            onChange={(event) => setSymbolInput(event.target.value)}
            placeholder="Add ticker (e.g., NVDA)"
            aria-label="Ticker symbol"
            autoComplete="off"
          />
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            aria-label="Category"
          >
            <option value="">Choose category</option>
            {categories.map((category) => (
              <option key={category.name} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          <button type="submit">Add ticker</button>
        </form>
        <div className="ticker-help">Examples — {helpText}</div>
      </section>

      <section className="categories">
        {categories.map((category) => (
          <article className="category" key={category.name}>
            <div className="category-header">
              <h3>
                {category.name} · {category.description}
              </h3>
              <button type="button" className="refresh" onClick={() => updateCategoryQuotes(category)}>
                Refresh
              </button>
            </div>
            <div className="tickers">
              {category.tickers.map((ticker) => {
                const quote = quotesBySymbol[ticker.symbol];
                const changeValue = quote?.regularMarketChange ?? null;
                const changePercent = quote?.regularMarketChangePercent ?? null;

                return (
                  <div className="ticker-card" key={`${category.name}-${ticker.symbol}`}>
                    <header>
                      <div>
                        <h4>{ticker.label}</h4>
                        <span className="ticker-symbol">{ticker.symbol}</span>
                      </div>
                      <button
                        className="remove"
                        type="button"
                        aria-label={`Remove ${ticker.symbol}`}
                        onClick={() => removeTicker(category.name, ticker.symbol)}
                      >
                        ✕
                      </button>
                    </header>
                    <dl>
                      <div>
                        <dt>Price</dt>
                        <dd className="price">{quote?.regularMarketPrice?.toFixed(2) ?? "--"}</dd>
                      </div>
                      <div>
                        <dt>Change</dt>
                        <dd
                          className={
                            changeValue === null
                              ? "change"
                              : `change ${changeValue > 0 ? "positive" : changeValue < 0 ? "negative" : ""}`
                          }
                        >
                          {changeValue === null || changePercent === null
                            ? "--"
                            : formatChange(changeValue, changePercent / 100)}
                        </dd>
                      </div>
                      <div>
                        <dt>Market Time</dt>
                        <dd className="market-time">{formatTime(quote?.regularMarketTime)}</dd>
                      </div>
                    </dl>
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
