// DropThe Charts -- Slope Chart
// USE: Before/after comparison. "Revenue 2024 vs 2025" showing who went up and who fell.
// WHEN: Comparing two time points. Showing direction of change per entity.
// NOT: When you have more than 2 time points (use bump). When you have > 10 items.

import { BaseChart, ChartConfig } from '../core/Chart';

export interface SlopeChartConfig extends ChartConfig {
  data: { label: string; start: number; end: number; highlight?: boolean }[];
  startLabel?: string;
  endLabel?: string;
  valuePrefix?: string;
  valueSuffix?: string;
}

export class SlopeChart extends BaseChart {
  slopeConfig: SlopeChartConfig;

  constructor(container: HTMLElement | string, config: SlopeChartConfig) {
    super(container, config);
    this.slopeConfig = config;
    this.padding = { top: 60, right: 100, bottom: 48, left: 100 };
    this.render();
  }

  render() { this.animate((p) => this.draw(p), 900); }

  draw(progress: number) {
    const { ctx, width, height, theme, padding } = this;
    const { data, startLabel, endLabel, valuePrefix = '', valueSuffix = '' } = this.slopeConfig;

    this.drawBackground();
    this.drawTitle();

    const cT = padding.top + 20, cB = height - padding.bottom - 8;
    const cL = padding.left, cR = width - padding.right;
    const cH = cB - cT;

    const allVals = data.flatMap(d => [d.start, d.end]);
    const yMin = Math.min(...allVals) * 0.9;
    const yMax = Math.max(...allVals) * 1.1;
    const yR = yMax - yMin || 1;
    const toY = (v: number) => cB - ((v - yMin) / yR) * cH;

    // Column headers
    ctx.fillStyle = theme.textSecondary; ctx.font = `600 12px ${theme.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.fillText(startLabel || 'Before', cL, cT - 10);
    ctx.fillText(endLabel || 'After', cR, cT - 10);

    // Vertical guides
    ctx.strokeStyle = theme.grid; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cL, cT); ctx.lineTo(cL, cB); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cR, cT); ctx.lineTo(cR, cB); ctx.stroke();

    this.drawSource(); this.snapshotBackground();

    const hasHL = data.some(d => d.highlight);

    data.forEach((d, i) => {
      const active = !hasHL || d.highlight;
      const gc = d.highlight ? theme.highlightGradient : theme.gradients[i % theme.gradients.length];

      const sy = toY(d.start);
      const ey = toY(d.end);
      const currentEndX = cL + (cR - cL) * progress;
      const currentEndY = sy + (ey - sy) * progress;

      // Line
      ctx.beginPath();
      ctx.moveTo(cL, sy);
      ctx.lineTo(currentEndX, currentEndY);

      if (active) {
        const grad = ctx.createLinearGradient(cL, 0, cR, 0);
        grad.addColorStop(0, gc[0]); grad.addColorStop(1, gc[1]);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = theme.name === 'midnight' ? 'rgba(255,255,240,0.1)' : 'rgba(0,0,0,0.06)';
        ctx.lineWidth = 1.5;
      }
      ctx.stroke();

      // Start dot
      ctx.beginPath(); ctx.arc(cL, sy, active ? 5 : 3, 0, Math.PI * 2);
      ctx.fillStyle = active ? gc[0] : (theme.name === 'midnight' ? 'rgba(255,255,240,0.12)' : 'rgba(0,0,0,0.08)');
      ctx.fill();

      // End dot
      if (progress > 0.9) {
        ctx.beginPath(); ctx.arc(cR, ey, active ? 5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = active ? gc[1] : (theme.name === 'midnight' ? 'rgba(255,255,240,0.12)' : 'rgba(0,0,0,0.08)');
        ctx.fill();
      }

      // Labels
      ctx.fillStyle = active ? theme.textSecondary : theme.textSource;
      ctx.font = active ? `500 11px ${theme.fontFamily}` : `400 10px ${theme.monoFamily}`;

      // Left label
      ctx.textAlign = 'right';
      ctx.fillText(`${d.label} ${valuePrefix}${this.fmt(d.start)}${valueSuffix}`, cL - 10, sy + 4);

      // Right label
      if (progress > 0.9) {
        const a = Math.min(1, (progress - 0.9) * 10);
        ctx.globalAlpha = a;
        ctx.textAlign = 'left';
        const change = d.end - d.start;
        const arrow = change > 0 ? '+' : '';
        ctx.fillText(`${valuePrefix}${this.fmt(d.end)}${valueSuffix} (${arrow}${this.fmt(change)})`, cR + 10, ey + 4);
        ctx.globalAlpha = 1;
      }
    });
  }

  fmt(n: number): string {
    if (Math.abs(n) >= 1e9) return (n/1e9).toFixed(1)+'B';
    if (Math.abs(n) >= 1e6) return (n/1e6).toFixed(1)+'M';
    if (Math.abs(n) >= 1e3) return (n/1e3).toFixed(1)+'K';
    return Math.round(n)+'';
  }
}
