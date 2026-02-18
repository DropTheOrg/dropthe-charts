// DropThe Charts -- Scatter Plot
// USE: Correlation between two variables. "Revenue vs employees", "Rating vs budget"
// WHEN: You have two numeric dimensions per entity and want to show relationship.
// NOT: When you have categories (use bar). When time is primary axis (use line).

import { BaseChart, ChartConfig } from '../core/Chart';

export interface ScatterPoint {
  x: number;
  y: number;
  label?: string;
  size?: number;
  highlight?: boolean;
}

export interface ScatterChartConfig extends ChartConfig {
  data: ScatterPoint[];
  xLabel?: string;
  yLabel?: string;
  xPrefix?: string;
  xSuffix?: string;
  yPrefix?: string;
  ySuffix?: string;
  showLabels?: boolean;
}

export class ScatterChart extends BaseChart {
  scatterConfig: ScatterChartConfig;

  constructor(container: HTMLElement | string, config: ScatterChartConfig) {
    super(container, config);
    this.scatterConfig = { showLabels: true, ...config };
    this.padding = { top: 60, right: 24, bottom: 56, left: 60 };
    this.render();
  }

  render() { this.animate((p) => this.draw(p)); }

  draw(progress: number) {
    const { ctx, width, height, theme, padding } = this;
    const { data, xLabel, yLabel, xPrefix='', xSuffix='', yPrefix='', ySuffix='', showLabels } = this.scatterConfig;

    this.drawBackground();
    this.drawTitle();

    const cT = padding.top + 8, cB = height - padding.bottom;
    const cL = padding.left, cR = width - padding.right;
    const cW = cR - cL, cH = cB - cT;

    const xs = data.map(d => d.x), ys = data.map(d => d.y);
    const xMin = Math.min(...xs)*0.95, xMax = Math.max(...xs)*1.05;
    const yMin = Math.min(...ys)*0.95, yMax = Math.max(...ys)*1.05;
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
      ctx.textAlign = 'center';
      ctx.fillText(xPrefix + this.fmt(xMin + xR * i / 4) + xSuffix, x, cB + 16);
    }

    if (xLabel) { ctx.fillStyle = theme.textSource; ctx.font = `400 10px ${theme.monoFamily}`; ctx.textAlign = 'center'; ctx.fillText(xLabel, cL + cW/2, cB + 32); }
    if (yLabel) { ctx.save(); ctx.translate(14, cT + cH/2); ctx.rotate(-Math.PI/2); ctx.fillStyle = theme.textSource; ctx.font = `400 10px ${theme.monoFamily}`; ctx.textAlign = 'center'; ctx.fillText(yLabel, 0, 0); ctx.restore(); }

    this.drawSource();
    this.snapshotBackground();

    const hasHL = data.some(d => d.highlight);
    data.forEach((d, i) => {
      const px = cL + ((d.x - xMin) / xR) * cW;
      const py = cB - ((d.y - yMin) / yR) * cH;
      const r = (d.size || 6) * progress;
      const active = !hasHL || d.highlight;
      const gc = d.highlight ? theme.highlightGradient : theme.gradients[i % theme.gradients.length];

      ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2);
      if (active) {
        const grad = ctx.createRadialGradient(px, py, 0, px, py, r);
        grad.addColorStop(0, gc[0]); grad.addColorStop(1, gc[1]);
        ctx.fillStyle = grad; ctx.globalAlpha = 0.85;
      } else {
        const isDark = theme.name === 'midnight';
        ctx.fillStyle = isDark ? 'rgba(255,255,240,0.1)' : 'rgba(0,0,0,0.06)';
      }
      ctx.fill(); ctx.globalAlpha = 1;

      if (showLabels && d.label && active && progress > 0.6) {
        ctx.globalAlpha = Math.min(1, (progress - 0.6) * 2.5);
        ctx.fillStyle = theme.textSecondary; ctx.font = `400 10px ${theme.monoFamily}`;
        ctx.textAlign = 'center'; ctx.fillText(d.label, px, py - r - 6);
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
