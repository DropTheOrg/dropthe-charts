// DropThe Charts -- Bump Chart (Rankings Over Time)
// USE IN ARTICLES: Showing how rankings shift over time.
// Example: "Netflix was #1 in 2020, fell to #3 by 2025" or "FromSoftware's rise from #8 to #1"
// Best for: 3-8 entities, 4-12 time periods. Shows drama in ranking changes.
// The story is in the crossings -- where lines swap positions.

import { BaseChart, ChartConfig } from '../core/Chart';

export interface BumpSeries {
  label: string;
  ranks: number[]; // rank at each time period (1 = top)
  highlight?: boolean;
}

export interface BumpChartConfig extends ChartConfig {
  data: BumpSeries[];
  periods?: string[]; // x-axis labels (e.g., ['2020', '2021', '2022'])
  highlightTop?: number;
}

export class BumpChart extends BaseChart {
  bumpConfig: BumpChartConfig;

  constructor(container: HTMLElement | string, config: BumpChartConfig) {
    super(container, config);
    this.bumpConfig = config;
    this.padding = { top: 60, right: 90, bottom: 48, left: 90 };
    this.render();
  }

  render() {
    this.animate((progress) => this.draw(progress), 1000);
  }

  isActive(series: BumpSeries, idx: number): boolean {
    const { data, highlightTop } = this.bumpConfig;
    if (highlightTop !== undefined) {
      // Highlight series that end in top N
      const lastRank = series.ranks[series.ranks.length - 1];
      return lastRank <= highlightTop;
    }
    if (data.some(d => d.highlight)) return !!series.highlight;
    return true;
  }

  hasContrast(): boolean {
    const { data, highlightTop } = this.bumpConfig;
    if (highlightTop !== undefined) return true;
    return data.some(d => d.highlight);
  }

  draw(progress: number) {
    const { ctx, width, height, theme, padding } = this;
    const { data, periods } = this.bumpConfig;

    this.drawBackground();
    this.drawTitle();

    const nPeriods = data[0]?.ranks.length || 0;
    const maxRank = Math.max(...data.flatMap(d => d.ranks));

    const chartTop = padding.top + 8;
    const chartBottom = height - padding.bottom - 20;
    const chartLeft = padding.left;
    const chartRight = width - padding.right;
    const chartWidth = chartRight - chartLeft;
    const chartHeight = chartBottom - chartTop;

    // Rank Y positions (rank 1 at top)
    const rankY = (rank: number) => chartTop + ((rank - 1) / (maxRank - 1 || 1)) * chartHeight;
    const periodX = (i: number) => chartLeft + (i / (nPeriods - 1 || 1)) * chartWidth;

    // Grid lines for each rank
    ctx.strokeStyle = theme.grid;
    ctx.lineWidth = 1;
    for (let r = 1; r <= maxRank; r++) {
      const y = rankY(r);
      ctx.beginPath();
      ctx.moveTo(chartLeft - 8, y);
      ctx.lineTo(chartRight + 8, y);
      ctx.stroke();

      // Rank number on left
      ctx.fillStyle = theme.textSource;
      ctx.font = `400 10px ${theme.monoFamily}`;
      ctx.textAlign = 'right';
      ctx.fillText('#' + r, chartLeft - 14, y + 4);
    }

    // Period labels
    ctx.fillStyle = theme.textSecondary;
    ctx.font = `500 11px ${theme.monoFamily}`;
    ctx.textAlign = 'center';
    for (let i = 0; i < nPeriods; i++) {
      const label = periods?.[i] || (i + 1) + '';
      ctx.fillText(label, periodX(i), chartBottom + 20);
    }

    this.drawSource();
    this.snapshotBackground();

    const contrast = this.hasContrast();

    // Draw lines (inactive first, then active on top)
    const sorted = [...data.map((d, i) => ({ ...d, idx: i }))]
      .sort((a, b) => {
        const aActive = this.isActive(a, a.idx) ? 1 : 0;
        const bActive = this.isActive(b, b.idx) ? 1 : 0;
        return aActive - bActive;
      });

    sorted.forEach((series) => {
      const active = this.isActive(series, series.idx);
      const gc = series.highlight
        ? theme.highlightGradient
        : theme.gradients[series.idx % theme.gradients.length];

      // Calculate visible points based on progress
      const visiblePeriods = Math.max(1, Math.floor(nPeriods * progress));
      const points: [number, number][] = [];
      for (let i = 0; i < visiblePeriods; i++) {
        points.push([periodX(i), rankY(series.ranks[i])]);
      }
      // Partial last segment
      if (visiblePeriods < nPeriods) {
        const frac = (nPeriods * progress) - visiblePeriods;
        if (frac > 0 && visiblePeriods > 0) {
          const prevX = periodX(visiblePeriods - 1);
          const prevY = rankY(series.ranks[visiblePeriods - 1]);
          const nextX = periodX(visiblePeriods);
          const nextY = rankY(series.ranks[visiblePeriods]);
          points.push([prevX + (nextX - prevX) * frac, prevY + (nextY - prevY) * frac]);
        }
      }

      if (points.length < 2) return;

      // Draw smooth curve through points
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);

      for (let i = 1; i < points.length; i++) {
        const [x0, y0] = points[i - 1];
        const [x1, y1] = points[i];
        const cpx = (x0 + x1) / 2;
        ctx.bezierCurveTo(cpx, y0, cpx, y1, x1, y1);
      }

      if (contrast && !active) {
        const isDark = theme.name === 'midnight';
        ctx.strokeStyle = isDark ? 'rgba(255,255,240,0.1)' : 'rgba(0,0,0,0.08)';
        ctx.lineWidth = 2;
      } else {
        const grad = ctx.createLinearGradient(points[0][0], 0, points[points.length - 1][0], 0);
        grad.addColorStop(0, gc[0]);
        grad.addColorStop(1, gc[1]);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 3;
      }
      ctx.stroke();

      // Dots at each rank position
      points.forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(p[0], p[1], active ? 5 : 3, 0, Math.PI * 2);
        if (contrast && !active) {
          const isDark = theme.name === 'midnight';
          ctx.fillStyle = isDark ? 'rgba(255,255,240,0.12)' : 'rgba(0,0,0,0.08)';
        } else {
          ctx.fillStyle = gc[i < points.length / 2 ? 0 : 1];
        }
        ctx.fill();
      });

      // Start label (left)
      if (points.length > 0) {
        const [fx, fy] = points[0];
        ctx.fillStyle = (contrast && !active) ? theme.textSource : theme.textSecondary;
        ctx.font = (contrast && !active) ? `400 10px ${theme.monoFamily}` : `500 11px ${theme.monoFamily}`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(series.label, fx - 12, fy);
      }

      // End label (right) -- only when fully revealed
      if (progress > 0.9 && points.length >= nPeriods) {
        const a = Math.min(1, (progress - 0.9) * 10);
        ctx.globalAlpha = a;
        const [lx, ly] = points[points.length - 1];
        ctx.textAlign = 'left';

        if (active) {
          const tg = ctx.createLinearGradient(lx, ly - 8, lx + 60, ly + 8);
          tg.addColorStop(0, gc[0]);
          tg.addColorStop(1, gc[1]);
          ctx.fillStyle = tg;
          ctx.font = `600 12px ${theme.fontFamily}`;
        } else {
          ctx.fillStyle = theme.textSource;
          ctx.font = `400 10px ${theme.monoFamily}`;
        }
        ctx.fillText(series.label, lx + 12, ly);
        ctx.globalAlpha = 1;
      }
    });
  }
}
