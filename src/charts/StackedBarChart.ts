// DropThe Charts -- Stacked Bar Chart
// USE: Part-to-whole comparisons across categories. "Revenue breakdown by segment per company"
// WHEN: Multiple categories, each with sub-components. Shows composition AND comparison.
// NOT: When stacks have too many segments (>5). When segments are very small.

import { BaseChart, ChartConfig } from '../core/Chart';

export interface StackedBarChartConfig extends ChartConfig {
  data: {
    categories: string[];
    series: { label: string; values: number[]; highlight?: boolean }[];
  };
  horizontal?: boolean;
  showValues?: boolean;
  normalized?: boolean; // 100% stacked
}

export class StackedBarChart extends BaseChart {
  stackConfig: StackedBarChartConfig;

  constructor(container: HTMLElement | string, config: StackedBarChartConfig) {
    super(container, config);
    this.stackConfig = { showValues: false, normalized: false, horizontal: false, ...config };
    this.padding = config.horizontal
      ? { top: 60, right: 24, bottom: 48, left: 100 }
      : { top: 60, right: 24, bottom: 48, left: 40 };
    this.render();
  }

  render() { this.animate((p) => this.draw(p)); }

  draw(progress: number) {
    const { ctx, width, height, theme, padding } = this;
    const { data, horizontal, showValues, normalized } = this.stackConfig;
    const { categories, series } = data;

    this.drawBackground();
    this.drawTitle();

    const cT = padding.top + 8, cB = height - padding.bottom - 20;
    const cL = padding.left, cR = width - padding.right;
    const cW = cR - cL, cH = cB - cT;

    // Calculate totals per category
    const totals = categories.map((_, ci) => series.reduce((s, sr) => s + sr.values[ci], 0));
    const maxVal = normalized ? 1 : Math.max(...totals) * 1.1;
    const barR = 4;

    const hasHL = series.some(s => s.highlight);

    if (horizontal) {
      const barH = Math.min(40, (cH - (categories.length - 1) * 8) / categories.length);
      const gap = (cH - categories.length * barH) / (categories.length - 1 || 1);

      // Category labels
      ctx.fillStyle = theme.textSecondary; ctx.font = `400 11px ${theme.monoFamily}`;
      ctx.textAlign = 'right';
      categories.forEach((cat, ci) => {
        ctx.fillText(cat, cL - 10, cT + ci * (barH + gap) + barH / 2 + 4);
      });

      this.drawSource(); this.snapshotBackground();

      categories.forEach((_, ci) => {
        const total = totals[ci];
        let x = cL;
        series.forEach((sr, si) => {
          const val = sr.values[ci];
          const frac = normalized ? val / total : val / maxVal;
          const w = frac * cW * progress;
          const y = cT + ci * (barH + gap);
          const active = !hasHL || sr.highlight;
          const gc = sr.highlight ? theme.highlightGradient : theme.gradients[si % theme.gradients.length];

          if (w > 1) {
            ctx.beginPath(); ctx.rect(x, y, w, barH); ctx.closePath();
            if (active) {
              ctx.save(); ctx.clip();
              const grad = ctx.createLinearGradient(x, y, x + w, y + barH);
              grad.addColorStop(0, gc[0]); grad.addColorStop(1, gc[1]);
              ctx.fillStyle = grad; ctx.fillRect(x, y, w, barH);
              ctx.restore();
            } else {
              const isDark = theme.name === 'midnight';
              ctx.fillStyle = isDark ? 'rgba(255,255,240,0.06)' : 'rgba(0,0,0,0.04)';
              ctx.fill();
            }
            // Separator
            ctx.strokeStyle = theme.bg; ctx.lineWidth = 1; ctx.stroke();
          }
          x += w;
        });
      });
    } else {
      const barW = Math.min(60, (cW - (categories.length - 1) * 12) / categories.length);
      const gap = (cW - categories.length * barW) / (categories.length - 1 || 1);

      // Grid
      ctx.strokeStyle = theme.grid; ctx.lineWidth = 1;
      for (let i = 1; i <= 4; i++) {
        const y = cB - (cH * i / 4);
        ctx.beginPath(); ctx.moveTo(cL, y); ctx.lineTo(cR, y); ctx.stroke();
      }

      // Category labels
      ctx.fillStyle = theme.textSecondary; ctx.font = `400 11px ${theme.monoFamily}`;
      ctx.textAlign = 'center';
      categories.forEach((cat, ci) => {
        ctx.fillText(cat, cL + ci * (barW + gap) + barW / 2, cB + 16);
      });

      this.drawSource(); this.snapshotBackground();

      categories.forEach((_, ci) => {
        const total = totals[ci];
        let y = cB;
        series.forEach((sr, si) => {
          const val = sr.values[ci];
          const frac = normalized ? val / total : val / maxVal;
          const h = frac * cH * progress;
          const x = cL + ci * (barW + gap);
          y -= h;
          const active = !hasHL || sr.highlight;
          const gc = sr.highlight ? theme.highlightGradient : theme.gradients[si % theme.gradients.length];

          if (h > 1) {
            ctx.beginPath(); ctx.rect(x, y, barW, h); ctx.closePath();
            if (active) {
              ctx.save(); ctx.clip();
              const grad = ctx.createLinearGradient(x, y, x, y + h);
              grad.addColorStop(0, gc[0]); grad.addColorStop(1, gc[1]);
              ctx.fillStyle = grad; ctx.fillRect(x, y, barW, h);
              ctx.restore();
            } else {
              const isDark = theme.name === 'midnight';
              ctx.fillStyle = isDark ? 'rgba(255,255,240,0.06)' : 'rgba(0,0,0,0.04)';
              ctx.fill();
            }
            ctx.strokeStyle = theme.bg; ctx.lineWidth = 1; ctx.stroke();
          }
        });
      });
    }

    // Legend
    if (progress > 0.8) {
      const a = Math.min(1, (progress - 0.8) / 0.2);
      ctx.globalAlpha = a;
      let lx = cL;
      series.forEach((sr, si) => {
        const gc = sr.highlight ? theme.highlightGradient : theme.gradients[si % theme.gradients.length];
        const active = !hasHL || sr.highlight;
        ctx.fillStyle = active ? gc[0] : theme.textSource;
        ctx.fillRect(lx, height - 16, 10, 3);
        ctx.fillStyle = active ? theme.textSecondary : theme.textSource;
        ctx.font = `500 10px ${theme.fontFamily}`; ctx.textAlign = 'left';
        ctx.fillText(sr.label, lx + 14, height - 12);
        lx += ctx.measureText(sr.label).width + 30;
      });
      ctx.globalAlpha = 1;
    }
  }
}
