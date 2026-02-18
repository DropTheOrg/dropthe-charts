// DropThe Charts -- Horizontal Bar Chart (Rankings)

import { BaseChart, ChartConfig } from '../core/Chart';

export interface HBarDataPoint {
  label: string;
  value: number;
  url?: string;
  highlight?: boolean;
}

export interface HBarChartConfig extends ChartConfig {
  data: HBarDataPoint[];
  valuePrefix?: string;
  valueSuffix?: string;
  barHeight?: number;
  valuesOnBar?: boolean;
  showRank?: boolean;
  highlightTop?: number; // highlight top N bars
  highlightLine?: number; // highlight specific bar at position N (1-indexed)
}

export class HBarChart extends BaseChart {
  hbarConfig: HBarChartConfig;

  constructor(container: HTMLElement | string, config: HBarChartConfig) {
    const barH = config.barHeight || 36;
    const autoHeight = Math.max(300, config.data.length * (barH + 8) + 100);
    config.height = config.height || autoHeight;
    super(container, config);
    this.hbarConfig = { barHeight: barH, valuesOnBar: false, showRank: false, ...config };
    this.render();
  }

  render() {
    this.animate((progress) => this.draw(progress));
  }

  isActive(d: HBarDataPoint, i: number): boolean {
    const { data, highlightTop, highlightLine, showRank } = this.hbarConfig;
    if (highlightLine !== undefined) return i === (highlightLine - 1); // 1-indexed
    if (highlightTop !== undefined) return i < highlightTop;
    if (showRank) return i < 3;
    if (data.some(dd => dd.highlight)) return !!d.highlight;
    return true;
  }

  hasContrast(): boolean {
    const { data, highlightTop, highlightLine, showRank } = this.hbarConfig;
    if (highlightLine !== undefined) return true;
    if (highlightTop !== undefined) return highlightTop < data.length;
    if (showRank) return data.length > 3;
    return data.some(d => d.highlight);
  }

  draw(progress: number) {
    const { ctx, width, height, theme, padding, hbarConfig } = this;
    const { data, valuePrefix = '', valueSuffix = '', barHeight = 36, valuesOnBar, showRank } = hbarConfig;

    this.drawBackground();
    this.drawTitle();

    const chartTop = padding.top + 8;
    const rankWidth = showRank ? 36 : 0;
    const labelWidth = 120;
    const chartLeft = padding.left + rankWidth + labelWidth;
    const chartRight = width - padding.right - 70;
    const chartWidth = chartRight - chartLeft;
    const barGap = 8;
    const maxVal = Math.max(...data.map(d => d.value));
    const contrast = this.hasContrast();

    // Rank badges + labels
    data.forEach((d, i) => {
      const y = chartTop + i * (barHeight + barGap);
      const active = this.isActive(d, i);

      if (showRank) {
        const rankX = padding.left;
        const rankY = y + barHeight / 2;

        if (active) {
          const gc = theme.gradients[i % theme.gradients.length];
          const pillW = 26, pillH = 18;
          const grad = ctx.createLinearGradient(rankX, rankY-pillH/2, rankX+pillW, rankY-pillH/2);
          grad.addColorStop(0, gc[0]); grad.addColorStop(1, gc[1]);
          ctx.beginPath(); ctx.roundRect(rankX, rankY-pillH/2, pillW, pillH, 9);
          ctx.fillStyle = grad; ctx.fill();
          ctx.fillStyle = theme.name === 'midnight' ? 'rgba(10,10,15,0.8)' : 'rgba(255,255,255,0.9)';
          ctx.font = `700 10px ${theme.fontFamily}`;
          ctx.textAlign = 'center';
          ctx.fillText('#'+(i+1), rankX+pillW/2, rankY+3.5);
        } else {
          ctx.fillStyle = theme.textSource;
          ctx.font = `400 10px ${theme.monoFamily}`;
          ctx.textAlign = 'center';
          ctx.fillText('#'+(i+1), rankX+13, rankY+4);
        }
      }

      ctx.fillStyle = (contrast && !active) ? theme.textSource : theme.textSecondary;
      ctx.font = active ? `500 12px ${theme.fontFamily}` : `400 12px ${theme.fontFamily}`;
      ctx.textAlign = 'right';
      ctx.fillText(d.label, chartLeft - 12, y + barHeight/2 + 4);
    });

    this.drawSource();
    this.snapshotBackground();

    // Bars
    data.forEach((d, i) => {
      const y = chartTop + i * (barHeight + barGap);
      const barW = (d.value / maxVal) * chartWidth * progress;
      if (barW <= 0) return;

      const active = this.isActive(d, i);
      const gc = theme.gradients[i % theme.gradients.length];
      const r = Math.min(4, barW / 2);

      ctx.beginPath();
      ctx.moveTo(chartLeft, y);
      ctx.lineTo(chartLeft+barW-r, y);
      ctx.quadraticCurveTo(chartLeft+barW, y, chartLeft+barW, y+r);
      ctx.lineTo(chartLeft+barW, y+barHeight-r);
      ctx.quadraticCurveTo(chartLeft+barW, y+barHeight, chartLeft+barW-r, y+barHeight);
      ctx.lineTo(chartLeft, y+barHeight);
      ctx.closePath();

      if (contrast && !active) {
        const isDark = theme.name === 'midnight';
        ctx.fillStyle = isDark ? 'rgba(255,255,240,0.08)' : 'rgba(0,0,0,0.06)';
        ctx.fill();
        ctx.strokeStyle = isDark ? 'rgba(255,255,240,0.06)' : 'rgba(0,0,0,0.04)';
        ctx.lineWidth = 1; ctx.stroke();
      } else {
        ctx.save(); ctx.clip();
        ctx.fillStyle = gc[0];
        ctx.fillRect(chartLeft, y, barW, barHeight);
        this.drawLavaBlobs(chartLeft, y, barW, barHeight, gc, i);
        ctx.restore();
      }

      // Values
      if (progress > 0.3) {
        const a = Math.min(1, (progress-0.3)*1.43);
        ctx.globalAlpha = a;
        const cp = Math.min(1, (progress-0.3)/0.7);
        const ec = 1-Math.pow(1-cp, 2);
        const vt = valuePrefix + this.formatNumber(d.value * ec) + valueSuffix;

        if (valuesOnBar && barW > 70) {
          const isDark = theme.name === 'midnight';
          ctx.fillStyle = (contrast && !active)
            ? (isDark ? 'rgba(255,255,240,0.25)' : 'rgba(0,0,0,0.2)')
            : (isDark ? 'rgba(10,10,15,0.75)' : 'rgba(255,255,255,0.9)');
          ctx.font = active ? `700 14px ${theme.fontFamily}` : `600 12px ${theme.fontFamily}`;
          ctx.textAlign = 'right';
          ctx.fillText(vt, chartLeft+barW-10, y+barHeight/2+5);
        } else {
          if (active) {
            const tg = ctx.createLinearGradient(chartLeft+barW+8, 0, chartLeft+barW+70, 0);
            tg.addColorStop(0, gc[0]); tg.addColorStop(1, gc[1]);
            ctx.fillStyle = tg;
            ctx.font = `700 14px ${theme.fontFamily}`;
          } else {
            ctx.fillStyle = theme.textSource;
            ctx.font = `400 12px ${theme.fontFamily}`;
          }
          ctx.textAlign = 'left';
          ctx.fillText(vt, chartLeft+barW+8, y+barHeight/2+5);
        }
        ctx.globalAlpha = 1;
      }
    });
  }

  drawLavaBlobs(x: number, y: number, w: number, h: number, colors: string[], seed: number) {
    const { ctx } = this;
    const s = (n: number) => { let v=Math.sin(seed*127.1+n*311.7)*43758.5453; return v-Math.floor(v); };
    for (let i=0; i<6; i++) {
      const bx=x+w*(0.05+s(i*3)*0.9), by=y+h*(0.1+s(i*3+1)*0.8);
      const radius=Math.max(w*0.3,h)*(0.4+s(i*3+2)*0.5), color=colors[i%colors.length];
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
}
