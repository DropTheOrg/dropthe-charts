// DropThe Charts -- Main Entry Point
// 18 chart types. Zero dependencies. Canvas-rendered with lava gradients + film grain.

import { BarChart } from './charts/BarChart';
import { LineChart } from './charts/LineChart';
import { HBarChart } from './charts/HBarChart';
import { StatCard } from './charts/StatCard';
import { RadarChart } from './charts/RadarChart';
import { DonutChart } from './charts/DonutChart';
import { HeatmapChart } from './charts/HeatmapChart';
import { BumpChart } from './charts/BumpChart';
import { ScatterChart } from './charts/ScatterChart';
import { BubbleChart } from './charts/BubbleChart';
import { WaffleChart } from './charts/WaffleChart';
import { TreemapChart } from './charts/TreemapChart';
import { StackedBarChart } from './charts/StackedBarChart';
import { CandlestickChart } from './charts/CandlestickChart';
import { FunnelChart } from './charts/FunnelChart';
import { LollipopChart } from './charts/LollipopChart';
import { AreaChart } from './charts/AreaChart';
import { SankeyChart } from './charts/SankeyChart';
import { HistogramChart } from './charts/HistogramChart';
import { SlopeChart } from './charts/SlopeChart';
import { getTheme, midnight, sand } from './core/theme';

export {
  BarChart, LineChart, HBarChart, StatCard,
  RadarChart, DonutChart, HeatmapChart, BumpChart,
  ScatterChart, BubbleChart, WaffleChart, TreemapChart,
  StackedBarChart, CandlestickChart, FunnelChart, LollipopChart,
  AreaChart, SankeyChart, HistogramChart, SlopeChart,
  getTheme, midnight, sand
};

export function create(container: HTMLElement | string, config: any) {
  switch (config.type) {
    case 'bar': return new BarChart(container, config);
    case 'line': return new LineChart(container, config);
    case 'hbar': return new HBarChart(container, config);
    case 'stat': return new StatCard(container, config);
    case 'radar': return new RadarChart(container, config);
    case 'donut': return new DonutChart(container, config);
    case 'heatmap': return new HeatmapChart(container, config);
    case 'bump': return new BumpChart(container, config);
    case 'scatter': return new ScatterChart(container, config);
    case 'bubble': return new BubbleChart(container, config);
    case 'waffle': return new WaffleChart(container, config);
    case 'treemap': return new TreemapChart(container, config);
    case 'stacked-bar': return new StackedBarChart(container, config);
    case 'candlestick': return new CandlestickChart(container, config);
    case 'funnel': return new FunnelChart(container, config);
    case 'lollipop': return new LollipopChart(container, config);
    case 'area': return new AreaChart(container, config);
    case 'sankey': return new SankeyChart(container, config);
    case 'histogram': return new HistogramChart(container, config);
    case 'slope': return new SlopeChart(container, config);
    default: console.error('DropThe Charts: unknown type', config.type);
  }
}

// Auto-init from data attributes
export function init() {
  document.querySelectorAll('[data-dt-chart]').forEach(el => {
    try {
      const config = JSON.parse(el.getAttribute('data-dt-chart') || '{}');
      create(el as HTMLElement, config);
    } catch (e) {
      console.error('DropThe Charts: invalid config', e);
    }
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}
