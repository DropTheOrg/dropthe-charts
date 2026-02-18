// DropThe Charts -- Histogram
// USE: Distribution of values. "How are ratings distributed?" "Salary ranges"
// WHEN: Showing frequency/count across value ranges (bins).
// NOT: When comparing categories (use bar). When showing change over time (use line).

import { BaseChart, ChartConfig } from '../core/Chart';

export interface HistogramChartConfig extends ChartConfig {
  data: number[]; // raw values to bin
  bins?: number;  // number of bins (default: auto)
  xLabel?: string;
  yLabel?: string;
  xPrefix?: string;
  xSuffix?: string;
}

export class HistogramChart extends BaseChart {
  histConfig: HistogramChartConfig;

  constructor(container: HTMLElement | string, config: HistogramChartConfig) {
    super(container, config);
    this.histConfig = config;
    this.padding = { top: 60, right: 24, bottom: 56, left: 50 };
    this.render();
  }

  render() { this.animate((p) => this.draw(p)); }

  draw(progress: number) {
    const { ctx, width, height, theme, padding } = this;
    const { data, bins: nBins, xLabel, yLabel, xPrefix = '', xSuffix = '' } = this.histConfig;

    this.drawBackground();
    this.drawTitle();

    const cT = padding.top + 8, cB = height - padding.bottom;
    const cL = padding.left, cR = width - padding.right;
    const cW = cR - cL, cH = cB - cT;

    const min = Math.min(...data), max = Math.max(...data);
    const range = max - min || 1;
    const numBins = nBins || Math.max(5, Math.min(30, Math.ceil(Math.sqrt(data.length))));
    const binW = range / numBins;

    // Create bins
    const binCounts = new Array(numBins).fill(0);
    data.forEach(v => {
      const idx = Math.min(numBins - 1, Math.floor((v - min) / binW));
      binCounts[idx]++;
    });
    const maxCount = Math.max(...binCounts);

    // Grid
    ctx.strokeStyle = theme.grid; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = cB - (cH * i / 4);
      ctx.beginPath(); ctx.moveTo(cL, y); ctx.lineTo(cR, y); ctx.stroke();
      ctx.fillStyle = theme.textSecondary; ctx.font = `400 10px ${theme.monoFamily}`;
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(maxCount * i / 4) + '', cL - 8, y + 4);
    }

    // X labels
    ctx.textAlign = 'center';
    const xStep = Math.max(1, Math.floor(numBins / 6));
    for (let i = 0; i <= numBins; i += xStep) {
      const x = cL + (i / numBins) * cW;
      ctx.fillText(xPrefix + this.fmt(min + i * binW) + xSuffix, x, cB + 16);
    }

    if (xLabel) { ctx.fillStyle = theme.textSource; ctx.textAlign = 'center'; ctx.fillText(xLabel, cL + cW/2, cB + 34); }
    if (yLabel) { ctx.save(); ctx.translate(14, cT + cH/2); ctx.rotate(-Math.PI/2); ctx.fillStyle = theme.textSource; ctx.textAlign = 'center'; ctx.fillText(yLabel, 0, 0); ctx.restore(); }

    this.drawSource(); this.snapshotBackground();

    const barW = cW / numBins;
    const gap = Math.max(1, barW * 0.05);
    const r = Math.min(4, (barW - gap) / 4);

    binCounts.forEach((count, i) => {
      const h = (count / maxCount) * cH * progress;
      const x = cL + i * barW + gap / 2;
      const y = cB - h;
      const w = barW - gap;
      if (h < 1) return;

      // Color by distance from peak (green=common, orange=uncommon, red=extreme)
      const peakBin = binCounts.indexOf(maxCount);
      const dist = Math.abs(i - peakBin) / (numBins || 1);
      const gc = dist < 0.25 ? theme.gradients[2] // green (money) = common
        : dist < 0.5 ? theme.gradients[0] // purple (gaming) = moderate  
        : dist < 0.75 ? theme.gradients[3] // gold (coin) = uncommon
        : [theme.highlightGradient[0], '#ff6b6b']; // red = extreme

      ctx.beginPath();
      ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h);
      ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();

      ctx.save(); ctx.clip();
      const grad = ctx.createLinearGradient(x, y, x + w, y + h);
      grad.addColorStop(0, gc[0]); grad.addColorStop(1, gc[1]);
      ctx.fillStyle = grad; ctx.fillRect(x, y, w, h);
      ctx.restore();
    });
  }

  fmt(n: number): string {
    if (Math.abs(n) >= 1e6) return (n/1e6).toFixed(1)+'M';
    if (Math.abs(n) >= 1e3) return (n/1e3).toFixed(1)+'K';
    return n < 10 ? n.toFixed(1) : Math.round(n)+'';
  }
}
