// DropThe Charts -- Treemap
// USE: Part-to-whole with hierarchy. "Market cap by sector > company"
// WHEN: Showing proportional sizes of many items. Area = value.
// NOT: When you have < 3 items (use donut). When precision matters.

import { BaseChart, ChartConfig } from '../core/Chart';

export interface TreemapItem {
  label: string;
  value: number;
  highlight?: boolean;
  children?: TreemapItem[];
}

export interface TreemapChartConfig extends ChartConfig {
  data: TreemapItem[];
}

interface Rect { x: number; y: number; w: number; h: number; item: TreemapItem; depth: number; }

export class TreemapChart extends BaseChart {
  tmConfig: TreemapChartConfig;

  constructor(container: HTMLElement | string, config: TreemapChartConfig) {
    super(container, config);
    this.tmConfig = config;
    this.render();
  }

  render() { this.animate((p) => this.draw(p), 600); }

  draw(progress: number) {
    const { ctx, width, height, theme, padding } = this;
    const { data } = this.tmConfig;

    this.drawBackground();
    this.drawTitle();

    const cT = padding.top + 8, cB = height - padding.bottom - 8;
    const cL = padding.left + 4, cR = width - padding.right - 4;

    this.drawSource();
    this.snapshotBackground();

    const rects = this.squarify(data, cL, cT, cR - cL, cB - cT, 0);
    const hasHL = data.some(d => d.highlight);
    const gap = 3; const r = 6;

    rects.forEach((rect, i) => {
      const { x, y, w, h, item, depth } = rect;
      const rx = x + gap/2, ry = y + gap/2, rw = w - gap, rh = h - gap;
      if (rw < 2 || rh < 2) return;

      const active = !hasHL || item.highlight;
      const gc = item.highlight ? theme.highlightGradient : theme.gradients[i % theme.gradients.length];
      const cr = Math.min(r, rw/4, rh/4);

      ctx.beginPath();
      ctx.moveTo(rx+cr,ry); ctx.lineTo(rx+rw-cr,ry);
      ctx.quadraticCurveTo(rx+rw,ry,rx+rw,ry+cr);
      ctx.lineTo(rx+rw,ry+rh-cr);
      ctx.quadraticCurveTo(rx+rw,ry+rh,rx+rw-cr,ry+rh);
      ctx.lineTo(rx+cr,ry+rh);
      ctx.quadraticCurveTo(rx,ry+rh,rx,ry+rh-cr);
      ctx.lineTo(rx,ry+cr);
      ctx.quadraticCurveTo(rx,ry,rx+cr,ry);
      ctx.closePath();

      const scaleP = Math.min(1, progress * 1.5);

      if (active) {
        ctx.save(); ctx.clip();
        const grad = ctx.createLinearGradient(rx, ry, rx+rw, ry+rh);
        grad.addColorStop(0, gc[0]); grad.addColorStop(1, gc[1]);
        ctx.globalAlpha = 0.15 + 0.7 * scaleP;
        ctx.fillStyle = grad; ctx.fillRect(rx, ry, rw, rh);
        // Lava
        const s = (n: number) => { let v = Math.sin(i*127.1+n*311.7)*43758.5; return v-Math.floor(v); };
        const bx=rx+rw*(0.2+s(0)*0.6), by=ry+rh*(0.2+s(1)*0.6);
        const blobR=Math.max(rw,rh)*0.5;
        const rg=ctx.createRadialGradient(bx,by,0,bx,by,blobR);
        rg.addColorStop(0,gc[1]); rg.addColorStop(0.5,gc[1]+'77'); rg.addColorStop(1,gc[1]+'00');
        ctx.globalCompositeOperation='source-atop'; ctx.fillStyle=rg;
        ctx.fillRect(rx,ry,rw,rh); ctx.globalCompositeOperation='source-over';
        ctx.restore(); ctx.globalAlpha = 1;
      } else {
        const isDark = theme.name === 'midnight';
        ctx.fillStyle = isDark ? 'rgba(255,255,240,0.05)' : 'rgba(0,0,0,0.03)';
        ctx.globalAlpha = scaleP; ctx.fill(); ctx.globalAlpha = 1;
      }

      // Label
      if (rw > 40 && rh > 24 && progress > 0.4) {
        ctx.globalAlpha = Math.min(1, (progress - 0.4) / 0.4);
        const isDark = theme.name === 'midnight';
        ctx.fillStyle = active ? (isDark ? 'rgba(10,10,15,0.85)' : 'rgba(255,255,255,0.9)') : theme.textSource;
        const fs = Math.min(14, rw / 8, rh / 3);
        ctx.font = `600 ${fs}px ${theme.fontFamily}`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(this.truncate(item.label, rw - 8, fs), rx + rw/2, ry + rh/2 - fs*0.3);
        if (rh > 40) {
          ctx.font = `400 ${Math.max(9, fs*0.7)}px ${theme.monoFamily}`;
          ctx.fillText(this.fmtVal(item.value), rx + rw/2, ry + rh/2 + fs*0.6);
        }
        ctx.globalAlpha = 1;
      }
    });
  }

  squarify(items: TreemapItem[], x: number, y: number, w: number, h: number, depth: number): Rect[] {
    const total = items.reduce((s, it) => s + it.value, 0);
    if (total === 0 || items.length === 0) return [];
    const rects: Rect[] = [];
    let cx = x, cy = y, cw = w, ch = h;

    const sorted = [...items].sort((a, b) => b.value - a.value);
    let row: TreemapItem[] = [];
    let rowTotal = 0;
    const remaining = total;

    for (const item of sorted) {
      row.push(item);
      rowTotal += item.value;

      if (row.length === sorted.length || this.worst(row, rowTotal, cw, ch, remaining) <= this.worst([...row, sorted[row.length]], rowTotal + (sorted[row.length]?.value || 0), cw, ch, remaining)) {
        // Lay out row
        const isHoriz = cw >= ch;
        const rowFrac = rowTotal / remaining;
        const rowSize = isHoriz ? cw * rowFrac : ch * rowFrac;

        let pos = isHoriz ? cy : cx;
        for (const ri of row) {
          const itemFrac = ri.value / rowTotal;
          const itemSize = isHoriz ? ch * itemFrac : cw * itemFrac;
          const rect: Rect = isHoriz
            ? { x: cx, y: pos, w: rowSize, h: itemSize, item: ri, depth }
            : { x: pos, y: cy, w: itemSize, h: rowSize, item: ri, depth };
          rects.push(rect);
          pos += itemSize;
        }

        if (isHoriz) { cx += rowSize; cw -= rowSize; }
        else { cy += rowSize; ch -= rowSize; }

        row = [];
        rowTotal = 0;
      }
    }
    return rects;
  }

  worst(row: TreemapItem[], rowTotal: number, w: number, h: number, total: number): number {
    if (!row.length || !total) return Infinity;
    const s = (rowTotal / total) * (w >= h ? w : h);
    if (s === 0) return Infinity;
    const sideLen = w >= h ? h : w;
    let worst = 0;
    for (const r of row) {
      const area = (r.value / total) * w * h;
      const rw = area / s;
      const ratio = Math.max(s / rw, rw / s);
      worst = Math.max(worst, ratio);
    }
    return worst;
  }

  truncate(text: string, maxW: number, fontSize: number): string {
    const { ctx, theme } = this;
    ctx.font = `600 ${fontSize}px ${theme.fontFamily}`;
    if (ctx.measureText(text).width <= maxW) return text;
    let t = text;
    while (t.length > 2 && ctx.measureText(t + '..').width > maxW) t = t.slice(0, -1);
    return t + '..';
  }

  fmtVal(n: number): string {
    if (n >= 1e12) return (n/1e12).toFixed(1)+'T';
    if (n >= 1e9) return (n/1e9).toFixed(1)+'B';
    if (n >= 1e6) return (n/1e6).toFixed(1)+'M';
    if (n >= 1e3) return (n/1e3).toFixed(1)+'K';
    return n + '';
  }
}
