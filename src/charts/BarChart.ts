// DropThe Charts -- Bar Chart (Vertical)

import { BaseChart, ChartConfig } from '../core/Chart';

export interface BarDataPoint {
  label: string;
  value: number;
  url?: string;
  highlight?: boolean;
}

export interface BarChartConfig extends ChartConfig {
  data: BarDataPoint[];
  valuePrefix?: string;
  valueSuffix?: string;
  showValues?: boolean;
  valuesOnBar?: boolean;
  barRadius?: number;
  highlightTop?: number; // 1 = only #1, 3 = top 3, 10 = all, etc.
}

export class BarChart extends BaseChart {
  barConfig: BarChartConfig;

  constructor(container: HTMLElement | string, config: BarChartConfig) {
    super(container, config);
    this.barConfig = { showValues: true, valuesOnBar: false, barRadius: 6, ...config };
    this.render();
  }

  render() {
    this.animate((progress) => this.draw(progress));
  }

  isActive(d: BarDataPoint, i: number): boolean {
    const { data, highlightTop } = this.barConfig;
    if (highlightTop !== undefined) return i < highlightTop;
    if (data.some(dd => dd.highlight)) return !!d.highlight;
    return true; // no highlight = all active
  }

  hasContrast(): boolean {
    const { data, highlightTop } = this.barConfig;
    if (highlightTop !== undefined) return highlightTop < data.length;
    return data.some(d => d.highlight);
  }

  draw(progress: number) {
    const { ctx, width, height, theme, padding, barConfig } = this;
    const { data, valuePrefix = '', valueSuffix = '', showValues, valuesOnBar, barRadius } = barConfig;

    this.drawBackground();
    this.drawTitle();

    const chartTop = padding.top + 8;
    const chartBottom = height - padding.bottom - 20;
    const chartLeft = padding.left;
    const chartRight = width - padding.right;
    const chartWidth = chartRight - chartLeft;
    const chartHeight = chartBottom - chartTop;

    const barCount = data.length;
    const barGap = Math.max(12, chartWidth * 0.08);
    const totalGaps = (barCount - 1) * barGap;
    const barWidth = Math.min(80, (chartWidth - totalGaps) / barCount);
    const totalBarsWidth = barCount * barWidth + totalGaps;
    const startX = chartLeft + (chartWidth - totalBarsWidth) / 2;
    const maxVal = Math.max(...data.map(d => d.value));
    const scaleY = chartHeight / (maxVal * 1.15);
    const contrast = this.hasContrast();

    // Grid
    ctx.strokeStyle = theme.grid; ctx.lineWidth = 1;
    for (let i = 1; i <= 3; i++) {
      const y = chartBottom - (chartHeight * i / 4);
      ctx.beginPath(); ctx.moveTo(chartLeft, y); ctx.lineTo(chartRight, y); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(chartLeft, chartBottom); ctx.lineTo(chartRight, chartBottom); ctx.stroke();

    // Labels
    data.forEach((d, i) => {
      const x = startX + i * (barWidth + barGap);
      const active = this.isActive(d, i);
      ctx.fillStyle = (contrast && !active) ? theme.textSource : theme.textSecondary;
      ctx.font = `400 11px ${theme.monoFamily}`;
      ctx.textAlign = 'center';
      ctx.fillText(this.truncateLabel(d.label, barWidth + barGap * 0.6), x + barWidth / 2, chartBottom + 16);
    });

    this.drawSource();
    this.snapshotBackground();

    // Bars
    data.forEach((d, i) => {
      const x = startX + i * (barWidth + barGap);
      const barHeight = d.value * scaleY * progress;
      const y = chartBottom - barHeight;
      if (barHeight <= 0) return;

      const active = this.isActive(d, i);
      const r = Math.min(barRadius || 6, barHeight / 2);

      ctx.beginPath();
      ctx.moveTo(x + r, y); ctx.lineTo(x + barWidth - r, y);
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + r);
      ctx.lineTo(x + barWidth, y + barHeight); ctx.lineTo(x, y + barHeight);
      ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();

      if (contrast && !active) {
        const isDark = theme.name === 'midnight';
        ctx.fillStyle = isDark ? 'rgba(255,255,240,0.08)' : 'rgba(0,0,0,0.06)';
        ctx.fill();
        ctx.strokeStyle = isDark ? 'rgba(255,255,240,0.06)' : 'rgba(0,0,0,0.04)';
        ctx.lineWidth = 1; ctx.stroke();
      } else {
        ctx.save(); ctx.clip();
        const gc = theme.gradients[i % theme.gradients.length];
        ctx.fillStyle = gc[0];
        ctx.fillRect(x, y, barWidth, barHeight);
        this.drawLavaBlobs(x, y, barWidth, barHeight, gc, i);
        ctx.restore();
      }

      // Values
      if (showValues && progress > 0.3) {
        const a = Math.min(1, (progress - 0.3) * 1.43);
        ctx.globalAlpha = a;
        const cp = Math.min(1, (progress - 0.3) / 0.7);
        const ec = 1 - Math.pow(1 - cp, 2);
        const vt = valuePrefix + this.formatNumber(d.value * ec) + valueSuffix;

        if (valuesOnBar && barHeight > 35) {
          const isDark = theme.name === 'midnight';
          ctx.fillStyle = (contrast && !active)
            ? (isDark ? 'rgba(255,255,240,0.25)' : 'rgba(0,0,0,0.2)')
            : (isDark ? 'rgba(10,10,15,0.75)' : 'rgba(255,255,255,0.9)');
          ctx.font = active ? `700 16px ${theme.fontFamily}` : `600 14px ${theme.fontFamily}`;
          ctx.textAlign = 'center';
          ctx.fillText(vt, x + barWidth / 2, y + 22);
        } else {
          if (active) {
            const gc = theme.gradients[i % theme.gradients.length];
            const tg = ctx.createLinearGradient(x, 0, x + barWidth, 0);
            tg.addColorStop(0, gc[0]); tg.addColorStop(1, gc[1]);
            ctx.fillStyle = tg;
            ctx.font = `700 18px ${theme.fontFamily}`;
          } else {
            ctx.fillStyle = theme.textSource;
            ctx.font = `500 14px ${theme.fontFamily}`;
          }
          ctx.textAlign = 'center';
          ctx.fillText(vt, x + barWidth / 2, y - 12);
        }
        ctx.globalAlpha = 1;
      }
    });
  }

  drawLavaBlobs(x: number, y: number, w: number, h: number, colors: string[], seed: number) {
    const { ctx } = this;
    const s = (n: number) => { let v = Math.sin(seed*127.1+n*311.7)*43758.5453; return v-Math.floor(v); };
    for (let i = 0; i < 5; i++) {
      const bx=x+w*(0.1+s(i*3)*0.8), by=y+h*(0.1+s(i*3+1)*0.8);
      const radius=Math.max(w,h)*(0.35+s(i*3+2)*0.55), color=colors[i%colors.length];
      const rg=ctx.createRadialGradient(bx,by,0,bx,by,radius);
      rg.addColorStop(0,color); rg.addColorStop(0.5,color+'99'); rg.addColorStop(1,color+'00');
      ctx.globalCompositeOperation='source-atop'; ctx.fillStyle=rg; ctx.fillRect(x,y,w,h);
      ctx.globalCompositeOperation='source-over';
    }
  }

  formatNumber(n: number): string {
    if (n>=1e9) return (n/1e9).toFixed(1)+'B'; if (n>=1e6) return (n/1e6).toFixed(1)+'M';
    if (n>=1e3) return (n/1e3).toFixed(1)+'K'; return n.toLocaleString();
  }

  truncateLabel(label: string, maxWidth: number): string {
    const { ctx, theme } = this;
    ctx.font = `400 11px ${theme.monoFamily}`;
    if (ctx.measureText(label).width <= maxWidth) return label;
    const p=label.split(' '); if (p.length>1 && ctx.measureText(p[0]).width<=maxWidth) return p[0];
    let t=label; while (t.length>3 && ctx.measureText(t+'..').width>maxWidth) t=t.slice(0,-1); return t+'..';
  }
}
