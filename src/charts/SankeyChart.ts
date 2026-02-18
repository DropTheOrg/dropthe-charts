// DropThe Charts -- Sankey Diagram
// USE: Flows between categories. "Where do users go?" "Revenue flow: source > segment > product"
// WHEN: Showing how quantities flow from one set of categories to another.
// NOT: When there's no flow/relationship. When you have > 20 nodes (too cluttered).

import { BaseChart, ChartConfig } from '../core/Chart';

export interface SankeyNode { label: string; }
export interface SankeyLink { source: number; target: number; value: number; highlight?: boolean; }

export interface SankeyChartConfig extends ChartConfig {
  data: { nodes: SankeyNode[]; links: SankeyLink[] };
}

export class SankeyChart extends BaseChart {
  sankeyConfig: SankeyChartConfig;

  constructor(container: HTMLElement | string, config: SankeyChartConfig) {
    super(container, config);
    this.sankeyConfig = config;
    this.padding = { top: 60, right: 24, bottom: 24, left: 24 };
    this.render();
  }

  render() { this.animate((p) => this.draw(p), 900); }

  draw(progress: number) {
    const { ctx, width, height, theme, padding } = this;
    const { nodes, links } = this.sankeyConfig.data;

    this.drawBackground();
    this.drawTitle();

    const cT = padding.top + 8, cB = height - padding.bottom - 8;
    const cL = padding.left + 60, cR = width - padding.right - 60;
    const cH = cB - cT;

    // Assign columns: find which column each node belongs to
    const cols = this.assignColumns(nodes, links);
    const maxCol = Math.max(...cols);
    const colX = (c: number) => cL + (c / (maxCol || 1)) * (cR - cL);

    // Calculate node heights based on total flow
    const nodeValues = nodes.map((_, ni) => {
      const inFlow = links.filter(l => l.target === ni).reduce((s, l) => s + l.value, 0);
      const outFlow = links.filter(l => l.source === ni).reduce((s, l) => s + l.value, 0);
      return Math.max(inFlow, outFlow);
    });
    const totalValue = Math.max(...nodeValues) || 1;

    // Position nodes per column
    const nodeRects: { x: number; y: number; w: number; h: number }[] = new Array(nodes.length);
    const nodeW = Math.min(20, (cR - cL) / (maxCol + 1) * 0.15);

    for (let c = 0; c <= maxCol; c++) {
      const colNodes = nodes.map((_, i) => i).filter(i => cols[i] === c);
      const colTotal = colNodes.reduce((s, ni) => s + nodeValues[ni], 0);
      const gap = Math.min(20, (cH - colTotal / totalValue * cH * 0.8) / (colNodes.length || 1));
      let y = cT + (cH - colNodes.reduce((s, ni) => s + nodeValues[ni] / totalValue * cH * 0.8, 0) - (colNodes.length - 1) * gap) / 2;

      colNodes.forEach(ni => {
        const h = Math.max(4, (nodeValues[ni] / totalValue) * cH * 0.8);
        nodeRects[ni] = { x: colX(c) - nodeW / 2, y, w: nodeW, h };
        y += h + gap;
      });
    }

    this.drawSource(); this.snapshotBackground();

    const hasHL = links.some(l => l.highlight);

    // Draw links
    links.forEach((link, li) => {
      const src = nodeRects[link.source];
      const tgt = nodeRects[link.target];
      if (!src || !tgt) return;

      const active = !hasHL || link.highlight;
      const gc = link.highlight ? theme.highlightGradient : theme.gradients[li % theme.gradients.length];

      // Calculate link thickness proportional to value
      const thickness = Math.max(2, (link.value / totalValue) * cH * 0.8);

      // Source and target Y offsets (simple: center)
      const sy = src.y + src.h / 2;
      const ty = tgt.y + tgt.h / 2;
      const sx = src.x + src.w;
      const tx = tgt.x;

      const cp1x = sx + (tx - sx) * 0.4;
      const cp2x = sx + (tx - sx) * 0.6;

      ctx.beginPath();
      ctx.moveTo(sx, sy - thickness / 2 * progress);
      ctx.bezierCurveTo(cp1x, sy - thickness / 2 * progress, cp2x, ty - thickness / 2 * progress, tx, ty - thickness / 2 * progress);
      ctx.lineTo(tx, ty + thickness / 2 * progress);
      ctx.bezierCurveTo(cp2x, ty + thickness / 2 * progress, cp1x, sy + thickness / 2 * progress, sx, sy + thickness / 2 * progress);
      ctx.closePath();

      if (active) {
        const grad = ctx.createLinearGradient(sx, 0, tx, 0);
        grad.addColorStop(0, gc[0] + '55'); grad.addColorStop(1, gc[1] + '55');
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = theme.name === 'midnight' ? 'rgba(255,255,240,0.04)' : 'rgba(0,0,0,0.02)';
      }
      ctx.fill();
    });

    // Draw nodes
    nodes.forEach((node, ni) => {
      const r = nodeRects[ni];
      if (!r) return;
      const gc = theme.gradients[ni % theme.gradients.length];

      ctx.beginPath();
      const cr = Math.min(4, r.w / 4);
      ctx.moveTo(r.x+cr, r.y); ctx.lineTo(r.x+r.w-cr, r.y);
      ctx.quadraticCurveTo(r.x+r.w, r.y, r.x+r.w, r.y+cr);
      ctx.lineTo(r.x+r.w, r.y+r.h-cr);
      ctx.quadraticCurveTo(r.x+r.w, r.y+r.h, r.x+r.w-cr, r.y+r.h);
      ctx.lineTo(r.x+cr, r.y+r.h);
      ctx.quadraticCurveTo(r.x, r.y+r.h, r.x, r.y+r.h-cr);
      ctx.lineTo(r.x, r.y+cr);
      ctx.quadraticCurveTo(r.x, r.y, r.x+cr, r.y);
      ctx.closePath();

      const grad = ctx.createLinearGradient(r.x, r.y, r.x, r.y + r.h);
      grad.addColorStop(0, gc[0]); grad.addColorStop(1, gc[1]);
      ctx.fillStyle = grad; ctx.fill();

      // Label
      if (progress > 0.5) {
        ctx.globalAlpha = Math.min(1, (progress - 0.5) * 2);
        ctx.fillStyle = theme.textSecondary;
        ctx.font = `500 11px ${theme.fontFamily}`;
        ctx.textBaseline = 'middle';
        if (cols[ni] === 0) {
          ctx.textAlign = 'right';
          ctx.fillText(node.label, r.x - 8, r.y + r.h / 2);
        } else {
          ctx.textAlign = 'left';
          ctx.fillText(node.label, r.x + r.w + 8, r.y + r.h / 2);
        }
        ctx.globalAlpha = 1;
      }
    });
  }

  assignColumns(nodes: SankeyNode[], links: SankeyLink[]): number[] {
    const n = nodes.length;
    const cols = new Array(n).fill(0);
    const targets = new Set(links.map(l => l.target));
    const sources = new Set(links.map(l => l.source));

    // Nodes that are only sources = column 0
    // Iterate: target col = max(source col) + 1
    let changed = true;
    let iter = 0;
    while (changed && iter < 20) {
      changed = false; iter++;
      links.forEach(l => {
        const newCol = cols[l.source] + 1;
        if (newCol > cols[l.target]) {
          cols[l.target] = newCol;
          changed = true;
        }
      });
    }
    return cols;
  }
}
