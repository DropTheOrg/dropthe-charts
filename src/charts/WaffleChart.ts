// DropThe Charts -- Waffle Chart
// USE: Proportions that feel tangible. "7 out of 10 startups fail"
// WHEN: Percentage or ratio, simple part-to-whole story, 1-3 categories max.
// NOT: When you have many categories (use donut). When precision matters (use bar).

import { BaseChart, ChartConfig } from '../core/Chart';

export interface WaffleChartConfig extends ChartConfig {
  data: { label: string; value: number; highlight?: boolean }[];
  total?: number; // override total (default: sum of values)
  gridSize?: number; // cells per side (default: 10 = 100 cells)
}

export class WaffleChart extends BaseChart {
  waffleConfig: WaffleChartConfig;

  constructor(container: HTMLElement | string, config: WaffleChartConfig) {
    super(container, config);
    this.waffleConfig = { gridSize: 10, ...config };
    this.render();
  }

  render() { this.animate((p) => this.draw(p), 600); }

  draw(progress: number) {
    const { ctx, width, height, theme, padding } = this;
    const { data, total, gridSize } = this.waffleConfig;
    const n = gridSize || 10;
    const totalCells = n * n;
    const sum = total || data.reduce((s, d) => s + d.value, 0);

    this.drawBackground();
    this.drawTitle();

    const chartTop = padding.top + 8;
    const chartBottom = height - padding.bottom - 30; // room for legend
    const chartLeft = padding.left + 20;
    const chartRight = width - padding.right - 20;
    const availW = chartRight - chartLeft;
    const availH = chartBottom - chartTop;
    const cellSize = Math.min(availW / n, availH / n);
    const gap = Math.max(2, cellSize * 0.1);
    const actualCell = cellSize - gap;
    const gridW = n * cellSize;
    const gridH = n * cellSize;
    const offsetX = chartLeft + (availW - gridW) / 2;
    const offsetY = chartTop + (availH - gridH) / 2;
    const r = Math.min(3, actualCell / 4);

    // Build cell assignments
    const cells: number[] = new Array(totalCells).fill(-1);
    let cellIdx = 0;
    data.forEach((d, di) => {
      const count = Math.round((d.value / sum) * totalCells);
      for (let j = 0; j < count && cellIdx < totalCells; j++) {
        cells[cellIdx++] = di;
      }
    });
    // Fill remaining
    while (cellIdx < totalCells) { cells[cellIdx++] = data.length - 1; }

    this.drawSource();
    this.snapshotBackground();

    const visibleCells = Math.floor(totalCells * progress);
    const hasHL = data.some(d => d.highlight);

    for (let i = 0; i < totalCells; i++) {
      const col = i % n;
      const row = Math.floor(i / n);
      const x = offsetX + col * cellSize;
      const y = offsetY + row * cellSize;
      const di = cells[i];
      const visible = i < visibleCells;
      const active = di >= 0 && (!hasHL || data[di]?.highlight);

      ctx.beginPath();
      ctx.moveTo(x + r, y); ctx.lineTo(x + actualCell - r, y);
      ctx.quadraticCurveTo(x + actualCell, y, x + actualCell, y + r);
      ctx.lineTo(x + actualCell, y + actualCell - r);
      ctx.quadraticCurveTo(x + actualCell, y + actualCell, x + actualCell - r, y + actualCell);
      ctx.lineTo(x + r, y + actualCell);
      ctx.quadraticCurveTo(x, y + actualCell, x, y + actualCell - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();

      if (!visible || di < 0) {
        const isDark = theme.name === 'midnight';
        ctx.fillStyle = isDark ? 'rgba(255,255,240,0.03)' : 'rgba(0,0,0,0.02)';
        ctx.fill();
      } else if (active) {
        ctx.save(); ctx.clip();
        const gc = data[di].highlight ? theme.highlightGradient : theme.gradients[di % theme.gradients.length];
        const grad = ctx.createLinearGradient(x, y, x + actualCell, y + actualCell);
        grad.addColorStop(0, gc[0]); grad.addColorStop(1, gc[1]);
        ctx.fillStyle = grad; ctx.fillRect(x, y, actualCell, actualCell);
        ctx.restore();
      } else {
        const isDark = theme.name === 'midnight';
        ctx.fillStyle = isDark ? 'rgba(255,255,240,0.06)' : 'rgba(0,0,0,0.04)';
        ctx.fill();
      }
    }

    // Legend
    if (progress > 0.7) {
      const a = Math.min(1, (progress - 0.7) / 0.3);
      ctx.globalAlpha = a;
      let lx = offsetX;
      data.forEach((d, di) => {
        const gc = d.highlight ? theme.highlightGradient : theme.gradients[di % theme.gradients.length];
        const active = !hasHL || d.highlight;
        ctx.fillStyle = active ? gc[0] : theme.textSource;
        ctx.fillRect(lx, offsetY + gridH + 12, 10, 10);
        ctx.fillStyle = active ? theme.textSecondary : theme.textSource;
        ctx.font = `500 11px ${theme.fontFamily}`;
        ctx.textAlign = 'left';
        const pct = Math.round((d.value / sum) * 100);
        ctx.fillText(`${d.label} ${pct}%`, lx + 14, offsetY + gridH + 21);
        lx += ctx.measureText(`${d.label} ${pct}%`).width + 30;
      });
      ctx.globalAlpha = 1;
    }
  }
}
