// DropThe Charts -- Main Entry Point

import { BarChart } from './charts/BarChart';
import { LineChart } from './charts/LineChart';
import { HBarChart } from './charts/HBarChart';
import { StatCard } from './charts/StatCard';
import { RadarChart } from './charts/RadarChart';
import { DonutChart } from './charts/DonutChart';
import { HeatmapChart } from './charts/HeatmapChart';
import { BumpChart } from './charts/BumpChart';
import { getTheme, midnight, sand } from './core/theme';

export { BarChart, LineChart, HBarChart, StatCard, RadarChart, DonutChart, HeatmapChart, BumpChart, getTheme, midnight, sand };

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
