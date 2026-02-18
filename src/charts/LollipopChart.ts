// DropThe Charts -- Lollipop Chart
// USE: Cleaner alternative to bar chart. Less ink, more clarity.
// WHEN: Rankings with many items (10+). Leaderboards. When bars feel heavy.
// NOT: When you need stacked values. When you have < 5 items (use bar).

import { BaseChart, ChartConfig } from '../core/Chart';

export interface LollipopChartConfig extends ChartConfig {
  data: { label: string; value: number; highlight?: boolean }[];
  horizontal?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
}

export class LollipopChart extends BaseChart {
  lolliConfig: LollipopChartConfig;

  constructor(container: HTMLElement | string, config: LollipopChartConfig) {
    super(container, config);
    this.lolliConfig = { horizontal: true, ...config };
    this.padding = config.horizontal !== false
      ? { top: 60, right: 60, bottom: 48, left: 100 }
      : { top: 60, right: 24, bottom: 48, left: 40 };
    this.render();
  }

  render() { this.animate((p) => this.draw(p)); }

  draw(progress: number) {
    const { ctx, width, height, theme, padding } = this;
    const { data, horizontal, valuePrefix='', valueSuffix='' } = this.lolliConfig;

    this.drawBackground();
    this.drawTitle();

    const cT = padding.top + 8, cB = height - padding.bottom - 20;
    const cL = padding.left, cR = width - padding.right;
    const cW = cR - cL, cH = cB - cT;
    const maxVal = Math.max(...data.map(d => d.value)) * 1.1;
    const hasHL = data.some(d => d.highlight);

    if (horizontal) {
      const rowH = Math.min(30, cH / data.length);
      const gap = (cH - data.length * rowH) / (data.length - 1 || 1);

      // Labels
      ctx.font = `400 11px ${theme.monoFamily}`; ctx.textAlign = 'right';
      data.forEach((d, i) => {
        const active = !hasHL || d.highlight;
        ctx.fillStyle = active ? theme.textSecondary : theme.textSource;
        const y = cT + i * (rowH + gap) + rowH / 2;
        ctx.fillText(d.label, cL - 10, y + 4);
      });

      // Grid
      ctx.strokeStyle = theme.grid; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cL, cT); ctx.lineTo(cL, cB); ctx.stroke();

      this.drawSource(); this.snapshotBackground();

      data.forEach((d, i) => {
        const active = !hasHL || d.highlight;
        const gc = d.highlight ? theme.highlightGradient : theme.gradients[i % theme.gradients.length];
        const y = cT + i * (rowH + gap) + rowH / 2;
        const endX = cL + (d.value / maxVal) * cW * progress;
        const dotR = active ? 6 : 4;

        // Stem
        ctx.strokeStyle = active ? gc[0] + 'aa' : (theme.name === 'midnight' ? 'rgba(255,255,240,0.1)' : 'rgba(0,0,0,0.08)');
        ctx.lineWidth = active ? 2.5 : 1.5;
        ctx.beginPath(); ctx.moveTo(cL, y); ctx.lineTo(endX, y); ctx.stroke();

        // Dot
        ctx.beginPath(); ctx.arc(endX, y, dotR, 0, Math.PI * 2);
        if (active) {
          const grad = ctx.createRadialGradient(endX, y, 0, endX, y, dotR);
          grad.addColorStop(0, gc[0]); grad.addColorStop(1, gc[1]);
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = theme.name === 'midnight' ? 'rgba(255,255,240,0.12)' : 'rgba(0,0,0,0.08)';
        }
        ctx.fill();

        // Value
        if (progress > 0.5) {
          ctx.globalAlpha = Math.min(1, (progress - 0.5) * 2);
          if (active) {
            const tg = ctx.createLinearGradient(endX, y-8, endX+40, y+8);
            tg.addColorStop(0, gc[0]); tg.addColorStop(1, gc[1]);
            ctx.fillStyle = tg;
            ctx.font = `600 12px ${theme.fontFamily}`;
          } else {
            ctx.fillStyle = theme.textSource;
            ctx.font = `400 10px ${theme.monoFamily}`;
          }
          ctx.textAlign = 'left';
          ctx.fillText(valuePrefix + this.fmt(d.value * Math.min(1, progress / 0.8)) + valueSuffix, endX + dotR + 6, y + 4);
          ctx.globalAlpha = 1;
        }
      });
    }
  }

  fmt(n: number): string {
    if (n >= 1e9) return (n/1e9).toFixed(1)+'B';
    if (n >= 1e6) return (n/1e6).toFixed(1)+'M';
    if (n >= 1e3) return (n/1e3).toFixed(1)+'K';
    return Math.round(n).toLocaleString();
  }
}
