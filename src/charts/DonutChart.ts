// DropThe Charts -- Donut Chart
// USE IN ARTICLES: Market share, proportions, single-metric gauges.
// Example: "Netflix holds 35% of the streaming market" or "Feelgood Score: 78/100"
// Best for: 2-7 segments. More than 7 = use bar chart instead.
// Gauge mode: single value 0-100, perfect for scores and ratings.

import { BaseChart, ChartConfig } from '../core/Chart';

export interface DonutDataPoint {
  label: string;
  value: number;
  highlight?: boolean;
}

export interface DonutChartConfig extends ChartConfig {
  data: DonutDataPoint[];
  centerLabel?: string;
  centerValue?: string;
  gauge?: boolean;      // single-value gauge mode (0-100)
  gaugeValue?: number;  // value for gauge mode
  ringWidth?: number;   // thickness of the ring (default: 0.35 of radius)
}

export class DonutChart extends BaseChart {
  donutConfig: DonutChartConfig;

  constructor(container: HTMLElement | string, config: DonutChartConfig) {
    super(container, config);
    this.donutConfig = { ringWidth: 0.35, ...config };
    this.render();
  }

  render() {
    this.animate((progress) => this.draw(progress));
  }

  draw(progress: number) {
    const { ctx, width, height, theme, padding } = this;

    this.drawBackground();
    this.drawTitle();

    const cx = width / 2;
    const cy = padding.top + (height - padding.top - padding.bottom) / 2 + 8;
    const outerR = Math.min(
      (width - padding.left - padding.right) / 2 - 20,
      (height - padding.top - padding.bottom) / 2 - 20
    );
    const ringRatio = this.donutConfig.ringWidth || 0.35;
    const innerR = outerR * (1 - ringRatio);

    this.drawSource();
    this.snapshotBackground();

    if (this.donutConfig.gauge) {
      this.drawGauge(cx, cy, outerR, innerR, progress);
    } else {
      this.drawDonut(cx, cy, outerR, innerR, progress);
    }
  }

  drawGauge(cx: number, cy: number, outerR: number, innerR: number, progress: number) {
    const { ctx, theme } = this;
    const val = Math.min(100, Math.max(0, this.donutConfig.gaugeValue || 0));
    const sweepAngle = Math.PI * 1.5; // 270 degrees
    const startAngle = Math.PI * 0.75; // start from bottom-left
    const endAngle = startAngle + sweepAngle;
    const fillAngle = startAngle + (sweepAngle * (val / 100)) * progress;

    // Background track
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, startAngle, endAngle);
    ctx.arc(cx, cy, innerR, endAngle, startAngle, true);
    ctx.closePath();
    const isDark = theme.name === 'midnight';
    ctx.fillStyle = isDark ? 'rgba(255,255,240,0.05)' : 'rgba(0,0,0,0.04)';
    ctx.fill();

    // Filled arc
    if (val > 0 && progress > 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, startAngle, fillAngle);
      ctx.arc(cx, cy, innerR, fillAngle, startAngle, true);
      ctx.closePath();

      ctx.save();
      ctx.clip();
      const gc = theme.highlightGradient;
      const grad = ctx.createLinearGradient(cx - outerR, cy - outerR, cx + outerR, cy + outerR);
      grad.addColorStop(0, gc[0]);
      grad.addColorStop(1, gc[1]);
      ctx.fillStyle = grad;
      ctx.fillRect(cx - outerR, cy - outerR, outerR * 2, outerR * 2);

      // Lava blobs inside the arc
      this.drawLavaInArc(cx, cy, outerR, gc);
      ctx.restore();
    }

    // Center value
    const cp = Math.min(1, (progress - 0.2) / 0.6);
    if (cp > 0) {
      const displayVal = Math.round(val * Math.min(1, cp));
      ctx.globalAlpha = Math.min(1, cp * 1.5);

      const gc = theme.highlightGradient;
      const tg = ctx.createLinearGradient(cx - 30, cy, cx + 30, cy);
      tg.addColorStop(0, gc[0]);
      tg.addColorStop(1, gc[1]);
      ctx.fillStyle = tg;
      ctx.font = `700 ${Math.round(outerR * 0.45)}px ${theme.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(displayVal + '', cx, cy - 6);

      if (this.donutConfig.centerLabel) {
        ctx.fillStyle = theme.textSecondary;
        ctx.font = `400 13px ${theme.fontFamily}`;
        ctx.fillText(this.donutConfig.centerLabel, cx, cy + outerR * 0.25);
      }
      ctx.globalAlpha = 1;
    }
  }

  drawDonut(cx: number, cy: number, outerR: number, innerR: number, progress: number) {
    const { ctx, theme } = this;
    const { data } = this.donutConfig;
    const total = data.reduce((s, d) => s + d.value, 0);
    const hasHighlight = data.some(d => d.highlight);

    let currentAngle = -Math.PI / 2; // start from top

    data.forEach((d, i) => {
      const sliceAngle = (d.value / total) * Math.PI * 2 * progress;
      const endAngle = currentAngle + sliceAngle;
      const active = !hasHighlight || d.highlight;

      // Draw segment
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, currentAngle, endAngle);
      ctx.arc(cx, cy, innerR, endAngle, currentAngle, true);
      ctx.closePath();

      if (active) {
        const gc = d.highlight
          ? theme.highlightGradient
          : theme.gradients[i % theme.gradients.length];

        ctx.save();
        ctx.clip();
        const grad = ctx.createLinearGradient(
          cx + Math.cos(currentAngle + sliceAngle / 2) * outerR * 0.5,
          cy + Math.sin(currentAngle + sliceAngle / 2) * outerR * 0.5,
          cx - Math.cos(currentAngle + sliceAngle / 2) * outerR * 0.5,
          cy - Math.sin(currentAngle + sliceAngle / 2) * outerR * 0.5
        );
        grad.addColorStop(0, gc[0]);
        grad.addColorStop(1, gc[1]);
        ctx.fillStyle = grad;
        ctx.fillRect(cx - outerR, cy - outerR, outerR * 2, outerR * 2);
        this.drawLavaInArc(cx, cy, outerR, gc);
        ctx.restore();
      } else {
        const isDark = theme.name === 'midnight';
        ctx.fillStyle = isDark ? 'rgba(255,255,240,0.06)' : 'rgba(0,0,0,0.04)';
        ctx.fill();
      }

      // Gap between segments
      ctx.strokeStyle = theme.bg;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label line + text
      if (progress > 0.7 && sliceAngle > 0.15) {
        const labelAlpha = Math.min(1, (progress - 0.7) / 0.3);
        ctx.globalAlpha = labelAlpha;
        const midAngle = currentAngle + sliceAngle / 2;
        const labelR = outerR + 14;
        const lx = cx + Math.cos(midAngle) * labelR;
        const ly = cy + Math.sin(midAngle) * labelR;
        const isRight = Math.cos(midAngle) > 0;

        ctx.fillStyle = active ? theme.textPrimary : theme.textSource;
        ctx.font = `500 11px ${theme.monoFamily}`;
        ctx.textAlign = isRight ? 'left' : 'right';
        ctx.textBaseline = 'middle';

        const pct = Math.round((d.value / total) * 100);
        ctx.fillText(`${d.label} ${pct}%`, lx + (isRight ? 4 : -4), ly);
        ctx.globalAlpha = 1;
      }

      currentAngle = endAngle;
    });

    // Center label
    if (this.donutConfig.centerValue && progress > 0.5) {
      const a = Math.min(1, (progress - 0.5) * 2);
      ctx.globalAlpha = a;

      const gc = theme.highlightGradient;
      const tg = ctx.createLinearGradient(cx - 30, cy, cx + 30, cy);
      tg.addColorStop(0, gc[0]);
      tg.addColorStop(1, gc[1]);
      ctx.fillStyle = tg;
      ctx.font = `700 ${Math.round(innerR * 0.55)}px ${theme.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.donutConfig.centerValue, cx, cy - 4);

      if (this.donutConfig.centerLabel) {
        ctx.fillStyle = theme.textSecondary;
        ctx.font = `400 12px ${theme.fontFamily}`;
        ctx.fillText(this.donutConfig.centerLabel, cx, cy + innerR * 0.35);
      }
      ctx.globalAlpha = 1;
    }
  }

  drawLavaInArc(cx: number, cy: number, r: number, colors: string[]) {
    const { ctx } = this;
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + 0.7;
      const bx = cx + Math.cos(angle) * r * 0.5;
      const by = cy + Math.sin(angle) * r * 0.5;
      const blobR = r * (0.4 + (i * 0.15));
      const color = colors[i % colors.length];
      const rg = ctx.createRadialGradient(bx, by, 0, bx, by, blobR);
      rg.addColorStop(0, color);
      rg.addColorStop(0.5, color + '88');
      rg.addColorStop(1, color + '00');
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = rg;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      ctx.globalCompositeOperation = 'source-over';
    }
  }
}
