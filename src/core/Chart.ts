// DropThe Charts -- Base Chart

import { Theme, getTheme } from './theme';

export interface ChartConfig {
  type: string;
  title?: string;
  subtitle?: string;
  source?: string;
  sourceUrl?: string;
  theme?: string;
  width?: number;
  height?: number;
  animate?: boolean;
  data: any;
}

export interface ChartPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export class BaseChart {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  config: ChartConfig;
  theme: Theme;
  width: number;
  height: number;
  dpr: number;
  padding: ChartPadding;
  animProgress: number = 0;
  animFrame: number = 0;
  private bgSnapshot: ImageData | null = null;

  constructor(container: HTMLElement | string, config: ChartConfig) {
    const el = typeof container === 'string'
      ? document.querySelector(container) as HTMLElement
      : container;

    if (!el) throw new Error('DropThe Charts: container not found');

    this.config = config;
    this.theme = getTheme(config.theme);
    this.dpr = window.devicePixelRatio || 1;
    this.width = config.width || el.clientWidth || 600;
    this.height = config.height || 400;

    this.padding = { top: 60, right: 24, bottom: 48, left: 24 };

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.canvas.style.borderRadius = '12px';
    el.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d')!;
    this.ctx.scale(this.dpr, this.dpr);
  }

  snapshotBackground() {
    this.bgSnapshot = this.ctx.getImageData(0, 0, this.width * this.dpr, this.height * this.dpr);
  }

  drawGrain() {
    const { ctx, width, height, theme } = this;
    const w = width * this.dpr;
    const h = height * this.dpr;
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    const bg = this.bgSnapshot?.data;
    const elementsOnly = theme.grainTarget === 'elements' && bg;
    const noiseAmt = 70; // riso texture intensity

    for (let i = 0; i < data.length; i += 4) {
      if (elementsOnly) {
        const dr = Math.abs(data[i] - bg![i]);
        const dg = Math.abs(data[i+1] - bg![i+1]);
        const db = Math.abs(data[i+2] - bg![i+2]);
        const diff = dr + dg + db;
        if (diff < 8) continue;
        const strength = Math.min(1, diff / 80);
        const noise = (Math.random() - 0.5) * noiseAmt * strength;
        data[i]   = Math.min(255, Math.max(0, data[i] + noise));
        data[i+1] = Math.min(255, Math.max(0, data[i+1] + noise));
        data[i+2] = Math.min(255, Math.max(0, data[i+2] + noise));
      } else {
        const noise = (Math.random() - 0.5) * 50;
        data[i]   = Math.min(255, Math.max(0, data[i] + noise));
        data[i+1] = Math.min(255, Math.max(0, data[i+1] + noise));
        data[i+2] = Math.min(255, Math.max(0, data[i+2] + noise));
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

  drawBackground() {
    const { ctx, width, height, theme } = this;
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, width, height);
  }

  drawTitle() {
    const { ctx, config, theme, padding } = this;
    if (!config.title) return;
    ctx.fillStyle = theme.textPrimary;
    ctx.font = `600 18px ${theme.fontFamily}`;
    ctx.textAlign = 'left';
    ctx.fillText(config.title, padding.left, 32);
    if (config.subtitle) {
      ctx.fillStyle = theme.textSecondary;
      ctx.font = `400 13px ${theme.fontFamily}`;
      ctx.fillText(config.subtitle, padding.left, 50);
    }
  }

  drawSource() {
    const { ctx, config, theme, width, height } = this;
    const text = `Source: ${config.source || 'DropThe'} | dropthe.org`;
    ctx.fillStyle = theme.textSource;
    ctx.font = `400 10px ${theme.monoFamily}`;
    ctx.textAlign = 'left';
    ctx.fillText(text, this.padding.left, height - 12);
  }

  createGradient(x: number, y1: number, y2: number, colors: string[]): CanvasGradient {
    const grad = this.ctx.createLinearGradient(x, y1, x, y2);
    grad.addColorStop(0, colors[0]);
    grad.addColorStop(1, colors[1]);
    return grad;
  }

  // Lava lamp / mesh gradient fill for a rectangular region
  // Creates overlapping radial gradients that blend like bubbles
  fillLavaGradient(x: number, y: number, w: number, h: number, colors: string[], seed: number = 0) {
    const { ctx } = this;

    // Use seed for deterministic but varied blob positions per bar
    const s = (n: number) => {
      let v = Math.sin(seed * 127.1 + n * 311.7) * 43758.5453;
      return v - Math.floor(v);
    };

    // Base: fill with first color
    ctx.fillStyle = colors[0];
    ctx.fill();

    // Layer 3-4 radial gradient blobs
    const blobCount = 4;
    for (let i = 0; i < blobCount; i++) {
      const bx = x + w * (0.15 + s(i * 3) * 0.7);
      const by = y + h * (0.15 + s(i * 3 + 1) * 0.7);
      const radius = Math.max(w, h) * (0.4 + s(i * 3 + 2) * 0.5);

      // Alternate between the two gradient colors + their blends
      const colorIdx = i % 2;
      const blobColor = colors[colorIdx];

      const radGrad = ctx.createRadialGradient(bx, by, 0, bx, by, radius);
      radGrad.addColorStop(0, blobColor);
      radGrad.addColorStop(0.6, blobColor + '88');
      radGrad.addColorStop(1, blobColor + '00');

      ctx.save();
      // Clip to current path (the bar shape)
      ctx.fillStyle = radGrad;
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillRect(x - radius, y - radius, w + radius * 2, h + radius * 2);
      ctx.restore();
    }
  }

  animate(drawFn: (progress: number) => void, duration: number = 800) {
    if (this.config.animate === false) {
      drawFn(1);
      this.drawGrain();
      return;
    }
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      this.animProgress = ease;
      drawFn(ease);
      if (t < 1) {
        this.animFrame = requestAnimationFrame(step);
      } else {
        this.drawGrain();
      }
    };
    this.animFrame = requestAnimationFrame(step);
  }

  destroy() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    this.canvas.remove();
  }

  toPNG(): string {
    return this.canvas.toDataURL('image/png');
  }
}
