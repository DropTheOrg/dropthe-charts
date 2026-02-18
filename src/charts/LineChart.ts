// DropThe Charts -- Line Chart (Time-Series)
// Lava gradient area fills

import { BaseChart, ChartConfig } from '../core/Chart';

export interface LineDataPoint {
  x: number | string;
  y: number;
}

export interface LineSeries {
  label: string;
  data: LineDataPoint[];
  color?: string;
}

export interface LineChartConfig extends ChartConfig {
  data: LineSeries[];
  showDots?: boolean;
  showArea?: boolean;
  yPrefix?: string;
  ySuffix?: string;
}

export class LineChart extends BaseChart {
  lineConfig: LineChartConfig;

  constructor(container: HTMLElement | string, config: LineChartConfig) {
    super(container, config);
    this.lineConfig = { showDots: true, showArea: true, ...config };
    this.render();
  }

  render() {
    this.animate((progress) => this.draw(progress));
  }

  draw(progress: number) {
    const { ctx, width, height, theme, padding, lineConfig } = this;
    const { data: series, showDots, showArea, yPrefix = '', ySuffix = '' } = lineConfig;

    this.drawBackground();
    this.drawTitle();

    const chartTop = padding.top + 8;
    const chartBottom = height - padding.bottom - 20;
    const chartLeft = padding.left + 50;
    const chartRight = width - padding.right;
    const chartWidth = chartRight - chartLeft;
    const chartHeight = chartBottom - chartTop;

    const allY = series.flatMap(s => s.data.map(d => d.y));
    const minY = Math.min(...allY) * 0.95;
    const maxY = Math.max(...allY) * 1.05;
    const yRange = maxY - minY || 1;

    const allX = series[0]?.data.map(d => Number(d.x)) || [];
    const minX = Math.min(...allX);
    const maxX = Math.max(...allX);
    const xRange = maxX - minX || 1;

    // Y grid
    const yTicks = 5;
    ctx.strokeStyle = theme.grid;
    ctx.lineWidth = 1;
    for (let i = 0; i <= yTicks; i++) {
      const frac = i / yTicks;
      const y = chartBottom - frac * chartHeight;
      const val = minY + frac * yRange;
      ctx.beginPath();
      ctx.moveTo(chartLeft, y);
      ctx.lineTo(chartRight, y);
      ctx.stroke();
      ctx.fillStyle = theme.textSecondary;
      ctx.font = `400 10px ${theme.monoFamily}`;
      ctx.textAlign = 'right';
      ctx.fillText(yPrefix + this.formatVal(val) + ySuffix, chartLeft - 8, y + 4);
    }

    // X labels
    const xLabelCount = Math.min(allX.length, 8);
    const xStep = Math.max(1, Math.floor(allX.length / xLabelCount));
    ctx.fillStyle = theme.textSecondary;
    ctx.font = `400 10px ${theme.monoFamily}`;
    ctx.textAlign = 'center';
    for (let i = 0; i < allX.length; i += xStep) {
      const px = chartLeft + ((allX[i] - minX) / xRange) * chartWidth;
      ctx.fillText(String(allX[i]), px, chartBottom + 16);
    }

    // Baseline
    ctx.strokeStyle = theme.textSecondary + '40';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(chartLeft, chartBottom);
    ctx.lineTo(chartRight, chartBottom);
    ctx.stroke();

    // Legend
    if (series.length > 1) {
      let legendX = chartLeft;
      const legendY = chartBottom + 32;
      series.forEach((s, si) => {
        const color = s.color || theme.gradients[si % theme.gradients.length][0];
        ctx.fillStyle = color;
        ctx.fillRect(legendX, legendY - 4, 12, 3);
        ctx.fillStyle = theme.textSecondary;
        ctx.font = `400 10px ${theme.monoFamily}`;
        ctx.textAlign = 'left';
        ctx.fillText(s.label, legendX + 16, legendY);
        legendX += ctx.measureText(s.label).width + 32;
      });
    }

    this.drawSource();
    this.snapshotBackground();

    // Draw series
    series.forEach((s, si) => {
      const color = s.color || theme.gradients[si % theme.gradients.length][0];
      const gradColors = theme.gradients[si % theme.gradients.length];
      const points: [number, number][] = [];

      s.data.forEach(d => {
        const px = chartLeft + ((Number(d.x) - minX) / xRange) * chartWidth;
        const py = chartBottom - ((d.y - minY) / yRange) * chartHeight;
        points.push([px, py]);
      });

      const visibleCount = Math.max(1, Math.floor(points.length * progress));
      const visible = points.slice(0, visibleCount);

      // Area fill with lava blobs
      if (showArea && visible.length > 1) {
        ctx.save();

        // Create area path
        ctx.beginPath();
        ctx.moveTo(visible[0][0], chartBottom);
        visible.forEach(([x, y]) => ctx.lineTo(x, y));
        ctx.lineTo(visible[visible.length - 1][0], chartBottom);
        ctx.closePath();
        ctx.clip();

        // Base fill
        const baseGrad = ctx.createLinearGradient(0, chartTop, 0, chartBottom);
        baseGrad.addColorStop(0, gradColors[0] + '50');
        baseGrad.addColorStop(1, gradColors[0] + '05');
        ctx.fillStyle = baseGrad;
        ctx.fillRect(chartLeft, chartTop, chartWidth, chartHeight);

        // Lava blobs inside area
        const areaMinX = visible[0][0];
        const areaMaxX = visible[visible.length - 1][0];
        const areaW = areaMaxX - areaMinX;
        const blobCount = 6;
        for (let i = 0; i < blobCount; i++) {
          let v = Math.sin(si * 127.1 + i * 311.7) * 43758.5453;
          const rand = v - Math.floor(v);
          let v2 = Math.sin(si * 127.1 + (i * 3 + 1) * 311.7) * 43758.5453;
          const rand2 = v2 - Math.floor(v2);
          let v3 = Math.sin(si * 127.1 + (i * 3 + 2) * 311.7) * 43758.5453;
          const rand3 = v3 - Math.floor(v3);

          const bx = areaMinX + areaW * (0.05 + rand * 0.9);
          const by = chartTop + chartHeight * (0.2 + rand2 * 0.6);
          const radius = chartHeight * (0.3 + rand3 * 0.4);
          const blobColor = gradColors[i % gradColors.length];

          const radGrad = ctx.createRadialGradient(bx, by, 0, bx, by, radius);
          radGrad.addColorStop(0, blobColor + '60');
          radGrad.addColorStop(0.5, blobColor + '30');
          radGrad.addColorStop(1, blobColor + '00');

          ctx.fillStyle = radGrad;
          ctx.fillRect(chartLeft, chartTop, chartWidth, chartHeight);
        }

        ctx.restore();
      }

      // Line
      if (visible.length > 1) {
        ctx.beginPath();
        ctx.moveTo(visible[0][0], visible[0][1]);
        for (let i = 1; i < visible.length; i++) {
          ctx.lineTo(visible[i][0], visible[i][1]);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // Dots
      if (showDots && progress > 0.8) {
        const dotAlpha = (progress - 0.8) * 5;
        ctx.globalAlpha = dotAlpha;
        visible.forEach(([x, y]) => {
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.strokeStyle = theme.bg;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });
        ctx.globalAlpha = 1;
      }
    });
  }

  formatVal(n: number): string {
    if (Math.abs(n) >= 1e12) return (n / 1e12).toFixed(1) + 'T';
    if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(1) + 'B';
    if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return n.toFixed(0);
  }
}
