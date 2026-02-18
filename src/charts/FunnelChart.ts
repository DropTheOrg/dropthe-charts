// DropThe Charts -- Funnel Chart
// USE: Sequential drop-off. "100 visitors > 60 signups > 20 purchases"
// WHEN: Showing conversion, pipeline stages, progressive filtering.
// NOT: When stages don't have a logical sequence. When values go up.

import { BaseChart, ChartConfig } from '../core/Chart';

export interface FunnelChartConfig extends ChartConfig {
  data: { label: string; value: number; highlight?: boolean }[];
  showPercentage?: boolean;
}

export class FunnelChart extends BaseChart {
  funnelConfig: FunnelChartConfig;

  constructor(container: HTMLElement | string, config: FunnelChartConfig) {
    super(container, config);
    this.funnelConfig = { showPercentage: true, ...config };
    this.render();
  }

  render() { this.animate((p) => this.draw(p), 700); }

  draw(progress: number) {
    const { ctx, width, height, theme, padding } = this;
    const { data, showPercentage } = this.funnelConfig;

    this.drawBackground();
    this.drawTitle();

    const cT = padding.top + 8, cB = height - padding.bottom - 8;
    const cx = width / 2;
    const cH = cB - cT;
    const maxW = width - padding.left - padding.right - 80; // room for labels
    const maxVal = data[0]?.value || 1;
    const stepH = cH / data.length;
    const gap = 3;

    this.drawSource();
    this.snapshotBackground();

    const hasHL = data.some(d => d.highlight);

    data.forEach((d, i) => {
      const frac = d.value / maxVal;
      const nextFrac = data[i + 1] ? data[i + 1].value / maxVal : frac * 0.7;
      const topW = frac * maxW * progress;
      const botW = (i < data.length - 1 ? nextFrac : frac * 0.7) * maxW * progress;
      const y = cT + i * stepH + gap / 2;
      const h = stepH - gap;
      const active = !hasHL || d.highlight;
      const gc = d.highlight ? theme.highlightGradient : theme.gradients[i % theme.gradients.length];

      // Trapezoid path
      ctx.beginPath();
      ctx.moveTo(cx - topW / 2, y);
      ctx.lineTo(cx + topW / 2, y);
      ctx.lineTo(cx + botW / 2, y + h);
      ctx.lineTo(cx - botW / 2, y + h);
      ctx.closePath();

      if (active) {
        ctx.save(); ctx.clip();
        const grad = ctx.createLinearGradient(cx - topW / 2, y, cx + topW / 2, y + h);
        grad.addColorStop(0, gc[0]); grad.addColorStop(1, gc[1]);
        ctx.fillStyle = grad;
        ctx.fillRect(cx - topW / 2, y, topW, h);
        // Lava
        const s = (n: number) => { let v = Math.sin(i*127.1+n*311.7)*43758.5; return v-Math.floor(v); };
        const bx=cx+topW*(s(0)-0.5)*0.5, by=y+h*s(1);
        const blobR=Math.max(topW,h)*0.4;
        const rg=ctx.createRadialGradient(bx,by,0,bx,by,blobR);
        rg.addColorStop(0,gc[1]); rg.addColorStop(0.5,gc[1]+'77'); rg.addColorStop(1,gc[1]+'00');
        ctx.globalCompositeOperation='source-atop'; ctx.fillStyle=rg;
        ctx.fillRect(cx-topW/2,y,topW,h); ctx.globalCompositeOperation='source-over';
        ctx.restore();
      } else {
        const isDark = theme.name === 'midnight';
        ctx.fillStyle = isDark ? 'rgba(255,255,240,0.06)' : 'rgba(0,0,0,0.04)';
        ctx.fill();
      }

      // Separator
      ctx.strokeStyle = theme.bg; ctx.lineWidth = 1; ctx.stroke();

      // Labels
      if (progress > 0.5) {
        const a = Math.min(1, (progress - 0.5) * 2);
        ctx.globalAlpha = a;

        // Right side: label + value
        const labelX = cx + Math.max(topW, botW) / 2 + 16;
        ctx.fillStyle = active ? theme.textPrimary : theme.textSource;
        ctx.font = `500 12px ${theme.fontFamily}`;
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText(d.label, labelX, y + h / 2 - 7);

        ctx.fillStyle = active ? theme.textSecondary : theme.textSource;
        ctx.font = `400 11px ${theme.monoFamily}`;
        let valText = this.fmtVal(d.value);
        if (showPercentage && i > 0) {
          valText += ` (${Math.round((d.value / maxVal) * 100)}%)`;
        }
        ctx.fillText(valText, labelX, y + h / 2 + 8);

        ctx.globalAlpha = 1;
      }
    });
  }

  fmtVal(n: number): string {
    if (n >= 1e9) return (n/1e9).toFixed(1)+'B';
    if (n >= 1e6) return (n/1e6).toFixed(1)+'M';
    if (n >= 1e3) return (n/1e3).toFixed(1)+'K';
    return n.toLocaleString();
  }
}
