// DropThe Charts -- Area Chart (+ Stacked Area)
// USE: Volume over time. Shows magnitude, not just trend. 
// WHEN: "Total market value over time" or stacked: "share of market by platform over time"
// NOT: When you want to emphasize rate of change (use line). When areas overlap too much.

import { BaseChart, ChartConfig } from '../core/Chart';

export interface AreaSeries {
  label: string;
  data: { x: number; y: number }[];
  highlight?: boolean;
}

export interface AreaChartConfig extends ChartConfig {
  data: AreaSeries[];
  stacked?: boolean;
  yPrefix?: string;
  ySuffix?: string;
}

export class AreaChart extends BaseChart {
  areaConfig: AreaChartConfig;

  constructor(container: HTMLElement | string, config: AreaChartConfig) {
    super(container, config);
    this.areaConfig = { stacked: false, ...config };
    this.padding = { top: 60, right: 24, bottom: 48, left: 56 };
    this.render();
  }

  render() { this.animate((p) => this.draw(p)); }

  draw(progress: number) {
    const { ctx, width, height, theme, padding } = this;
    const { data, stacked, yPrefix = '', ySuffix = '' } = this.areaConfig;

    this.drawBackground();
    this.drawTitle();

    const cT = padding.top + 8, cB = height - padding.bottom - 20;
    const cL = padding.left, cR = width - padding.right;
    const cW = cR - cL, cH = cB - cT;

    // Build stacked values
    const nPoints = data[0]?.data.length || 0;
    const xVals = data[0]?.data.map(d => d.x) || [];
    const xMin = Math.min(...xVals), xMax = Math.max(...xVals);
    const xR = xMax - xMin || 1;

    let stackedVals: number[][] = [];
    if (stacked) {
      stackedVals = new Array(data.length).fill(null).map(() => new Array(nPoints).fill(0));
      for (let pi = 0; pi < nPoints; pi++) {
        let cumul = 0;
        for (let si = 0; si < data.length; si++) {
          cumul += data[si].data[pi]?.y || 0;
          stackedVals[si][pi] = cumul;
        }
      }
    }

    const allY = stacked
      ? stackedVals[data.length - 1] || []
      : data.flatMap(s => s.data.map(d => d.y));
    const yMax = Math.max(...allY) * 1.1;
    const yMin = stacked ? 0 : Math.min(0, Math.min(...allY));
    const yR = yMax - yMin || 1;

    const toX = (x: number) => cL + ((x - xMin) / xR) * cW;
    const toY = (y: number) => cB - ((y - yMin) / yR) * cH;

    // Grid + labels
    ctx.strokeStyle = theme.grid; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = cB - (cH * i / 4);
      ctx.beginPath(); ctx.moveTo(cL, y); ctx.lineTo(cR, y); ctx.stroke();
      ctx.fillStyle = theme.textSecondary; ctx.font = `400 10px ${theme.monoFamily}`;
      ctx.textAlign = 'right';
      ctx.fillText(yPrefix + this.fmt(yMin + yR * i / 4) + ySuffix, cL - 8, y + 4);
    }
    const xStep = Math.max(1, Math.floor(nPoints / 8));
    ctx.textAlign = 'center';
    for (let i = 0; i < nPoints; i += xStep) {
      ctx.fillText(String(xVals[i]), toX(xVals[i]), cB + 16);
    }

    this.drawSource(); this.snapshotBackground();

    const hasHL = data.some(s => s.highlight);

    // Draw areas (back to front for stacked)
    for (let si = data.length - 1; si >= 0; si--) {
      const series = data[si];
      const active = !hasHL || series.highlight;
      const gc = series.highlight ? theme.highlightGradient : theme.gradients[si % theme.gradients.length];
      const visiblePts = Math.max(2, Math.ceil(nPoints * progress));

      const topPoints: [number, number][] = [];
      const botPoints: [number, number][] = [];

      for (let pi = 0; pi < visiblePts && pi < nPoints; pi++) {
        const x = toX(xVals[pi]);
        if (stacked) {
          topPoints.push([x, toY(stackedVals[si][pi])]);
          botPoints.push([x, si > 0 ? toY(stackedVals[si - 1][pi]) : toY(0)]);
        } else {
          topPoints.push([x, toY(series.data[pi].y)]);
          botPoints.push([x, toY(0)]);
        }
      }

      // Area fill
      ctx.beginPath();
      topPoints.forEach((p, i) => i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]));
      for (let i = botPoints.length - 1; i >= 0; i--) ctx.lineTo(botPoints[i][0], botPoints[i][1]);
      ctx.closePath();

      if (active) {
        const areaGrad = ctx.createLinearGradient(0, cT, 0, cB);
        areaGrad.addColorStop(0, gc[0] + '66');
        areaGrad.addColorStop(1, gc[1] + '11');
        ctx.fillStyle = areaGrad;
      } else {
        const isDark = theme.name === 'midnight';
        ctx.fillStyle = isDark ? 'rgba(255,255,240,0.04)' : 'rgba(0,0,0,0.02)';
      }
      ctx.fill();

      // Stroke top line
      ctx.beginPath();
      topPoints.forEach((p, i) => i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]));
      if (active) {
        const strokeGrad = ctx.createLinearGradient(topPoints[0][0], 0, topPoints[topPoints.length-1][0], 0);
        strokeGrad.addColorStop(0, gc[0]); strokeGrad.addColorStop(1, gc[1]);
        ctx.strokeStyle = strokeGrad; ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = theme.name === 'midnight' ? 'rgba(255,255,240,0.1)' : 'rgba(0,0,0,0.06)';
        ctx.lineWidth = 1;
      }
      ctx.stroke();
    }

    // Legend
    if (data.length > 1 && progress > 0.8) {
      const a = Math.min(1, (progress - 0.8) / 0.2);
      ctx.globalAlpha = a;
      let lx = cL;
      data.forEach((s, si) => {
        const gc = s.highlight ? theme.highlightGradient : theme.gradients[si % theme.gradients.length];
        const active = !hasHL || s.highlight;
        ctx.fillStyle = active ? gc[0] : theme.textSource;
        ctx.fillRect(lx, height - 14, 12, 3);
        ctx.fillStyle = active ? theme.textSecondary : theme.textSource;
        ctx.font = `500 10px ${theme.fontFamily}`; ctx.textAlign = 'left';
        ctx.fillText(s.label, lx + 16, height - 10);
        lx += ctx.measureText(s.label).width + 32;
      });
      ctx.globalAlpha = 1;
    }
  }

  fmt(n: number): string {
    if (Math.abs(n) >= 1e9) return (n/1e9).toFixed(1)+'B';
    if (Math.abs(n) >= 1e6) return (n/1e6).toFixed(1)+'M';
    if (Math.abs(n) >= 1e3) return (n/1e3).toFixed(1)+'K';
    return Math.round(n)+'';
  }
}
