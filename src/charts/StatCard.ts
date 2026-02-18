// DropThe Charts -- Stat Card (Big Number)
// Gradient text + grain on the number itself, neutral background

import { BaseChart, ChartConfig } from '../core/Chart';

export interface StatCardConfig extends ChartConfig {
  data: {
    value: number | string;
    label: string;
    delta?: string;
    deltaPositive?: boolean;
    prefix?: string;
    suffix?: string;
  };
}

export class StatCard extends BaseChart {
  statConfig: StatCardConfig;

  constructor(container: HTMLElement | string, config: StatCardConfig) {
    config.height = config.height || 200;
    super(container, config);
    this.statConfig = config;
    this.render();
  }

  render() {
    this.animate((progress) => this.draw(progress), 600);
  }

  draw(progress: number) {
    const { ctx, width, height, theme, statConfig } = this;
    const { value, label, delta, deltaPositive, prefix = '', suffix = '' } = statConfig.data;

    this.drawBackground();

    const numericVal = typeof value === 'number' ? value : parseFloat(String(value));
    let displayVal: string;

    if (!isNaN(numericVal) && typeof value === 'number') {
      const current = numericVal * progress;
      displayVal = prefix + this.formatBigNumber(current) + suffix;
    } else {
      displayVal = prefix + String(value) + suffix;
    }

    // Title (top left)
    if (this.config.title) {
      ctx.fillStyle = theme.textSecondary;
      ctx.font = `400 11px ${theme.monoFamily}`;
      ctx.textAlign = 'left';
      ctx.fillText(this.config.title.toUpperCase(), this.padding.left, 24);
    }

    // Label below number
    ctx.fillStyle = theme.textSecondary;
    ctx.font = `400 14px ${theme.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.fillText(label, width / 2, height / 2 + 25);

    // Delta badge
    if (delta && progress > 0.7) {
      const alpha = (progress - 0.7) * 3.3;
      ctx.globalAlpha = Math.min(1, alpha);

      const isPos = deltaPositive !== undefined ? deltaPositive : delta.startsWith('+');
      const badgeColor = isPos ? '#10b981' : '#ef4444';

      ctx.fillStyle = badgeColor + '22';
      const deltaWidth = ctx.measureText(delta).width + 16;
      const badgeX = width / 2 - deltaWidth / 2;
      const badgeY = height / 2 + 38;

      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, deltaWidth, 22, 11);
      ctx.fill();

      ctx.fillStyle = badgeColor;
      ctx.font = `600 11px ${theme.monoFamily}`;
      ctx.textAlign = 'center';
      ctx.fillText(delta, width / 2, badgeY + 15);
      ctx.globalAlpha = 1;
    }

    this.drawSource();

    // Snapshot background BEFORE the big number
    this.snapshotBackground();

    // Big number with gradient fill
    ctx.font = `700 48px ${theme.fontFamily}`;
    ctx.textAlign = 'center';

    // Measure text bounds for gradient
    const metrics = ctx.measureText(displayVal);
    const textX = width / 2;
    const textY = height / 2 - 5;

    // Create horizontal gradient across the text
    const gradColors = theme.highlightGradient;
    const textWidth = metrics.width;
    const grad = ctx.createLinearGradient(
      textX - textWidth / 2, 0,
      textX + textWidth / 2, 0
    );
    grad.addColorStop(0, gradColors[0]);
    grad.addColorStop(1, gradColors[1]);

    ctx.fillStyle = grad;
    ctx.fillText(displayVal, textX, textY);
  }

  formatBigNumber(n: number): string {
    if (n >= 1e12) return (n / 1e12).toFixed(1) + 'T';
    if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return Math.round(n).toLocaleString();
  }
}
