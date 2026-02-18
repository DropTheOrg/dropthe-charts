// DropThe Charts -- Radar Chart
// USE IN ARTICLES: Entity comparisons across multiple dimensions.
// Example: "How does FromSoftware compare to Nintendo across metacritic, titles, revenue?"
// Best for: 4-8 axes, 1-3 overlapping datasets. More than 3 gets noisy.

import { BaseChart, ChartConfig } from '../core/Chart';

export interface RadarDataset {
  label: string;
  values: number[];
  highlight?: boolean;
}

export interface RadarChartConfig extends ChartConfig {
  data: {
    axes: string[];
    datasets: RadarDataset[];
    maxValue?: number; // override auto-max
  };
}

export class RadarChart extends BaseChart {
  radarConfig: RadarChartConfig;

  constructor(container: HTMLElement | string, config: RadarChartConfig) {
    super(container, config);
    this.radarConfig = config;
    this.render();
  }

  render() {
    this.animate((progress) => this.draw(progress));
  }

  draw(progress: number) {
    const { ctx, width, height, theme, padding } = this;
    const { data } = this.radarConfig;
    const { axes, datasets, maxValue } = data;
    const n = axes.length;
    if (n < 3) return;

    this.drawBackground();
    this.drawTitle();

    const cx = width / 2;
    const cy = padding.top + (height - padding.top - padding.bottom) / 2 + 8;
    const radius = Math.min(
      (width - padding.left - padding.right) / 2 - 40,
      (height - padding.top - padding.bottom) / 2 - 30
    );

    const max = maxValue || Math.max(...datasets.flatMap(d => d.values)) * 1.1;
    const angleStep = (Math.PI * 2) / n;
    const startAngle = -Math.PI / 2; // top

    // Grid rings (5 levels)
    const rings = 5;
    ctx.strokeStyle = theme.grid;
    ctx.lineWidth = 1;
    for (let r = 1; r <= rings; r++) {
      const ringR = (radius * r) / rings;
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const angle = startAngle + i * angleStep;
        const x = cx + Math.cos(angle) * ringR;
        const y = cy + Math.sin(angle) * ringR;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Axis lines
    for (let i = 0; i < n; i++) {
      const angle = startAngle + i * angleStep;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    // Axis labels
    ctx.fillStyle = theme.textSecondary;
    ctx.font = `500 11px ${theme.monoFamily}`;
    for (let i = 0; i < n; i++) {
      const angle = startAngle + i * angleStep;
      const labelR = radius + 18;
      const x = cx + Math.cos(angle) * labelR;
      const y = cy + Math.sin(angle) * labelR;

      // Align based on position
      if (Math.abs(Math.cos(angle)) < 0.1) {
        ctx.textAlign = 'center';
      } else if (Math.cos(angle) > 0) {
        ctx.textAlign = 'left';
      } else {
        ctx.textAlign = 'right';
      }
      ctx.textBaseline = Math.abs(Math.sin(angle)) < 0.1 ? 'middle'
        : Math.sin(angle) < 0 ? 'bottom' : 'top';

      ctx.fillText(axes[i], x, y);
    }

    this.drawSource();
    this.snapshotBackground();

    // Dataset fills
    const hasHighlight = datasets.some(d => d.highlight);

    datasets.forEach((dataset, di) => {
      const active = !hasHighlight || dataset.highlight;
      const points: [number, number][] = [];

      for (let i = 0; i < n; i++) {
        const angle = startAngle + i * angleStep;
        const val = (dataset.values[i] || 0) / max;
        const r = val * radius * progress;
        points.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]);
      }

      // Fill area
      ctx.beginPath();
      points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p[0], p[1]);
        else ctx.lineTo(p[0], p[1]);
      });
      ctx.closePath();

      if (active) {
        const gc = dataset.highlight
          ? theme.highlightGradient
          : theme.gradients[di % theme.gradients.length];
        const fillGrad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
        fillGrad.addColorStop(0, gc[0] + '55');
        fillGrad.addColorStop(1, gc[1] + '55');
        ctx.fillStyle = fillGrad;
        ctx.fill();

        // Stroke
        const strokeGrad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
        strokeGrad.addColorStop(0, gc[0]);
        strokeGrad.addColorStop(1, gc[1]);
        ctx.strokeStyle = strokeGrad;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Dots at vertices
        points.forEach(p => {
          ctx.beginPath();
          ctx.arc(p[0], p[1], 4, 0, Math.PI * 2);
          ctx.fillStyle = gc[0];
          ctx.fill();
        });
      } else {
        const isDark = theme.name === 'midnight';
        ctx.fillStyle = isDark ? 'rgba(255,255,240,0.04)' : 'rgba(0,0,0,0.03)';
        ctx.fill();
        ctx.strokeStyle = isDark ? 'rgba(255,255,240,0.15)' : 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });

    // Legend
    if (datasets.length > 1) {
      const legendY = height - padding.bottom + 4;
      let legendX = padding.left;
      ctx.font = `500 11px ${theme.fontFamily}`;
      datasets.forEach((dataset, di) => {
        const active = !hasHighlight || dataset.highlight;
        const gc = dataset.highlight
          ? theme.highlightGradient
          : theme.gradients[di % theme.gradients.length];
        ctx.fillStyle = active ? gc[0] : theme.textSource;
        ctx.fillRect(legendX, legendY - 4, 12, 3);
        ctx.fillStyle = active ? theme.textSecondary : theme.textSource;
        ctx.textAlign = 'left';
        ctx.fillText(dataset.label, legendX + 16, legendY);
        legendX += ctx.measureText(dataset.label).width + 36;
      });
    }
  }
}
