var DTCharts = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.ts
  var index_exports = {};
  __export(index_exports, {
    BarChart: () => BarChart,
    BumpChart: () => BumpChart,
    DonutChart: () => DonutChart,
    HBarChart: () => HBarChart,
    HeatmapChart: () => HeatmapChart,
    LineChart: () => LineChart,
    RadarChart: () => RadarChart,
    StatCard: () => StatCard,
    create: () => create,
    getTheme: () => getTheme,
    init: () => init,
    midnight: () => midnight,
    sand: () => sand
  });

  // src/core/theme.ts
  var midnight = {
    name: "midnight",
    bg: "#0a0a0f",
    surface: "#141419",
    grid: "#1a1a22",
    textPrimary: "#f0f0f0",
    textSecondary: "#555566",
    textSource: "#333344",
    gradients: [
      ["#c4b5fd", "#f9a8d4"],
      // gaming -> culture
      ["#93b8fd", "#c4b5fd"],
      // tech -> gaming
      ["#86efac", "#93b8fd"],
      // money -> tech
      ["#fdd08a", "#f9a8d4"],
      // coin -> culture
      ["#fdba74", "#fdd08a"],
      // gear -> coin
      ["#5eead4", "#86efac"]
      // travel -> money
    ],
    highlightGradient: ["#f9a8d4", "#93b8fd"],
    // culture -> tech
    lineStroke: "#c4b5fd",
    lineFill: ["rgba(196,181,253,0.35)", "rgba(196,181,253,0)"],
    fontFamily: "'Space Grotesk', system-ui, sans-serif",
    monoFamily: "'SF Mono', 'Fira Code', monospace",
    grain: 0.055,
    // slightly higher for riso effect
    grainTarget: "elements"
  };
  var sand = {
    name: "sand",
    bg: "#ebe5d9",
    surface: "#e0dace",
    grid: "#d4cec2",
    textPrimary: "#1a1815",
    textSecondary: "#8a8478",
    textSource: "#b0a89c",
    // Same pastel colors on sand
    gradients: [
      ["#c4b5fd", "#f9a8d4"],
      ["#93b8fd", "#c4b5fd"],
      ["#86efac", "#93b8fd"],
      ["#fdd08a", "#f9a8d4"],
      ["#fdba74", "#fdd08a"],
      ["#5eead4", "#86efac"]
    ],
    highlightGradient: ["#f9a8d4", "#93b8fd"],
    lineStroke: "#c4b5fd",
    lineFill: ["rgba(196,181,253,0.3)", "rgba(196,181,253,0)"],
    fontFamily: "'Space Grotesk', system-ui, sans-serif",
    monoFamily: "'SF Mono', 'Fira Code', monospace",
    grain: 0.055,
    grainTarget: "elements"
  };
  function getTheme(name) {
    if (name === "sand") return sand;
    return midnight;
  }

  // src/core/Chart.ts
  var BaseChart = class {
    canvas;
    ctx;
    config;
    theme;
    width;
    height;
    dpr;
    padding;
    animProgress = 0;
    animFrame = 0;
    bgSnapshot = null;
    constructor(container, config) {
      const el = typeof container === "string" ? document.querySelector(container) : container;
      if (!el) throw new Error("DropThe Charts: container not found");
      this.config = config;
      this.theme = getTheme(config.theme);
      this.dpr = window.devicePixelRatio || 1;
      this.width = config.width || el.clientWidth || 600;
      this.height = config.height || 400;
      this.padding = { top: 60, right: 24, bottom: 48, left: 24 };
      this.canvas = document.createElement("canvas");
      this.canvas.width = this.width * this.dpr;
      this.canvas.height = this.height * this.dpr;
      this.canvas.style.width = this.width + "px";
      this.canvas.style.height = this.height + "px";
      this.canvas.style.borderRadius = "12px";
      el.appendChild(this.canvas);
      this.ctx = this.canvas.getContext("2d");
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
      const elementsOnly = theme.grainTarget === "elements" && bg;
      const noiseAmt = 70;
      for (let i = 0; i < data.length; i += 4) {
        if (elementsOnly) {
          const dr = Math.abs(data[i] - bg[i]);
          const dg = Math.abs(data[i + 1] - bg[i + 1]);
          const db = Math.abs(data[i + 2] - bg[i + 2]);
          const diff = dr + dg + db;
          if (diff < 8) continue;
          const strength = Math.min(1, diff / 80);
          const noise = (Math.random() - 0.5) * noiseAmt * strength;
          data[i] = Math.min(255, Math.max(0, data[i] + noise));
          data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
          data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
        } else {
          const noise = (Math.random() - 0.5) * 50;
          data[i] = Math.min(255, Math.max(0, data[i] + noise));
          data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
          data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
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
      ctx.textAlign = "left";
      ctx.fillText(config.title, padding.left, 32);
      if (config.subtitle) {
        ctx.fillStyle = theme.textSecondary;
        ctx.font = `400 13px ${theme.fontFamily}`;
        ctx.fillText(config.subtitle, padding.left, 50);
      }
    }
    drawSource() {
      const { ctx, config, theme, width, height } = this;
      const text = `Source: ${config.source || "DropThe"} | dropthe.org`;
      ctx.fillStyle = theme.textSource;
      ctx.font = `400 10px ${theme.monoFamily}`;
      ctx.textAlign = "left";
      ctx.fillText(text, this.padding.left, height - 12);
    }
    createGradient(x, y1, y2, colors) {
      const grad = this.ctx.createLinearGradient(x, y1, x, y2);
      grad.addColorStop(0, colors[0]);
      grad.addColorStop(1, colors[1]);
      return grad;
    }
    // Lava lamp / mesh gradient fill for a rectangular region
    // Creates overlapping radial gradients that blend like bubbles
    fillLavaGradient(x, y, w, h, colors, seed = 0) {
      const { ctx } = this;
      const s = (n) => {
        let v = Math.sin(seed * 127.1 + n * 311.7) * 43758.5453;
        return v - Math.floor(v);
      };
      ctx.fillStyle = colors[0];
      ctx.fill();
      const blobCount = 4;
      for (let i = 0; i < blobCount; i++) {
        const bx = x + w * (0.15 + s(i * 3) * 0.7);
        const by = y + h * (0.15 + s(i * 3 + 1) * 0.7);
        const radius = Math.max(w, h) * (0.4 + s(i * 3 + 2) * 0.5);
        const colorIdx = i % 2;
        const blobColor = colors[colorIdx];
        const radGrad = ctx.createRadialGradient(bx, by, 0, bx, by, radius);
        radGrad.addColorStop(0, blobColor);
        radGrad.addColorStop(0.6, blobColor + "88");
        radGrad.addColorStop(1, blobColor + "00");
        ctx.save();
        ctx.fillStyle = radGrad;
        ctx.globalCompositeOperation = "source-atop";
        ctx.fillRect(x - radius, y - radius, w + radius * 2, h + radius * 2);
        ctx.restore();
      }
    }
    animate(drawFn, duration = 800) {
      if (this.config.animate === false) {
        drawFn(1);
        this.drawGrain();
        return;
      }
      const start = performance.now();
      const step = (now) => {
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
    toPNG() {
      return this.canvas.toDataURL("image/png");
    }
  };

  // src/charts/BarChart.ts
  var BarChart = class extends BaseChart {
    barConfig;
    constructor(container, config) {
      super(container, config);
      this.barConfig = { showValues: true, valuesOnBar: false, barRadius: 6, ...config };
      this.render();
    }
    render() {
      this.animate((progress) => this.draw(progress));
    }
    isActive(d, i) {
      const { data, highlightTop, highlightLine } = this.barConfig;
      if (highlightLine !== void 0) return i === highlightLine - 1;
      if (highlightTop !== void 0) return i < highlightTop;
      if (data.some((dd) => dd.highlight)) return !!d.highlight;
      return true;
    }
    hasContrast() {
      const { data, highlightTop, highlightLine } = this.barConfig;
      if (highlightLine !== void 0) return true;
      if (highlightTop !== void 0) return highlightTop < data.length;
      return data.some((d) => d.highlight);
    }
    draw(progress) {
      const { ctx, width, height, theme, padding, barConfig } = this;
      const { data, valuePrefix = "", valueSuffix = "", showValues, valuesOnBar, barRadius } = barConfig;
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
      const maxVal = Math.max(...data.map((d) => d.value));
      const scaleY = chartHeight / (maxVal * 1.15);
      const contrast = this.hasContrast();
      ctx.strokeStyle = theme.grid;
      ctx.lineWidth = 1;
      for (let i = 1; i <= 3; i++) {
        const y = chartBottom - chartHeight * i / 4;
        ctx.beginPath();
        ctx.moveTo(chartLeft, y);
        ctx.lineTo(chartRight, y);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(chartLeft, chartBottom);
      ctx.lineTo(chartRight, chartBottom);
      ctx.stroke();
      data.forEach((d, i) => {
        const x = startX + i * (barWidth + barGap);
        const active = this.isActive(d, i);
        ctx.fillStyle = contrast && !active ? theme.textSource : theme.textSecondary;
        ctx.font = `400 11px ${theme.monoFamily}`;
        ctx.textAlign = "center";
        ctx.fillText(this.truncateLabel(d.label, barWidth + barGap * 0.6), x + barWidth / 2, chartBottom + 16);
      });
      this.drawSource();
      this.snapshotBackground();
      data.forEach((d, i) => {
        const x = startX + i * (barWidth + barGap);
        const barHeight = d.value * scaleY * progress;
        const y = chartBottom - barHeight;
        if (barHeight <= 0) return;
        const active = this.isActive(d, i);
        const r = Math.min(barRadius || 6, barHeight / 2);
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + barWidth - r, y);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + r);
        ctx.lineTo(x + barWidth, y + barHeight);
        ctx.lineTo(x, y + barHeight);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        if (contrast && !active) {
          const isDark = theme.name === "midnight";
          ctx.fillStyle = isDark ? "rgba(255,255,240,0.08)" : "rgba(0,0,0,0.06)";
          ctx.fill();
          ctx.strokeStyle = isDark ? "rgba(255,255,240,0.06)" : "rgba(0,0,0,0.04)";
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          ctx.save();
          ctx.clip();
          const gc = theme.gradients[i % theme.gradients.length];
          ctx.fillStyle = gc[0];
          ctx.fillRect(x, y, barWidth, barHeight);
          this.drawLavaBlobs(x, y, barWidth, barHeight, gc, i);
          ctx.restore();
        }
        if (showValues && progress > 0.3) {
          const a = Math.min(1, (progress - 0.3) * 1.43);
          ctx.globalAlpha = a;
          const cp = Math.min(1, (progress - 0.3) / 0.7);
          const ec = 1 - Math.pow(1 - cp, 2);
          const vt = valuePrefix + this.formatNumber(d.value * ec) + valueSuffix;
          if (valuesOnBar && barHeight > 35) {
            const isDark = theme.name === "midnight";
            ctx.fillStyle = contrast && !active ? isDark ? "rgba(255,255,240,0.25)" : "rgba(0,0,0,0.2)" : isDark ? "rgba(10,10,15,0.75)" : "rgba(255,255,255,0.9)";
            ctx.font = active ? `700 16px ${theme.fontFamily}` : `600 14px ${theme.fontFamily}`;
            ctx.textAlign = "center";
            ctx.fillText(vt, x + barWidth / 2, y + 22);
          } else {
            if (active) {
              const gc = theme.gradients[i % theme.gradients.length];
              const tg = ctx.createLinearGradient(x, 0, x + barWidth, 0);
              tg.addColorStop(0, gc[0]);
              tg.addColorStop(1, gc[1]);
              ctx.fillStyle = tg;
              ctx.font = `700 18px ${theme.fontFamily}`;
            } else {
              ctx.fillStyle = theme.textSource;
              ctx.font = `500 14px ${theme.fontFamily}`;
            }
            ctx.textAlign = "center";
            ctx.fillText(vt, x + barWidth / 2, y - 12);
          }
          ctx.globalAlpha = 1;
        }
      });
    }
    drawLavaBlobs(x, y, w, h, colors, seed) {
      const { ctx } = this;
      const s = (n) => {
        let v = Math.sin(seed * 127.1 + n * 311.7) * 43758.5453;
        return v - Math.floor(v);
      };
      for (let i = 0; i < 5; i++) {
        const bx = x + w * (0.1 + s(i * 3) * 0.8), by = y + h * (0.1 + s(i * 3 + 1) * 0.8);
        const radius = Math.max(w, h) * (0.35 + s(i * 3 + 2) * 0.55), color = colors[i % colors.length];
        const rg = ctx.createRadialGradient(bx, by, 0, bx, by, radius);
        rg.addColorStop(0, color);
        rg.addColorStop(0.5, color + "99");
        rg.addColorStop(1, color + "00");
        ctx.globalCompositeOperation = "source-atop";
        ctx.fillStyle = rg;
        ctx.fillRect(x, y, w, h);
        ctx.globalCompositeOperation = "source-over";
      }
    }
    formatNumber(n) {
      if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
      if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
      if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
      return n.toLocaleString();
    }
    truncateLabel(label, maxWidth) {
      const { ctx, theme } = this;
      ctx.font = `400 11px ${theme.monoFamily}`;
      if (ctx.measureText(label).width <= maxWidth) return label;
      const p = label.split(" ");
      if (p.length > 1 && ctx.measureText(p[0]).width <= maxWidth) return p[0];
      let t = label;
      while (t.length > 3 && ctx.measureText(t + "..").width > maxWidth) t = t.slice(0, -1);
      return t + "..";
    }
  };

  // src/charts/LineChart.ts
  var LineChart = class extends BaseChart {
    lineConfig;
    constructor(container, config) {
      super(container, config);
      this.lineConfig = { showDots: true, showArea: true, ...config };
      this.render();
    }
    render() {
      this.animate((progress) => this.draw(progress));
    }
    draw(progress) {
      const { ctx, width, height, theme, padding, lineConfig } = this;
      const { data: series, showDots, showArea, yPrefix = "", ySuffix = "" } = lineConfig;
      this.drawBackground();
      this.drawTitle();
      const chartTop = padding.top + 8;
      const chartBottom = height - padding.bottom - 20;
      const chartLeft = padding.left + 50;
      const chartRight = width - padding.right;
      const chartWidth = chartRight - chartLeft;
      const chartHeight = chartBottom - chartTop;
      const allY = series.flatMap((s) => s.data.map((d) => d.y));
      const minY = Math.min(...allY) * 0.95;
      const maxY = Math.max(...allY) * 1.05;
      const yRange = maxY - minY || 1;
      const allX = series[0]?.data.map((d) => Number(d.x)) || [];
      const minX = Math.min(...allX);
      const maxX = Math.max(...allX);
      const xRange = maxX - minX || 1;
      const yTicks = 5;
      ctx.strokeStyle = theme.grid;
      ctx.lineWidth = 1;
      for (let i = 0; i <= yTicks; i++) {
        const frac = i / yTicks;
        const y = chartBottom - frac * chartHeight;
        const val = minY + frac * yRange;
        ctx.beginPath();
        ctx.moveTo(chartLeft, y);
        ctx.lineTo(chartRight, y);
        ctx.stroke();
        ctx.fillStyle = theme.textSecondary;
        ctx.font = `400 10px ${theme.monoFamily}`;
        ctx.textAlign = "right";
        ctx.fillText(yPrefix + this.formatVal(val) + ySuffix, chartLeft - 8, y + 4);
      }
      const xLabelCount = Math.min(allX.length, 8);
      const xStep = Math.max(1, Math.floor(allX.length / xLabelCount));
      ctx.fillStyle = theme.textSecondary;
      ctx.font = `400 10px ${theme.monoFamily}`;
      ctx.textAlign = "center";
      for (let i = 0; i < allX.length; i += xStep) {
        const px = chartLeft + (allX[i] - minX) / xRange * chartWidth;
        ctx.fillText(String(allX[i]), px, chartBottom + 16);
      }
      ctx.strokeStyle = theme.textSecondary + "40";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(chartLeft, chartBottom);
      ctx.lineTo(chartRight, chartBottom);
      ctx.stroke();
      if (series.length > 1) {
        let legendX = chartLeft;
        const legendY = chartBottom + 32;
        series.forEach((s, si) => {
          const color = s.color || theme.gradients[si % theme.gradients.length][0];
          ctx.fillStyle = color;
          ctx.fillRect(legendX, legendY - 4, 12, 3);
          ctx.fillStyle = theme.textSecondary;
          ctx.font = `400 10px ${theme.monoFamily}`;
          ctx.textAlign = "left";
          ctx.fillText(s.label, legendX + 16, legendY);
          legendX += ctx.measureText(s.label).width + 32;
        });
      }
      this.drawSource();
      this.snapshotBackground();
      series.forEach((s, si) => {
        const color = s.color || theme.gradients[si % theme.gradients.length][0];
        const gradColors = theme.gradients[si % theme.gradients.length];
        const points = [];
        s.data.forEach((d) => {
          const px = chartLeft + (Number(d.x) - minX) / xRange * chartWidth;
          const py = chartBottom - (d.y - minY) / yRange * chartHeight;
          points.push([px, py]);
        });
        const visibleCount = Math.max(1, Math.floor(points.length * progress));
        const visible = points.slice(0, visibleCount);
        if (showArea && visible.length > 1) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(visible[0][0], chartBottom);
          visible.forEach(([x, y]) => ctx.lineTo(x, y));
          ctx.lineTo(visible[visible.length - 1][0], chartBottom);
          ctx.closePath();
          ctx.clip();
          const baseGrad = ctx.createLinearGradient(0, chartTop, 0, chartBottom);
          baseGrad.addColorStop(0, gradColors[0] + "50");
          baseGrad.addColorStop(1, gradColors[0] + "05");
          ctx.fillStyle = baseGrad;
          ctx.fillRect(chartLeft, chartTop, chartWidth, chartHeight);
          const areaMinX = visible[0][0];
          const areaMaxX = visible[visible.length - 1][0];
          const areaW = areaMaxX - areaMinX;
          const blobCount = 6;
          for (let i = 0; i < blobCount; i++) {
            let v = Math.sin(si * 127.1 + i * 311.7) * 43758.5453;
            const rand = v - Math.floor(v);
            let v2 = Math.sin(si * 127.1 + (i * 3 + 1) * 311.7) * 43758.5453;
            const rand2 = v2 - Math.floor(v2);
            let v3 = Math.sin(si * 127.1 + (i * 3 + 2) * 311.7) * 43758.5453;
            const rand3 = v3 - Math.floor(v3);
            const bx = areaMinX + areaW * (0.05 + rand * 0.9);
            const by = chartTop + chartHeight * (0.2 + rand2 * 0.6);
            const radius = chartHeight * (0.3 + rand3 * 0.4);
            const blobColor = gradColors[i % gradColors.length];
            const radGrad = ctx.createRadialGradient(bx, by, 0, bx, by, radius);
            radGrad.addColorStop(0, blobColor + "60");
            radGrad.addColorStop(0.5, blobColor + "30");
            radGrad.addColorStop(1, blobColor + "00");
            ctx.fillStyle = radGrad;
            ctx.fillRect(chartLeft, chartTop, chartWidth, chartHeight);
          }
          ctx.restore();
        }
        if (visible.length > 1) {
          ctx.beginPath();
          ctx.moveTo(visible[0][0], visible[0][1]);
          for (let i = 1; i < visible.length; i++) {
            ctx.lineTo(visible[i][0], visible[i][1]);
          }
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.5;
          ctx.lineJoin = "round";
          ctx.lineCap = "round";
          ctx.stroke();
        }
        if (showDots && progress > 0.8) {
          const dotAlpha = (progress - 0.8) * 5;
          ctx.globalAlpha = dotAlpha;
          visible.forEach(([x, y]) => {
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = theme.bg;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          });
          ctx.globalAlpha = 1;
        }
      });
    }
    formatVal(n) {
      if (Math.abs(n) >= 1e12) return (n / 1e12).toFixed(1) + "T";
      if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(1) + "B";
      if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1) + "M";
      if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + "K";
      return n.toFixed(0);
    }
  };

  // src/charts/HBarChart.ts
  var HBarChart = class extends BaseChart {
    hbarConfig;
    constructor(container, config) {
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
    isActive(d, i) {
      const { data, highlightTop, highlightLine, showRank } = this.hbarConfig;
      if (highlightLine !== void 0) return i === highlightLine - 1;
      if (highlightTop !== void 0) return i < highlightTop;
      if (showRank) return i < 3;
      if (data.some((dd) => dd.highlight)) return !!d.highlight;
      return true;
    }
    hasContrast() {
      const { data, highlightTop, highlightLine, showRank } = this.hbarConfig;
      if (highlightLine !== void 0) return true;
      if (highlightTop !== void 0) return highlightTop < data.length;
      if (showRank) return data.length > 3;
      return data.some((d) => d.highlight);
    }
    draw(progress) {
      const { ctx, width, height, theme, padding, hbarConfig } = this;
      const { data, valuePrefix = "", valueSuffix = "", barHeight = 36, valuesOnBar, showRank } = hbarConfig;
      this.drawBackground();
      this.drawTitle();
      const chartTop = padding.top + 8;
      const rankWidth = showRank ? 36 : 0;
      const labelWidth = 120;
      const chartLeft = padding.left + rankWidth + labelWidth;
      const chartRight = width - padding.right - 70;
      const chartWidth = chartRight - chartLeft;
      const barGap = 8;
      const maxVal = Math.max(...data.map((d) => d.value));
      const contrast = this.hasContrast();
      data.forEach((d, i) => {
        const y = chartTop + i * (barHeight + barGap);
        const active = this.isActive(d, i);
        if (showRank) {
          const rankX = padding.left;
          const rankY = y + barHeight / 2;
          if (active) {
            const gc = theme.gradients[i % theme.gradients.length];
            const pillW = 26, pillH = 18;
            const grad = ctx.createLinearGradient(rankX, rankY - pillH / 2, rankX + pillW, rankY - pillH / 2);
            grad.addColorStop(0, gc[0]);
            grad.addColorStop(1, gc[1]);
            ctx.beginPath();
            ctx.roundRect(rankX, rankY - pillH / 2, pillW, pillH, 9);
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.fillStyle = theme.name === "midnight" ? "rgba(10,10,15,0.8)" : "rgba(255,255,255,0.9)";
            ctx.font = `700 10px ${theme.fontFamily}`;
            ctx.textAlign = "center";
            ctx.fillText("#" + (i + 1), rankX + pillW / 2, rankY + 3.5);
          } else {
            ctx.fillStyle = theme.textSource;
            ctx.font = `400 10px ${theme.monoFamily}`;
            ctx.textAlign = "center";
            ctx.fillText("#" + (i + 1), rankX + 13, rankY + 4);
          }
        }
        ctx.fillStyle = contrast && !active ? theme.textSource : theme.textSecondary;
        ctx.font = active ? `500 12px ${theme.fontFamily}` : `400 12px ${theme.fontFamily}`;
        ctx.textAlign = "right";
        ctx.fillText(d.label, chartLeft - 12, y + barHeight / 2 + 4);
      });
      this.drawSource();
      this.snapshotBackground();
      data.forEach((d, i) => {
        const y = chartTop + i * (barHeight + barGap);
        const barW = d.value / maxVal * chartWidth * progress;
        if (barW <= 0) return;
        const active = this.isActive(d, i);
        const gc = theme.gradients[i % theme.gradients.length];
        const r = Math.min(4, barW / 2);
        ctx.beginPath();
        ctx.moveTo(chartLeft, y);
        ctx.lineTo(chartLeft + barW - r, y);
        ctx.quadraticCurveTo(chartLeft + barW, y, chartLeft + barW, y + r);
        ctx.lineTo(chartLeft + barW, y + barHeight - r);
        ctx.quadraticCurveTo(chartLeft + barW, y + barHeight, chartLeft + barW - r, y + barHeight);
        ctx.lineTo(chartLeft, y + barHeight);
        ctx.closePath();
        if (contrast && !active) {
          const isDark = theme.name === "midnight";
          ctx.fillStyle = isDark ? "rgba(255,255,240,0.08)" : "rgba(0,0,0,0.06)";
          ctx.fill();
          ctx.strokeStyle = isDark ? "rgba(255,255,240,0.06)" : "rgba(0,0,0,0.04)";
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          ctx.save();
          ctx.clip();
          ctx.fillStyle = gc[0];
          ctx.fillRect(chartLeft, y, barW, barHeight);
          this.drawLavaBlobs(chartLeft, y, barW, barHeight, gc, i);
          ctx.restore();
        }
        if (progress > 0.3) {
          const a = Math.min(1, (progress - 0.3) * 1.43);
          ctx.globalAlpha = a;
          const cp = Math.min(1, (progress - 0.3) / 0.7);
          const ec = 1 - Math.pow(1 - cp, 2);
          const vt = valuePrefix + this.formatNumber(d.value * ec) + valueSuffix;
          if (valuesOnBar && barW > 70) {
            const isDark = theme.name === "midnight";
            ctx.fillStyle = contrast && !active ? isDark ? "rgba(255,255,240,0.25)" : "rgba(0,0,0,0.2)" : isDark ? "rgba(10,10,15,0.75)" : "rgba(255,255,255,0.9)";
            ctx.font = active ? `700 14px ${theme.fontFamily}` : `600 12px ${theme.fontFamily}`;
            ctx.textAlign = "right";
            ctx.fillText(vt, chartLeft + barW - 10, y + barHeight / 2 + 5);
          } else {
            if (active) {
              const tg = ctx.createLinearGradient(chartLeft + barW + 8, 0, chartLeft + barW + 70, 0);
              tg.addColorStop(0, gc[0]);
              tg.addColorStop(1, gc[1]);
              ctx.fillStyle = tg;
              ctx.font = `700 14px ${theme.fontFamily}`;
            } else {
              ctx.fillStyle = theme.textSource;
              ctx.font = `400 12px ${theme.fontFamily}`;
            }
            ctx.textAlign = "left";
            ctx.fillText(vt, chartLeft + barW + 8, y + barHeight / 2 + 5);
          }
          ctx.globalAlpha = 1;
        }
      });
    }
    drawLavaBlobs(x, y, w, h, colors, seed) {
      const { ctx } = this;
      const s = (n) => {
        let v = Math.sin(seed * 127.1 + n * 311.7) * 43758.5453;
        return v - Math.floor(v);
      };
      for (let i = 0; i < 6; i++) {
        const bx = x + w * (0.05 + s(i * 3) * 0.9), by = y + h * (0.1 + s(i * 3 + 1) * 0.8);
        const radius = Math.max(w * 0.3, h) * (0.4 + s(i * 3 + 2) * 0.5), color = colors[i % colors.length];
        const rg = ctx.createRadialGradient(bx, by, 0, bx, by, radius);
        rg.addColorStop(0, color);
        rg.addColorStop(0.5, color + "99");
        rg.addColorStop(1, color + "00");
        ctx.globalCompositeOperation = "source-atop";
        ctx.fillStyle = rg;
        ctx.fillRect(x, y, w, h);
        ctx.globalCompositeOperation = "source-over";
      }
    }
    formatNumber(n) {
      if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
      if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
      if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
      return n.toLocaleString();
    }
  };

  // src/charts/StatCard.ts
  var StatCard = class extends BaseChart {
    statConfig;
    constructor(container, config) {
      config.height = config.height || 200;
      super(container, config);
      this.statConfig = config;
      this.render();
    }
    render() {
      this.animate((progress) => this.draw(progress), 600);
    }
    draw(progress) {
      const { ctx, width, height, theme, statConfig } = this;
      const { value, label, delta, deltaPositive, prefix = "", suffix = "" } = statConfig.data;
      this.drawBackground();
      const numericVal = typeof value === "number" ? value : parseFloat(String(value));
      let displayVal;
      if (!isNaN(numericVal) && typeof value === "number") {
        const current = numericVal * progress;
        displayVal = prefix + this.formatBigNumber(current) + suffix;
      } else {
        displayVal = prefix + String(value) + suffix;
      }
      if (this.config.title) {
        ctx.fillStyle = theme.textSecondary;
        ctx.font = `400 11px ${theme.monoFamily}`;
        ctx.textAlign = "left";
        ctx.fillText(this.config.title.toUpperCase(), this.padding.left, 24);
      }
      ctx.fillStyle = theme.textSecondary;
      ctx.font = `400 14px ${theme.fontFamily}`;
      ctx.textAlign = "center";
      ctx.fillText(label, width / 2, height / 2 + 25);
      if (delta && progress > 0.7) {
        const alpha = (progress - 0.7) * 3.3;
        ctx.globalAlpha = Math.min(1, alpha);
        const isPos = deltaPositive !== void 0 ? deltaPositive : delta.startsWith("+");
        const badgeColor = isPos ? "#10b981" : "#ef4444";
        ctx.fillStyle = badgeColor + "22";
        const deltaWidth = ctx.measureText(delta).width + 16;
        const badgeX = width / 2 - deltaWidth / 2;
        const badgeY = height / 2 + 38;
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, deltaWidth, 22, 11);
        ctx.fill();
        ctx.fillStyle = badgeColor;
        ctx.font = `600 11px ${theme.monoFamily}`;
        ctx.textAlign = "center";
        ctx.fillText(delta, width / 2, badgeY + 15);
        ctx.globalAlpha = 1;
      }
      this.drawSource();
      this.snapshotBackground();
      ctx.font = `700 48px ${theme.fontFamily}`;
      ctx.textAlign = "center";
      const metrics = ctx.measureText(displayVal);
      const textX = width / 2;
      const textY = height / 2 - 5;
      const gradColors = theme.highlightGradient;
      const textWidth = metrics.width;
      const grad = ctx.createLinearGradient(
        textX - textWidth / 2,
        0,
        textX + textWidth / 2,
        0
      );
      grad.addColorStop(0, gradColors[0]);
      grad.addColorStop(1, gradColors[1]);
      ctx.fillStyle = grad;
      ctx.fillText(displayVal, textX, textY);
    }
    formatBigNumber(n) {
      if (n >= 1e12) return (n / 1e12).toFixed(1) + "T";
      if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
      if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
      if (n >= 1e3) return (n / 1e3).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return Math.round(n).toLocaleString();
    }
  };

  // src/charts/RadarChart.ts
  var RadarChart = class extends BaseChart {
    radarConfig;
    constructor(container, config) {
      super(container, config);
      this.radarConfig = config;
      this.render();
    }
    render() {
      this.animate((progress) => this.draw(progress));
    }
    draw(progress) {
      const { ctx, width, height, theme, padding } = this;
      const { data } = this.radarConfig;
      const { axes, datasets, maxValue } = data;
      const n = axes.length;
      if (n < 3) return;
      this.drawBackground();
      this.drawTitle();
      const cx = width / 2;
      const cy = padding.top + (height - padding.top - padding.bottom) / 2 + 8;
      const radius = Math.min(
        (width - padding.left - padding.right) / 2 - 40,
        (height - padding.top - padding.bottom) / 2 - 30
      );
      const max = maxValue || Math.max(...datasets.flatMap((d) => d.values)) * 1.1;
      const angleStep = Math.PI * 2 / n;
      const startAngle = -Math.PI / 2;
      const rings = 5;
      ctx.strokeStyle = theme.grid;
      ctx.lineWidth = 1;
      for (let r = 1; r <= rings; r++) {
        const ringR = radius * r / rings;
        ctx.beginPath();
        for (let i = 0; i <= n; i++) {
          const angle = startAngle + i * angleStep;
          const x = cx + Math.cos(angle) * ringR;
          const y = cy + Math.sin(angle) * ringR;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      for (let i = 0; i < n; i++) {
        const angle = startAngle + i * angleStep;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      ctx.fillStyle = theme.textSecondary;
      ctx.font = `500 11px ${theme.monoFamily}`;
      for (let i = 0; i < n; i++) {
        const angle = startAngle + i * angleStep;
        const labelR = radius + 18;
        const x = cx + Math.cos(angle) * labelR;
        const y = cy + Math.sin(angle) * labelR;
        if (Math.abs(Math.cos(angle)) < 0.1) {
          ctx.textAlign = "center";
        } else if (Math.cos(angle) > 0) {
          ctx.textAlign = "left";
        } else {
          ctx.textAlign = "right";
        }
        ctx.textBaseline = Math.abs(Math.sin(angle)) < 0.1 ? "middle" : Math.sin(angle) < 0 ? "bottom" : "top";
        ctx.fillText(axes[i], x, y);
      }
      this.drawSource();
      this.snapshotBackground();
      const hasHighlight = datasets.some((d) => d.highlight);
      datasets.forEach((dataset, di) => {
        const active = !hasHighlight || dataset.highlight;
        const points = [];
        for (let i = 0; i < n; i++) {
          const angle = startAngle + i * angleStep;
          const val = (dataset.values[i] || 0) / max;
          const r = val * radius * progress;
          points.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]);
        }
        ctx.beginPath();
        points.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p[0], p[1]);
          else ctx.lineTo(p[0], p[1]);
        });
        ctx.closePath();
        if (active) {
          const gc = dataset.highlight ? theme.highlightGradient : theme.gradients[di % theme.gradients.length];
          const fillGrad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
          fillGrad.addColorStop(0, gc[0] + "55");
          fillGrad.addColorStop(1, gc[1] + "55");
          ctx.fillStyle = fillGrad;
          ctx.fill();
          const strokeGrad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
          strokeGrad.addColorStop(0, gc[0]);
          strokeGrad.addColorStop(1, gc[1]);
          ctx.strokeStyle = strokeGrad;
          ctx.lineWidth = 2.5;
          ctx.stroke();
          points.forEach((p) => {
            ctx.beginPath();
            ctx.arc(p[0], p[1], 4, 0, Math.PI * 2);
            ctx.fillStyle = gc[0];
            ctx.fill();
          });
        } else {
          const isDark = theme.name === "midnight";
          ctx.fillStyle = isDark ? "rgba(255,255,240,0.04)" : "rgba(0,0,0,0.03)";
          ctx.fill();
          ctx.strokeStyle = isDark ? "rgba(255,255,240,0.15)" : "rgba(0,0,0,0.1)";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      });
      if (datasets.length > 1) {
        const legendY = height - padding.bottom + 4;
        let legendX = padding.left;
        ctx.font = `500 11px ${theme.fontFamily}`;
        datasets.forEach((dataset, di) => {
          const active = !hasHighlight || dataset.highlight;
          const gc = dataset.highlight ? theme.highlightGradient : theme.gradients[di % theme.gradients.length];
          ctx.fillStyle = active ? gc[0] : theme.textSource;
          ctx.fillRect(legendX, legendY - 4, 12, 3);
          ctx.fillStyle = active ? theme.textSecondary : theme.textSource;
          ctx.textAlign = "left";
          ctx.fillText(dataset.label, legendX + 16, legendY);
          legendX += ctx.measureText(dataset.label).width + 36;
        });
      }
    }
  };

  // src/charts/DonutChart.ts
  var DonutChart = class extends BaseChart {
    donutConfig;
    constructor(container, config) {
      super(container, config);
      this.donutConfig = { ringWidth: 0.35, ...config };
      this.render();
    }
    render() {
      this.animate((progress) => this.draw(progress));
    }
    draw(progress) {
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
    drawGauge(cx, cy, outerR, innerR, progress) {
      const { ctx, theme } = this;
      const val = Math.min(100, Math.max(0, this.donutConfig.gaugeValue || 0));
      const sweepAngle = Math.PI * 1.5;
      const startAngle = Math.PI * 0.75;
      const endAngle = startAngle + sweepAngle;
      const fillAngle = startAngle + sweepAngle * (val / 100) * progress;
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, startAngle, endAngle);
      ctx.arc(cx, cy, innerR, endAngle, startAngle, true);
      ctx.closePath();
      const isDark = theme.name === "midnight";
      ctx.fillStyle = isDark ? "rgba(255,255,240,0.05)" : "rgba(0,0,0,0.04)";
      ctx.fill();
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
        this.drawLavaInArc(cx, cy, outerR, gc);
        ctx.restore();
      }
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
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(displayVal + "", cx, cy - 6);
        if (this.donutConfig.centerLabel) {
          ctx.fillStyle = theme.textSecondary;
          ctx.font = `400 13px ${theme.fontFamily}`;
          ctx.fillText(this.donutConfig.centerLabel, cx, cy + outerR * 0.25);
        }
        ctx.globalAlpha = 1;
      }
    }
    drawDonut(cx, cy, outerR, innerR, progress) {
      const { ctx, theme } = this;
      const { data } = this.donutConfig;
      const total = data.reduce((s, d) => s + d.value, 0);
      const hasHighlight = data.some((d) => d.highlight);
      let currentAngle = -Math.PI / 2;
      data.forEach((d, i) => {
        const sliceAngle = d.value / total * Math.PI * 2 * progress;
        const endAngle = currentAngle + sliceAngle;
        const active = !hasHighlight || d.highlight;
        ctx.beginPath();
        ctx.arc(cx, cy, outerR, currentAngle, endAngle);
        ctx.arc(cx, cy, innerR, endAngle, currentAngle, true);
        ctx.closePath();
        if (active) {
          const gc = d.highlight ? theme.highlightGradient : theme.gradients[i % theme.gradients.length];
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
          const isDark = theme.name === "midnight";
          ctx.fillStyle = isDark ? "rgba(255,255,240,0.06)" : "rgba(0,0,0,0.04)";
          ctx.fill();
        }
        ctx.strokeStyle = theme.bg;
        ctx.lineWidth = 2;
        ctx.stroke();
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
          ctx.textAlign = isRight ? "left" : "right";
          ctx.textBaseline = "middle";
          const pct = Math.round(d.value / total * 100);
          ctx.fillText(`${d.label} ${pct}%`, lx + (isRight ? 4 : -4), ly);
          ctx.globalAlpha = 1;
        }
        currentAngle = endAngle;
      });
      if (this.donutConfig.centerValue && progress > 0.5) {
        const a = Math.min(1, (progress - 0.5) * 2);
        ctx.globalAlpha = a;
        const gc = theme.highlightGradient;
        const tg = ctx.createLinearGradient(cx - 30, cy, cx + 30, cy);
        tg.addColorStop(0, gc[0]);
        tg.addColorStop(1, gc[1]);
        ctx.fillStyle = tg;
        ctx.font = `700 ${Math.round(innerR * 0.55)}px ${theme.fontFamily}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.donutConfig.centerValue, cx, cy - 4);
        if (this.donutConfig.centerLabel) {
          ctx.fillStyle = theme.textSecondary;
          ctx.font = `400 12px ${theme.fontFamily}`;
          ctx.fillText(this.donutConfig.centerLabel, cx, cy + innerR * 0.35);
        }
        ctx.globalAlpha = 1;
      }
    }
    drawLavaInArc(cx, cy, r, colors) {
      const { ctx } = this;
      for (let i = 0; i < 4; i++) {
        const angle = i / 4 * Math.PI * 2 + 0.7;
        const bx = cx + Math.cos(angle) * r * 0.5;
        const by = cy + Math.sin(angle) * r * 0.5;
        const blobR = r * (0.4 + i * 0.15);
        const color = colors[i % colors.length];
        const rg = ctx.createRadialGradient(bx, by, 0, bx, by, blobR);
        rg.addColorStop(0, color);
        rg.addColorStop(0.5, color + "88");
        rg.addColorStop(1, color + "00");
        ctx.globalCompositeOperation = "source-atop";
        ctx.fillStyle = rg;
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
        ctx.globalCompositeOperation = "source-over";
      }
    }
  };

  // src/charts/HeatmapChart.ts
  var HeatmapChart = class extends BaseChart {
    heatConfig;
    constructor(container, config) {
      super(container, config);
      this.heatConfig = { showValues: false, cellRadius: 4, ...config };
      this.padding = { top: 60, right: 24, bottom: 24, left: 100 };
      this.render();
    }
    render() {
      this.animate((progress) => this.draw(progress), 600);
    }
    draw(progress) {
      const { ctx, width, height, theme, padding } = this;
      const { data, showValues, cellRadius } = this.heatConfig;
      const { rows, cols, values } = data;
      this.drawBackground();
      this.drawTitle();
      const chartTop = padding.top + 24;
      const chartBottom = height - padding.bottom;
      const chartLeft = padding.left;
      const chartRight = width - padding.right;
      const chartWidth = chartRight - chartLeft;
      const chartHeight = chartBottom - chartTop;
      const cellW = chartWidth / cols.length;
      const cellH = chartHeight / rows.length;
      const gap = 2;
      const r = Math.min(cellRadius || 4, cellW / 4, cellH / 4);
      const flat = values.flat();
      const minVal = Math.min(...flat);
      const maxVal = Math.max(...flat);
      const range = maxVal - minVal || 1;
      ctx.fillStyle = theme.textSecondary;
      ctx.font = `500 10px ${theme.monoFamily}`;
      ctx.textAlign = "center";
      cols.forEach((col, ci) => {
        const x = chartLeft + ci * cellW + cellW / 2;
        ctx.fillText(col, x, chartTop - 8);
      });
      ctx.textAlign = "right";
      rows.forEach((row, ri) => {
        const y = chartTop + ri * cellH + cellH / 2 + 4;
        ctx.fillText(row, chartLeft - 10, y);
      });
      this.drawSource();
      this.snapshotBackground();
      rows.forEach((_, ri) => {
        cols.forEach((_2, ci) => {
          const val = values[ri]?.[ci] ?? 0;
          const norm = (val - minVal) / range;
          const intensity = norm * progress;
          const x = chartLeft + ci * cellW + gap / 2;
          const y = chartTop + ri * cellH + gap / 2;
          const w = cellW - gap;
          const h = cellH - gap;
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.lineTo(x + w - r, y);
          ctx.quadraticCurveTo(x + w, y, x + w, y + r);
          ctx.lineTo(x + w, y + h - r);
          ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
          ctx.lineTo(x + r, y + h);
          ctx.quadraticCurveTo(x, y + h, x, y + h - r);
          ctx.lineTo(x, y + r);
          ctx.quadraticCurveTo(x, y, x + r, y);
          ctx.closePath();
          if (intensity < 0.05) {
            const isDark = theme.name === "midnight";
            ctx.fillStyle = isDark ? "rgba(255,255,240,0.03)" : "rgba(0,0,0,0.02)";
            ctx.fill();
          } else {
            ctx.save();
            ctx.clip();
            const gcIdx = Math.min(
              theme.gradients.length - 1,
              Math.floor(intensity * theme.gradients.length * 0.99)
            );
            const gc = theme.gradients[gcIdx];
            const grad = ctx.createLinearGradient(x, y, x + w, y + h);
            grad.addColorStop(0, gc[0] + this.alphaHex(intensity));
            grad.addColorStop(1, gc[1] + this.alphaHex(intensity));
            ctx.fillStyle = grad;
            ctx.fillRect(x, y, w, h);
            if (intensity > 0.6) {
              const s = (n) => {
                let v = Math.sin(ri * 127.1 + ci * 311.7 + n * 43.7) * 43758.5453;
                return v - Math.floor(v);
              };
              const bx = x + w * (0.2 + s(0) * 0.6);
              const by = y + h * (0.2 + s(1) * 0.6);
              const blobR = Math.max(w, h) * 0.6;
              const rg = ctx.createRadialGradient(bx, by, 0, bx, by, blobR);
              rg.addColorStop(0, gc[1]);
              rg.addColorStop(0.5, gc[1] + "66");
              rg.addColorStop(1, gc[1] + "00");
              ctx.globalCompositeOperation = "source-atop";
              ctx.fillStyle = rg;
              ctx.fillRect(x, y, w, h);
              ctx.globalCompositeOperation = "source-over";
            }
            ctx.restore();
          }
          if (showValues && progress > 0.5 && cellW > 30 && cellH > 20) {
            const a = Math.min(1, (progress - 0.5) * 2);
            ctx.globalAlpha = a;
            ctx.fillStyle = intensity > 0.5 ? theme.bg : theme.textSecondary;
            ctx.font = `500 ${Math.min(11, cellH * 0.4)}px ${theme.monoFamily}`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(this.formatCellValue(val), x + w / 2, y + h / 2);
            ctx.globalAlpha = 1;
          }
        });
      });
    }
    alphaHex(intensity) {
      const alpha = Math.round(intensity * 220 + 35);
      return alpha.toString(16).padStart(2, "0");
    }
    formatCellValue(v) {
      if (v >= 1e6) return (v / 1e6).toFixed(1) + "M";
      if (v >= 1e3) return (v / 1e3).toFixed(1) + "K";
      if (Number.isInteger(v)) return v + "";
      return v.toFixed(1);
    }
  };

  // src/charts/BumpChart.ts
  var BumpChart = class extends BaseChart {
    bumpConfig;
    constructor(container, config) {
      super(container, config);
      this.bumpConfig = config;
      this.padding = { top: 60, right: 90, bottom: 48, left: 90 };
      this.render();
    }
    render() {
      this.animate((progress) => this.draw(progress), 1e3);
    }
    isActive(series, idx) {
      const { data, highlightTop } = this.bumpConfig;
      if (highlightTop !== void 0) {
        const lastRank = series.ranks[series.ranks.length - 1];
        return lastRank <= highlightTop;
      }
      if (data.some((d) => d.highlight)) return !!series.highlight;
      return true;
    }
    hasContrast() {
      const { data, highlightTop } = this.bumpConfig;
      if (highlightTop !== void 0) return true;
      return data.some((d) => d.highlight);
    }
    draw(progress) {
      const { ctx, width, height, theme, padding } = this;
      const { data, periods } = this.bumpConfig;
      this.drawBackground();
      this.drawTitle();
      const nPeriods = data[0]?.ranks.length || 0;
      const maxRank = Math.max(...data.flatMap((d) => d.ranks));
      const chartTop = padding.top + 8;
      const chartBottom = height - padding.bottom - 20;
      const chartLeft = padding.left;
      const chartRight = width - padding.right;
      const chartWidth = chartRight - chartLeft;
      const chartHeight = chartBottom - chartTop;
      const rankY = (rank) => chartTop + (rank - 1) / (maxRank - 1 || 1) * chartHeight;
      const periodX = (i) => chartLeft + i / (nPeriods - 1 || 1) * chartWidth;
      ctx.strokeStyle = theme.grid;
      ctx.lineWidth = 1;
      for (let r = 1; r <= maxRank; r++) {
        const y = rankY(r);
        ctx.beginPath();
        ctx.moveTo(chartLeft - 8, y);
        ctx.lineTo(chartRight + 8, y);
        ctx.stroke();
        ctx.fillStyle = theme.textSource;
        ctx.font = `400 10px ${theme.monoFamily}`;
        ctx.textAlign = "right";
        ctx.fillText("#" + r, chartLeft - 14, y + 4);
      }
      ctx.fillStyle = theme.textSecondary;
      ctx.font = `500 11px ${theme.monoFamily}`;
      ctx.textAlign = "center";
      for (let i = 0; i < nPeriods; i++) {
        const label = periods?.[i] || i + 1 + "";
        ctx.fillText(label, periodX(i), chartBottom + 20);
      }
      this.drawSource();
      this.snapshotBackground();
      const contrast = this.hasContrast();
      const sorted = [...data.map((d, i) => ({ ...d, idx: i }))].sort((a, b) => {
        const aActive = this.isActive(a, a.idx) ? 1 : 0;
        const bActive = this.isActive(b, b.idx) ? 1 : 0;
        return aActive - bActive;
      });
      sorted.forEach((series) => {
        const active = this.isActive(series, series.idx);
        const gc = series.highlight ? theme.highlightGradient : theme.gradients[series.idx % theme.gradients.length];
        const visiblePeriods = Math.max(1, Math.floor(nPeriods * progress));
        const points = [];
        for (let i = 0; i < visiblePeriods; i++) {
          points.push([periodX(i), rankY(series.ranks[i])]);
        }
        if (visiblePeriods < nPeriods) {
          const frac = nPeriods * progress - visiblePeriods;
          if (frac > 0 && visiblePeriods > 0) {
            const prevX = periodX(visiblePeriods - 1);
            const prevY = rankY(series.ranks[visiblePeriods - 1]);
            const nextX = periodX(visiblePeriods);
            const nextY = rankY(series.ranks[visiblePeriods]);
            points.push([prevX + (nextX - prevX) * frac, prevY + (nextY - prevY) * frac]);
          }
        }
        if (points.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) {
          const [x0, y0] = points[i - 1];
          const [x1, y1] = points[i];
          const cpx = (x0 + x1) / 2;
          ctx.bezierCurveTo(cpx, y0, cpx, y1, x1, y1);
        }
        if (contrast && !active) {
          const isDark = theme.name === "midnight";
          ctx.strokeStyle = isDark ? "rgba(255,255,240,0.1)" : "rgba(0,0,0,0.08)";
          ctx.lineWidth = 2;
        } else {
          const grad = ctx.createLinearGradient(points[0][0], 0, points[points.length - 1][0], 0);
          grad.addColorStop(0, gc[0]);
          grad.addColorStop(1, gc[1]);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 3;
        }
        ctx.stroke();
        points.forEach((p, i) => {
          ctx.beginPath();
          ctx.arc(p[0], p[1], active ? 5 : 3, 0, Math.PI * 2);
          if (contrast && !active) {
            const isDark = theme.name === "midnight";
            ctx.fillStyle = isDark ? "rgba(255,255,240,0.12)" : "rgba(0,0,0,0.08)";
          } else {
            ctx.fillStyle = gc[i < points.length / 2 ? 0 : 1];
          }
          ctx.fill();
        });
        if (points.length > 0) {
          const [fx, fy] = points[0];
          ctx.fillStyle = contrast && !active ? theme.textSource : theme.textSecondary;
          ctx.font = contrast && !active ? `400 10px ${theme.monoFamily}` : `500 11px ${theme.monoFamily}`;
          ctx.textAlign = "right";
          ctx.textBaseline = "middle";
          ctx.fillText(series.label, fx - 12, fy);
        }
        if (progress > 0.9 && points.length >= nPeriods) {
          const a = Math.min(1, (progress - 0.9) * 10);
          ctx.globalAlpha = a;
          const [lx, ly] = points[points.length - 1];
          ctx.textAlign = "left";
          if (active) {
            const tg = ctx.createLinearGradient(lx, ly - 8, lx + 60, ly + 8);
            tg.addColorStop(0, gc[0]);
            tg.addColorStop(1, gc[1]);
            ctx.fillStyle = tg;
            ctx.font = `600 12px ${theme.fontFamily}`;
          } else {
            ctx.fillStyle = theme.textSource;
            ctx.font = `400 10px ${theme.monoFamily}`;
          }
          ctx.fillText(series.label, lx + 12, ly);
          ctx.globalAlpha = 1;
        }
      });
    }
  };

  // src/index.ts
  function create(container, config) {
    switch (config.type) {
      case "bar":
        return new BarChart(container, config);
      case "line":
        return new LineChart(container, config);
      case "hbar":
        return new HBarChart(container, config);
      case "stat":
        return new StatCard(container, config);
      case "radar":
        return new RadarChart(container, config);
      case "donut":
        return new DonutChart(container, config);
      case "heatmap":
        return new HeatmapChart(container, config);
      case "bump":
        return new BumpChart(container, config);
      default:
        console.error("DropThe Charts: unknown type", config.type);
    }
  }
  function init() {
    document.querySelectorAll("[data-dt-chart]").forEach((el) => {
      try {
        const config = JSON.parse(el.getAttribute("data-dt-chart") || "{}");
        create(el, config);
      } catch (e) {
        console.error("DropThe Charts: invalid config", e);
      }
    });
  }
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  }
  return __toCommonJS(index_exports);
})();
//# sourceMappingURL=dt-charts.js.map
