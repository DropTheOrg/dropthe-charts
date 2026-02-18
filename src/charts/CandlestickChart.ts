// DropThe Charts -- Candlestick Chart
// USE: OHLC price data. Crypto, stocks, any financial time series.
// WHEN: Showing open/high/low/close over time. Trading-style visualization.
// NOT: When you just have a single value over time (use line).

import { BaseChart, ChartConfig } from '../core/Chart';

export interface CandleData {
  label: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface CandlestickChartConfig extends ChartConfig {
  data: CandleData[];
  yPrefix?: string;
  ySuffix?: string;
}

export class CandlestickChart extends BaseChart {
  candleConfig: CandlestickChartConfig;

  constructor(container: HTMLElement | string, config: CandlestickChartConfig) {
    super(container, config);
    this.candleConfig = config;
    this.padding = { top: 60, right: 24, bottom: 48, left: 60 };
    this.render();
  }

  render() { this.animate((p) => this.draw(p)); }

  draw(progress: number) {
    const { ctx, width, height, theme, padding } = this;
    const { data, yPrefix = '', ySuffix = '' } = this.candleConfig;

    this.drawBackground();
    this.drawTitle();

    const cT = padding.top + 8, cB = height - padding.bottom - 20;
    const cL = padding.left, cR = width - padding.right;
    const cW = cR - cL, cH = cB - cT;

    const allVals = data.flatMap(d => [d.high, d.low]);
    const yMin = Math.min(...allVals) * 0.98;
    const yMax = Math.max(...allVals) * 1.02;
    const yR = yMax - yMin || 1;

    const toY = (v: number) => cB - ((v - yMin) / yR) * cH;

    // Grid + Y labels
    ctx.strokeStyle = theme.grid; ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = cB - (cH * i / 5);
      ctx.beginPath(); ctx.moveTo(cL, y); ctx.lineTo(cR, y); ctx.stroke();
      ctx.fillStyle = theme.textSecondary; ctx.font = `400 10px ${theme.monoFamily}`;
      ctx.textAlign = 'right';
      ctx.fillText(yPrefix + this.fmt(yMin + yR * i / 5) + ySuffix, cL - 8, y + 4);
    }

    // X labels
    const step = Math.max(1, Math.floor(data.length / 8));
    ctx.textAlign = 'center';
    for (let i = 0; i < data.length; i += step) {
      const x = cL + (i + 0.5) / data.length * cW;
      ctx.fillText(data[i].label, x, cB + 16);
    }

    this.drawSource();
    this.snapshotBackground();

    const candleW = Math.min(20, (cW / data.length) * 0.7);
    const wickW = 1.5;

    const visible = Math.floor(data.length * progress);
    for (let i = 0; i < visible; i++) {
      const d = data[i];
      const x = cL + (i + 0.5) / data.length * cW;
      const bullish = d.close >= d.open;

      const bodyTop = toY(Math.max(d.open, d.close));
      const bodyBot = toY(Math.min(d.open, d.close));
      const bodyH = Math.max(1, bodyBot - bodyTop);
      const wickTop = toY(d.high);
      const wickBot = toY(d.low);

      const gc = bullish
        ? theme.gradients[2] // green-ish (money)
        : [theme.highlightGradient[0], '#ff6b6b']; // red-ish

      // Wick
      ctx.strokeStyle = bullish ? gc[0] + 'aa' : gc[1] + 'aa';
      ctx.lineWidth = wickW;
      ctx.beginPath(); ctx.moveTo(x, wickTop); ctx.lineTo(x, wickBot); ctx.stroke();

      // Body
      const bx = x - candleW / 2;
      ctx.beginPath();
      const r = Math.min(3, candleW / 4, bodyH / 4);
      ctx.moveTo(bx + r, bodyTop); ctx.lineTo(bx + candleW - r, bodyTop);
      ctx.quadraticCurveTo(bx + candleW, bodyTop, bx + candleW, bodyTop + r);
      ctx.lineTo(bx + candleW, bodyBot - r);
      ctx.quadraticCurveTo(bx + candleW, bodyBot, bx + candleW - r, bodyBot);
      ctx.lineTo(bx + r, bodyBot);
      ctx.quadraticCurveTo(bx, bodyBot, bx, bodyBot - r);
      ctx.lineTo(bx, bodyTop + r);
      ctx.quadraticCurveTo(bx, bodyTop, bx + r, bodyTop);
      ctx.closePath();

      ctx.save(); ctx.clip();
      const grad = ctx.createLinearGradient(bx, bodyTop, bx + candleW, bodyBot);
      grad.addColorStop(0, gc[0]); grad.addColorStop(1, gc[1]);
      ctx.fillStyle = grad;
      ctx.fillRect(bx, bodyTop, candleW, bodyH);
      ctx.restore();
    }
  }

  fmt(n: number): string {
    if (Math.abs(n) >= 1e6) return (n/1e6).toFixed(1)+'M';
    if (Math.abs(n) >= 1e3) return (n/1e3).toFixed(1)+'K';
    return n < 100 ? n.toFixed(1) : Math.round(n)+'';
  }
}
