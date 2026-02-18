// DropThe Charts -- Heatmap Chart
// USE IN ARTICLES: Density, availability, correlation matrices.
// Example: "Streaming availability by country" or "Entity coverage across verticals"
// Best for: 3-15 rows, 3-20 cols. Small enough to read, big enough to show patterns.
// Values: 0-1 normalized, or raw values auto-scaled.

import { BaseChart, ChartConfig } from '../core/Chart';

export interface HeatmapChartConfig extends ChartConfig {
  data: {
    rows: string[];
    cols: string[];
    values: number[][]; // rows x cols matrix
  };
  showValues?: boolean;    // show numbers in cells
  colorScale?: string[][]; // override gradient [[low1,low2],[high1,high2]]
  cellRadius?: number;     // rounded corners (default: 4)
}

export class HeatmapChart extends BaseChart {
  heatConfig: HeatmapChartConfig;

  constructor(container: HTMLElement | string, config: HeatmapChartConfig) {
    super(container, config);
    this.heatConfig = { showValues: false, cellRadius: 4, ...config };
    this.padding = { top: 60, right: 24, bottom: 24, left: 100 };
    this.render();
  }

  render() {
    this.animate((progress) => this.draw(progress), 600);
  }

  draw(progress: number) {
    const { ctx, width, height, theme, padding } = this;
    const { data, showValues, cellRadius } = this.heatConfig;
    const { rows, cols, values } = data;

    this.drawBackground();
    this.drawTitle();

    const chartTop = padding.top + 24; // room for col labels
    const chartBottom = height - padding.bottom;
    const chartLeft = padding.left;
    const chartRight = width - padding.right;
    const chartWidth = chartRight - chartLeft;
    const chartHeight = chartBottom - chartTop;

    const cellW = chartWidth / cols.length;
    const cellH = chartHeight / rows.length;
    const gap = 2;
    const r = Math.min(cellRadius || 4, cellW / 4, cellH / 4);

    // Find min/max for normalization
    const flat = values.flat();
    const minVal = Math.min(...flat);
    const maxVal = Math.max(...flat);
    const range = maxVal - minVal || 1;

    // Column labels (top)
    ctx.fillStyle = theme.textSecondary;
    ctx.font = `500 10px ${theme.monoFamily}`;
    ctx.textAlign = 'center';
    cols.forEach((col, ci) => {
      const x = chartLeft + ci * cellW + cellW / 2;
      ctx.fillText(col, x, chartTop - 8);
    });

    // Row labels (left)
    ctx.textAlign = 'right';
    rows.forEach((row, ri) => {
      const y = chartTop + ri * cellH + cellH / 2 + 4;
      ctx.fillText(row, chartLeft - 10, y);
    });

    this.drawSource();
    this.snapshotBackground();

    // Cells
    rows.forEach((_, ri) => {
      cols.forEach((_, ci) => {
        const val = values[ri]?.[ci] ?? 0;
        const norm = (val - minVal) / range;
        const intensity = norm * progress;

        const x = chartLeft + ci * cellW + gap / 2;
        const y = chartTop + ri * cellH + gap / 2;
        const w = cellW - gap;
        const h = cellH - gap;

        // Rounded rect path
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();

        if (intensity < 0.05) {
          // Empty / near-zero
          const isDark = theme.name === 'midnight';
          ctx.fillStyle = isDark ? 'rgba(255,255,240,0.03)' : 'rgba(0,0,0,0.02)';
          ctx.fill();
        } else {
          // Gradient fill based on intensity
          ctx.save();
          ctx.clip();

          // Pick gradient based on intensity (cold to hot)
          const gcIdx = Math.min(
            theme.gradients.length - 1,
            Math.floor(intensity * theme.gradients.length * 0.99)
          );
          const gc = theme.gradients[gcIdx];

          const grad = ctx.createLinearGradient(x, y, x + w, y + h);
          grad.addColorStop(0, gc[0] + this.alphaHex(intensity));
          grad.addColorStop(1, gc[1] + this.alphaHex(intensity));
          ctx.fillStyle = grad;
          ctx.fillRect(x, y, w, h);

          // Lava blob for high-value cells
          if (intensity > 0.6) {
            const s = (n: number) => { let v = Math.sin(ri * 127.1 + ci * 311.7 + n * 43.7) * 43758.5453; return v - Math.floor(v); };
            const bx = x + w * (0.2 + s(0) * 0.6);
            const by = y + h * (0.2 + s(1) * 0.6);
            const blobR = Math.max(w, h) * 0.6;
            const rg = ctx.createRadialGradient(bx, by, 0, bx, by, blobR);
            rg.addColorStop(0, gc[1]);
            rg.addColorStop(0.5, gc[1] + '66');
            rg.addColorStop(1, gc[1] + '00');
            ctx.globalCompositeOperation = 'source-atop';
            ctx.fillStyle = rg;
            ctx.fillRect(x, y, w, h);
            ctx.globalCompositeOperation = 'source-over';
          }
          ctx.restore();
        }

        // Cell value text
        if (showValues && progress > 0.5 && cellW > 30 && cellH > 20) {
          const a = Math.min(1, (progress - 0.5) * 2);
          ctx.globalAlpha = a;
          ctx.fillStyle = intensity > 0.5 ? theme.bg : theme.textSecondary;
          ctx.font = `500 ${Math.min(11, cellH * 0.4)}px ${theme.monoFamily}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(this.formatCellValue(val), x + w / 2, y + h / 2);
          ctx.globalAlpha = 1;
        }
      });
    });
  }

  alphaHex(intensity: number): string {
    const alpha = Math.round(intensity * 220 + 35);
    return alpha.toString(16).padStart(2, '0');
  }

  formatCellValue(v: number): string {
    if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M';
    if (v >= 1e3) return (v / 1e3).toFixed(1) + 'K';
    if (Number.isInteger(v)) return v + '';
    return v.toFixed(1);
  }
}
