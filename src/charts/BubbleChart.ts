// DropThe Charts -- Bubble Chart
// USE: Three dimensions on one chart. X, Y position + size = third variable.
// WHEN: "Revenue vs growth, sized by market cap" or "Rating vs count, sized by revenue"
// NOT: When you only have 2 dimensions (use scatter). When size differences are tiny.

import { BaseChart, ChartConfig } from '../core/Chart';

export interface BubblePoint {
  x: number; y: number; z: number; // z = bubble size
  label?: string;
  highlight?: boolean;
}

export interface BubbleChartConfig extends ChartConfig {
  data: BubblePoint[];
  xLabel?: string; yLabel?: string; zLabel?: string;
  xPrefix?: string; xSuffix?: string;
  yPrefix?: string; ySuffix?: string;
  maxRadius?: number;
}

export class BubbleChart extends BaseChart {
  bubbleConfig: BubbleChartConfig;

  constructor(container: HTMLElement | string, config: BubbleChartConfig) {
    super(container, config);
    this.bubbleConfig = { maxRadius: 40, ...config };
    this.padding = { top: 60, right: 30, bottom: 56, left: 60 };
    this.render();
  }

  render() { this.animate((p) => this.draw(p)); }

  draw(progress: number) {
    const { ctx, width, height, theme, padding } = this;
    const { data, xLabel, yLabel, xPrefix='', xSuffix='', yPrefix='', ySuffix='', maxRadius } = this.bubbleConfig;

    this.drawBackground();
    this.drawTitle();

    const cT = padding.top + 8, cB = height - padding.bottom;
    const cL = padding.left, cR = width - padding.right;
    const cW = cR - cL, cH = cB - cT;

    const xs = data.map(d => d.x), ys = data.map(d => d.y), zs = data.map(d => d.z);
    const xMin = Math.min(...xs)*0.9, xMax = Math.max(...xs)*1.1;
    const yMin = Math.min(...ys)*0.9, yMax = Math.max(...ys)*1.1;
    const zMax = Math.max(...zs);
    const xR = xMax - xMin || 1, yR = yMax - yMin || 1;

    // Grid
    ctx.strokeStyle = theme.grid; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = cB - (cH * i / 4);
      ctx.beginPath(); ctx.moveTo(cL, y); ctx.lineTo(cR, y); ctx.stroke();
      ctx.fillStyle = theme.textSecondary; ctx.font = `400 10px ${theme.monoFamily}`;
      ctx.textAlign = 'right';
      ctx.fillText(yPrefix + this.fmt(yMin + yR * i / 4) + ySuffix, cL - 8, y + 4);
    }
    for (let i = 0; i <= 4; i++) {
      const x = cL + (cW * i / 4);
      ctx.fillStyle = theme.textSecondary; ctx.textAlign = 'center';
      ctx.fillText(xPrefix + this.fmt(xMin + xR * i / 4) + xSuffix, x, cB + 16);
    }

    if (xLabel) { ctx.fillStyle = theme.textSource; ctx.textAlign = 'center'; ctx.fillText(xLabel, cL + cW/2, cB + 32); }
    if (yLabel) { ctx.save(); ctx.translate(14, cT + cH/2); ctx.rotate(-Math.PI/2); ctx.fillStyle = theme.textSource; ctx.textAlign = 'center'; ctx.fillText(yLabel, 0, 0); ctx.restore(); }

    this.drawSource();
    this.snapshotBackground();

    // Sort by size desc so small bubbles render on top
    const sorted = data.map((d, i) => ({...d, idx: i})).sort((a, b) => b.z - a.z);

    sorted.forEach((d) => {
      const px = cL + ((d.x - xMin) / xR) * cW;
      const py = cB - ((d.y - yMin) / yR) * cH;
      const r = Math.max(6, (d.z / zMax) * (maxRadius || 40)) * progress;
      // Every bubble gets its own gradient color from the palette
      const gc = d.highlight ? theme.highlightGradient : theme.gradients[d.idx % theme.gradients.length];

      ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.save(); ctx.clip();
      const grad = ctx.createRadialGradient(px - r*0.3, py - r*0.3, 0, px, py, r);
      grad.addColorStop(0, gc[0]); grad.addColorStop(1, gc[1]);
      ctx.fillStyle = grad; ctx.globalAlpha = d.highlight ? 0.9 : 0.75;
      ctx.fillRect(px - r, py - r, r * 2, r * 2);
      // Lava blob
      const rg = ctx.createRadialGradient(px + r*0.2, py + r*0.2, 0, px, py, r*0.8);
      rg.addColorStop(0, gc[1]); rg.addColorStop(0.5, gc[1] + '66'); rg.addColorStop(1, gc[1] + '00');
      ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = rg;
      ctx.fillRect(px - r, py - r, r * 2, r * 2);
      ctx.globalCompositeOperation = 'source-over';
      ctx.restore(); ctx.globalAlpha = 1;

      // Labels inside or above every bubble
      if (d.label && progress > 0.5) {
        ctx.globalAlpha = Math.min(1, (progress - 0.5) * 2);
        if (r > 16) {
          // Label inside bubble
          ctx.fillStyle = theme.name === 'midnight' ? 'rgba(10,10,15,0.85)' : 'rgba(255,255,255,0.95)';
          ctx.font = `600 ${Math.min(12, r * 0.45)}px ${theme.fontFamily}`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(d.label, px, py);
        } else {
          // Label above bubble
          ctx.fillStyle = theme.textPrimary;
          ctx.font = `500 9px ${theme.fontFamily}`;
          ctx.textAlign = 'center';
          ctx.fillText(d.label, px, py - r - 5);
        }
        ctx.globalAlpha = 1;
      }
    });
  }

  fmt(n: number): string {
    if (Math.abs(n) >= 1e9) return (n/1e9).toFixed(1)+'B';
    if (Math.abs(n) >= 1e6) return (n/1e6).toFixed(1)+'M';
    if (Math.abs(n) >= 1e3) return (n/1e3).toFixed(1)+'K';
    return n < 10 ? n.toFixed(1) : Math.round(n)+'';
  }
}
