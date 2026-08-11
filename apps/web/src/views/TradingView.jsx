import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { createChart } from 'lightweight-charts';
import { BarChart3, CandlestickChart, ChevronDown, Loader2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import apiServerClient from '@/lib/apiServerClient';
import './ViewStyles.css';

const TIMEFRAME_OPTIONS = [
  { label: '1m', interval: 60, limit: 180 },
  { label: '5m', interval: 300, limit: 180 },
  { label: '15m', interval: 900, limit: 160 },
  { label: '1h', interval: 3600, limit: 140 },
  { label: '4h', interval: 14400, limit: 120 },
  { label: '1D', interval: 86400, limit: 120 },
  { label: '1W', interval: 604800, limit: 80 },
];

const DEFAULT_INDICATORS = {
  ema: true,
  rsi: true,
  macd: true,
  volume: true,
};

const CHART_THEME = {
  background: '#0B1220',
  panel: '#111827',
  border: '#1E2A3B',
  text: '#A7BED3',
  muted: '#6E819A',
  green: '#10B981',
  red: '#EF4444',
  blue: '#38BDF8',
  amber: '#FBBF24',
  white: '#F3F4F6',
};

function normalizePair(value) {
  return String(value || 'BTC/USD').trim().toUpperCase().replace(/\s+/g, '').replace('-', '/');
}

function toApiSymbol(pair) {
  return normalizePair(pair).replace('/', '-');
}

function formatUsd(value, digits = 2) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number(value || 0));
}

function formatCompact(value) {
  const number = Number(value || 0);
  if (Math.abs(number) >= 1_000_000) return `${(number / 1_000_000).toFixed(2)}M`;
  if (Math.abs(number) >= 1_000) return `${(number / 1_000).toFixed(2)}K`;
  return number.toFixed(2);
}

function calculateEMA(values, period) {
  if (!Array.isArray(values) || values.length < period) return [];
  const multiplier = 2 / (period + 1);
  let ema = values.slice(0, period).reduce((sum, value) => sum + value, 0) / period;
  const result = new Array(period - 1).fill(null);
  result.push(ema);

  for (let index = period; index < values.length; index += 1) {
    ema = values[index] * multiplier + ema * (1 - multiplier);
    result.push(ema);
  }

  return result;
}

function calculateRSI(values, period = 14) {
  if (!Array.isArray(values) || values.length <= period) return [];
  const gains = [];
  const losses = [];
  for (let index = 1; index < values.length; index += 1) {
    const change = values[index] - values[index - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  let avgGain = gains.slice(0, period).reduce((sum, value) => sum + value, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((sum, value) => sum + value, 0) / period;
  const result = new Array(period).fill(null);
  result.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss));

  for (let index = period; index < gains.length; index += 1) {
    avgGain = (avgGain * (period - 1) + gains[index]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[index]) / period;
    const relativeStrength = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + relativeStrength));
  }

  return result;
}

function calculateMACD(values, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  const fast = calculateEMA(values, fastPeriod);
  const slow = calculateEMA(values, slowPeriod);
  const macdLine = values.map((_, index) => (
    fast[index] !== null && fast[index] !== undefined && slow[index] !== null && slow[index] !== undefined
      ? fast[index] - slow[index]
      : null
  ));
  const compactMacd = macdLine.filter((value) => value !== null);
  const signalCompact = calculateEMA(compactMacd, signalPeriod);
  let compactIndex = 0;
  const signalLine = macdLine.map((value) => {
    if (value === null) return null;
    const next = signalCompact[compactIndex] ?? null;
    compactIndex += 1;
    return next;
  });
  const histogram = macdLine.map((value, index) => (
    value !== null && signalLine[index] !== null && signalLine[index] !== undefined
      ? value - signalLine[index]
      : null
  ));

  return { macdLine, signalLine, histogram };
}

function StatPill({ label, value, tone = CHART_THEME.white }) {
  return (
    <div style={{ display: 'grid', gap: 4 }}>
      <span style={{ color: CHART_THEME.muted, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 700 }}>{label}</span>
      <span style={{ color: tone, fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
    </div>
  );
}

export default function TradingView() {
  const [orderType, setOrderType] = useState('market');
  const [side, setSide] = useState('buy');
  const [selectedPair, setSelectedPair] = useState('BTC/USD');
  const [quantity, setQuantity] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [positions, setPositions] = useState([]);
  const [candles, setCandles] = useState([]);
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [loadingCandles, setLoadingCandles] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('15m');
  const [indicatorMenuOpen, setIndicatorMenuOpen] = useState(false);
  const [enabledIndicators, setEnabledIndicators] = useState(DEFAULT_INDICATORS);
  const [crosshairSnapshot, setCrosshairSnapshot] = useState(null);

  const chartContainerRef = useRef(null);
  const rsiContainerRef = useRef(null);
  const macdContainerRef = useRef(null);
  const resizeObserverRef = useRef(null);

  async function authFetch(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
      Authorization: `Bearer ${pb.authStore.token}`,
    };

    let res = await apiServerClient.fetch(path, { ...options, headers });
    if (res.status === 401 && pb.authStore.isValid) {
      try {
        await pb.collection('users').authRefresh();
      } catch (_) {
        return res;
      }
      res = await apiServerClient.fetch(path, {
        ...options,
        headers: { ...headers, Authorization: `Bearer ${pb.authStore.token}` },
      });
    }
    return res;
  }

  useEffect(() => {
    const hash = window.location.hash;
    const queryStr = hash.includes('?') ? hash.split('?')[1] : '';
    const params = new URLSearchParams(queryStr);
    const pair = params.get('pair');
    if (pair) setSelectedPair(normalizePair(decodeURIComponent(pair)));
  }, []);

  const timeframeConfig = useMemo(
    () => TIMEFRAME_OPTIONS.find((item) => item.label === selectedTimeframe) || TIMEFRAME_OPTIONS[2],
    [selectedTimeframe],
  );

  const fetchCandles = useCallback(async () => {
    if (!selectedPair) return;
    setLoadingCandles(true);
    try {
      const query = new URLSearchParams({
        symbol: toApiSymbol(selectedPair),
        interval: String(timeframeConfig.interval),
        limit: String(timeframeConfig.limit),
      });
      const res = await authFetch(`/oracle-trader-pro/candles?${query.toString()}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setCandles(data.map((candle, index) => ({
          id: `${toApiSymbol(selectedPair)}-${candle.timestamp || index}`,
          timestamp: Number(candle.timestamp || Date.now() / 1000) + index,
          timeLabel: candle.t || new Date((Number(candle.timestamp || Date.now()) * 1000)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          open: Number(candle.open || 0),
          high: Number(candle.high || 0),
          low: Number(candle.low || 0),
          close: Number(candle.close || 0),
          volume: Number(candle.volume || 0),
        })).filter((candle) => candle.open && candle.high && candle.low && candle.close));
      }
    } catch (error) {
      console.error('Failed to load candles:', error);
      toast.error('Unable to load market candles.');
    } finally {
      setLoadingCandles(false);
    }
  }, [selectedPair, timeframeConfig.interval, timeframeConfig.limit]);

  const fetchPositions = useCallback(async () => {
    setLoadingPositions(true);
    try {
      const query = new URLSearchParams({ symbol: toApiSymbol(selectedPair) });
      const res = await authFetch(`/oracle-trader-pro/positions?${query.toString()}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setPositions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load positions:', error);
      toast.error('Unable to load open positions.');
    } finally {
      setLoadingPositions(false);
    }
  }, [selectedPair]);

  useEffect(() => {
    fetchCandles();
    fetchPositions();
  }, [fetchCandles, fetchPositions]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      fetchCandles();
      fetchPositions();
    }, 15_000);
    return () => window.clearInterval(timer);
  }, [fetchCandles, fetchPositions]);

  const processed = useMemo(() => {
    if (candles.length === 0) {
      return {
        main: [], volume: [], ema20: [], ema50: [], rsi: [], macdLine: [], signalLine: [], histogram: [],
      };
    }

    const closes = candles.map((candle) => candle.close);
    const ema20 = calculateEMA(closes, 20);
    const ema50 = calculateEMA(closes, 50);
    const rsi = calculateRSI(closes, 14);
    const macd = calculateMACD(closes, 12, 26, 9);

    return {
      main: candles.map((candle) => ({ time: candle.timestamp, open: candle.open, high: candle.high, low: candle.low, close: candle.close })),
      volume: candles.map((candle) => ({ time: candle.timestamp, value: candle.volume, color: candle.close >= candle.open ? 'rgba(16,185,129,0.45)' : 'rgba(239,68,68,0.45)' })),
      ema20: candles.map((candle, index) => ema20[index] ? ({ time: candle.timestamp, value: Number(ema20[index].toFixed(4)) }) : null).filter(Boolean),
      ema50: candles.map((candle, index) => ema50[index] ? ({ time: candle.timestamp, value: Number(ema50[index].toFixed(4)) }) : null).filter(Boolean),
      rsi: candles.map((candle, index) => rsi[index] ? ({ time: candle.timestamp, value: Number(rsi[index].toFixed(2)) }) : null).filter(Boolean),
      macdLine: candles.map((candle, index) => macd.macdLine[index] !== null ? ({ time: candle.timestamp, value: Number(macd.macdLine[index].toFixed(4)) }) : null).filter(Boolean),
      signalLine: candles.map((candle, index) => macd.signalLine[index] !== null ? ({ time: candle.timestamp, value: Number(macd.signalLine[index].toFixed(4)) }) : null).filter(Boolean),
      histogram: candles.map((candle, index) => macd.histogram[index] !== null ? ({ time: candle.timestamp, value: Number(macd.histogram[index].toFixed(4)), color: macd.histogram[index] >= 0 ? 'rgba(16,185,129,0.45)' : 'rgba(239,68,68,0.45)' }) : null).filter(Boolean),
    };
  }, [candles]);

  const marketStats = useMemo(() => {
    if (candles.length === 0) return null;
    const last = candles[candles.length - 1];
    const first = candles[0];
    const high24h = Math.max(...candles.map((candle) => candle.high));
    const low24h = Math.min(...candles.map((candle) => candle.low));
    const volume24h = candles.reduce((sum, candle) => sum + candle.volume, 0);
    const change = last.close - first.open;
    const changePct = first.open > 0 ? (change / first.open) * 100 : 0;
    return { last, change, changePct, high24h, low24h, volume24h };
  }, [candles]);

  const displayedCandle = useMemo(() => {
    if (crosshairSnapshot) return crosshairSnapshot;
    return candles[candles.length - 1] || null;
  }, [candles, crosshairSnapshot]);

  const handleSubmitOrder = async () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }
    if (orderType === 'limit' && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      toast.error('Please enter a valid limit price');
      return;
    }
    try {
      setIsSubmitting(true);
      const latestClose = Number(candles[candles.length - 1]?.close || 0);
      const signalData = {
        pair: normalizePair(selectedPair),
        type: side,
        confidence: 75,
        entryPrice: orderType === 'limit' ? parseFloat(limitPrice) : latestClose,
        stopLoss: 0,
        takeProfit: 0,
        quantity: parseFloat(quantity),
        candleTime: new Date().toISOString(),
      };
      const response = await authFetch('/oracle-trader-pro/trades', {
        method: 'POST',
        body: JSON.stringify({ signal: signalData }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success(`${side.toUpperCase()} order placed for ${normalizePair(selectedPair)}`);
        setQuantity('');
        setLimitPrice('');
        fetchPositions();
      } else {
        toast.error(data.message || 'Order rejected');
      }
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!chartContainerRef.current || processed.main.length === 0) return undefined;

    const mainContainer = chartContainerRef.current;
    const rsiContainer = rsiContainerRef.current;
    const macdContainer = macdContainerRef.current;
    const width = mainContainer.clientWidth || 720;

    const baseOptions = {
      layout: { background: { color: CHART_THEME.background }, textColor: CHART_THEME.text, fontFamily: 'JetBrains Mono, monospace' },
      grid: { vertLines: { color: 'rgba(30,42,59,0.35)' }, horzLines: { color: 'rgba(30,42,59,0.35)' } },
      rightPriceScale: { borderColor: CHART_THEME.border },
      timeScale: { borderColor: CHART_THEME.border, timeVisible: timeframeConfig.interval < 86400, secondsVisible: timeframeConfig.interval < 300 },
      crosshair: {
        mode: 1,
        horzLine: { color: 'rgba(56,189,248,0.35)', labelBackgroundColor: CHART_THEME.blue },
        vertLine: { color: 'rgba(56,189,248,0.35)', labelBackgroundColor: CHART_THEME.blue },
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: false },
      handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
    };

    const mainChart = createChart(mainContainer, { ...baseOptions, width, height: 420 });
    const candleSeries = mainChart.addCandlestickSeries({
      upColor: CHART_THEME.green,
      downColor: CHART_THEME.red,
      borderVisible: false,
      wickUpColor: CHART_THEME.green,
      wickDownColor: CHART_THEME.red,
      priceLineVisible: true,
      lastValueVisible: true,
    });
    candleSeries.setData(processed.main);

    if (enabledIndicators.volume) {
      const volumeSeries = mainChart.addHistogramSeries({
        priceScaleId: '',
        priceFormat: { type: 'volume' },
        scaleMargins: { top: 0.78, bottom: 0 },
      });
      volumeSeries.setData(processed.volume);
    }

    if (enabledIndicators.ema) {
      const ema20Series = mainChart.addLineSeries({ color: CHART_THEME.blue, lineWidth: 2, priceLineVisible: false, lastValueVisible: false });
      const ema50Series = mainChart.addLineSeries({ color: CHART_THEME.amber, lineWidth: 2, priceLineVisible: false, lastValueVisible: false });
      ema20Series.setData(processed.ema20);
      ema50Series.setData(processed.ema50);
    }

    mainChart.timeScale().fitContent();

    mainChart.subscribeCrosshairMove((param) => {
      const candlePoint = param.seriesData.get(candleSeries);
      if (!candlePoint || param.time === undefined) {
        setCrosshairSnapshot(null);
        return;
      }
      const meta = candles.find((candle) => candle.timestamp === Number(param.time)) || null;
      setCrosshairSnapshot({
        timestamp: Number(param.time),
        open: candlePoint.open,
        high: candlePoint.high,
        low: candlePoint.low,
        close: candlePoint.close,
        timeLabel: meta?.timeLabel,
      });
    });

    let rsiChart = null;
    let macdChart = null;
    if (enabledIndicators.rsi && rsiContainer && processed.rsi.length > 0) {
      rsiChart = createChart(rsiContainer, { ...baseOptions, width, height: 120 });
      const rsiSeries = rsiChart.addLineSeries({ color: '#A855F7', lineWidth: 2, priceLineVisible: false, lastValueVisible: false });
      rsiSeries.setData(processed.rsi);
      rsiChart.timeScale().fitContent();
    }
    if (enabledIndicators.macd && macdContainer && processed.macdLine.length > 0) {
      macdChart = createChart(macdContainer, { ...baseOptions, width, height: 140 });
      const macdHistogram = macdChart.addHistogramSeries({ priceLineVisible: false, lastValueVisible: false });
      const macdLineSeries = macdChart.addLineSeries({ color: CHART_THEME.blue, lineWidth: 2, priceLineVisible: false, lastValueVisible: false });
      const macdSignalSeries = macdChart.addLineSeries({ color: CHART_THEME.amber, lineWidth: 2, priceLineVisible: false, lastValueVisible: false });
      macdHistogram.setData(processed.histogram);
      macdLineSeries.setData(processed.macdLine);
      macdSignalSeries.setData(processed.signalLine);
      macdChart.timeScale().fitContent();
    }

    resizeObserverRef.current?.disconnect();
    resizeObserverRef.current = new ResizeObserver((entries) => {
      const nextWidth = entries[0]?.contentRect?.width || width;
      mainChart.applyOptions({ width: nextWidth });
      rsiChart?.applyOptions({ width: nextWidth });
      macdChart?.applyOptions({ width: nextWidth });
    });
    resizeObserverRef.current.observe(mainContainer);

    return () => {
      resizeObserverRef.current?.disconnect();
      mainChart.remove();
      rsiChart?.remove();
      macdChart?.remove();
    };
  }, [candles, enabledIndicators, processed, timeframeConfig.interval]);

  return (
    <div className="view-container">
      <div className="view-header">
        <h1>Trading</h1>
        <p>Execute trades with real-time market data and live order placement</p>
      </div>

      <div className="trading-layout" style={{ gridTemplateColumns: 'minmax(0, 1fr) 340px' }}>
        <div className="chart-area" style={{ display: 'block', padding: 0, minHeight: 640 }}>
          {loadingCandles ? (
            <div className="chart-placeholder" style={{ minHeight: 640, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <Loader2 className="w-7 h-7 animate-spin text-[#38BDF8]" />
              <p style={{ fontSize: 18, marginTop: 12, color: CHART_THEME.white }}>Loading advanced chart…</p>
            </div>
          ) : candles.length > 0 && marketStats ? (
            <div style={{ width: '100%', minHeight: 640, display: 'grid', gridTemplateRows: 'auto auto auto 1fr', background: CHART_THEME.panel }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '16px 18px 12px 18px', borderBottom: `1px solid ${CHART_THEME.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: CHART_THEME.white, fontSize: 20, fontWeight: 800 }}>
                      <CandlestickChart size={18} color={CHART_THEME.blue} />
                      {toApiSymbol(selectedPair)}
                    </div>
                    <div style={{ marginTop: 4, color: marketStats.change >= 0 ? CHART_THEME.green : CHART_THEME.red, fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                      ${formatUsd(marketStats.last.close)} {marketStats.change >= 0 ? '+' : ''}{formatUsd(marketStats.change)} ({marketStats.changePct >= 0 ? '+' : ''}{marketStats.changePct.toFixed(2)}%)
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
                    <StatPill label="24h Volume" value={formatCompact(marketStats.volume24h)} />
                    <StatPill label="24h High" value={`$${formatUsd(marketStats.high24h)}`} />
                    <StatPill label="24h Low" value={`$${formatUsd(marketStats.low24h)}`} />
                  </div>
                </div>
                <div style={{ position: 'relative' }}>
                  <button type="button" onClick={() => setIndicatorMenuOpen((value) => !value)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 12, background: 'rgba(11,18,32,0.92)', border: `1px solid ${CHART_THEME.border}`, color: CHART_THEME.white, cursor: 'pointer', fontWeight: 700 }}>
                    <BarChart3 size={15} /> Indicateurs <ChevronDown size={14} />
                  </button>
                  {indicatorMenuOpen && (
                    <div style={{ position: 'absolute', top: 48, right: 0, zIndex: 20, minWidth: 180, background: CHART_THEME.panel, border: `1px solid ${CHART_THEME.border}`, borderRadius: 14, padding: 10, boxShadow: '0 24px 48px rgba(0,0,0,0.35)' }}>
                      {[
                        { key: 'ema', label: 'EMA 20 / 50' },
                        { key: 'rsi', label: 'RSI' },
                        { key: 'macd', label: 'MACD' },
                        { key: 'volume', label: 'Volume' },
                      ].map((indicator) => (
                        <button key={indicator.key} type="button" onClick={() => setEnabledIndicators((current) => ({ ...current, [indicator.key]: !current[indicator.key] }))} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: 'none', background: enabledIndicators[indicator.key] ? 'rgba(16,185,129,0.16)' : 'transparent', color: enabledIndicators[indicator.key] ? '#D1FAE5' : CHART_THEME.text, cursor: 'pointer', fontWeight: 600 }}>
                          {indicator.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '0 18px 12px 18px', borderBottom: `1px solid ${CHART_THEME.border}`, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {TIMEFRAME_OPTIONS.map((item) => (
                    <button key={item.label} type="button" onClick={() => setSelectedTimeframe(item.label)} style={{ padding: '8px 10px', borderRadius: 10, border: `1px solid ${item.label === selectedTimeframe ? 'rgba(37,99,235,0.65)' : CHART_THEME.border}`, background: item.label === selectedTimeframe ? 'rgba(37,99,235,0.18)' : 'rgba(11,18,32,0.9)', color: item.label === selectedTimeframe ? CHART_THEME.white : CHART_THEME.text, fontWeight: 700, cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace" }}>
                      {item.label}
                    </button>
                  ))}
                </div>
                <div style={{ color: CHART_THEME.muted, fontSize: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span>Zoom • Pan • Crosshair enabled</span>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 16, padding: 18 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 12 }}>
                  <StatPill label="O" value={`$${formatUsd(displayedCandle?.open)}`} />
                  <StatPill label="H" value={`$${formatUsd(displayedCandle?.high)}`} tone={CHART_THEME.green} />
                  <StatPill label="L" value={`$${formatUsd(displayedCandle?.low)}`} tone={CHART_THEME.red} />
                  <StatPill label="C" value={`$${formatUsd(displayedCandle?.close)}`} />
                  <StatPill label="Change" value={`${displayedCandle ? (displayedCandle.close - displayedCandle.open >= 0 ? '+' : '') : ''}${displayedCandle ? formatUsd(displayedCandle.close - displayedCandle.open) : '0.00'}`} tone={displayedCandle && displayedCandle.close >= displayedCandle.open ? CHART_THEME.green : CHART_THEME.red} />
                </div>

                <div ref={chartContainerRef} style={{ width: '100%', height: 420, borderRadius: 16, overflow: 'hidden', border: `1px solid ${CHART_THEME.border}` }} />
                {enabledIndicators.rsi && <div ref={rsiContainerRef} style={{ width: '100%', height: 120, borderRadius: 16, overflow: 'hidden', border: `1px solid ${CHART_THEME.border}` }} />}
                {enabledIndicators.macd && <div ref={macdContainerRef} style={{ width: '100%', height: 140, borderRadius: 16, overflow: 'hidden', border: `1px solid ${CHART_THEME.border}` }} />}
              </div>
            </div>
          ) : (
            <div className="chart-placeholder">
              <p style={{ fontSize: 48, marginBottom: 12 }}>📊</p>
              <p style={{ fontSize: 16, marginBottom: 6 }}>Advanced chart unavailable</p>
              <p style={{ fontSize: 13 }}>No candle data returned for the selected market.</p>
            </div>
          )}
        </div>

        <div className="order-panel">
          <h3>Place Order</h3>
          <div className="form-group">
            <label htmlFor="trading-side">Side</label>
            <div className="button-group">
              <button id="trading-side-buy" className={`btn ${side === 'buy' ? 'active' : ''}`} onClick={() => setSide('buy')} style={side === 'buy' ? { background: 'rgba(16,185,129,0.2)', color: '#10b981', borderColor: 'rgba(16,185,129,0.4)' } : {}}>BUY</button>
              <button id="trading-side-sell" className={`btn ${side === 'sell' ? 'active' : ''}`} onClick={() => setSide('sell')} style={side === 'sell' ? { background: 'rgba(239,68,68,0.2)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.4)' } : {}}>SELL</button>
            </div>
          </div>

          <div className="form-group">
            <label>Order Type</label>
            <div className="button-group">
              <button className={`btn ${orderType === 'market' ? 'active' : ''}`} onClick={() => setOrderType('market')}>Market</button>
              <button className={`btn ${orderType === 'limit' ? 'active' : ''}`} onClick={() => setOrderType('limit')}>Limit</button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="trading-symbol">Symbol</label>
            <input id="trading-symbol" name="trading-symbol" type="text" value={selectedPair} onChange={(event) => setSelectedPair(normalizePair(event.target.value))} placeholder="BTC/USD" />
          </div>

          <div className="form-group">
            <label htmlFor="trading-quantity">Quantity</label>
            <input id="trading-quantity" name="trading-quantity" type="number" placeholder="0.00" min="0" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
          </div>

          {orderType === 'limit' && (
            <div className="form-group">
              <label htmlFor="trading-price">Limit Price</label>
              <input id="trading-price" name="trading-price" type="number" placeholder="0.00" min="0" value={limitPrice} onChange={(event) => setLimitPrice(event.target.value)} />
            </div>
          )}

          <button className={`btn-submit ${side}`} onClick={handleSubmitOrder} disabled={isSubmitting}>{isSubmitting ? 'Placing Order...' : `${side.toUpperCase()} NOW`}</button>
        </div>
      </div>

      <div className="positions-section glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Open Positions</h3>
          {loadingPositions && <span className="text-xs text-muted-foreground">Loading...</span>}
        </div>
        {positions.length > 0 ? (
          <div className="grid gap-3">
            {positions.map((position) => (
              <div key={position.id} className="border border-border rounded-lg p-3 bg-card/70">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div>
                    <div className="text-sm font-semibold">{position.pair}</div>
                    <div className="text-xs text-muted-foreground">{position.status?.toUpperCase()}</div>
                  </div>
                  <div className={`text-xs font-semibold ${position.side === 'sell' ? 'text-rose' : 'text-emerald'}`}>{position.side?.toUpperCase()}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[13px]">
                  <div>Qty: {Number(position.quantity || 0).toFixed(4)}</div>
                  <div>Entry: {Number(position.entryPrice || position.price || 0).toFixed(2)}</div>
                  <div>SL: {Number(position.stopLoss || 0).toFixed(2)}</div>
                  <div>TP: {Number(position.takeProfit || 0).toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No open positions — place a trade above to get started</p>
        )}
      </div>
    </div>
  );
}
